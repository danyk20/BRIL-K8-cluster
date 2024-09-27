import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription, empty as EmptyObservable, throwError, of } from 'rxjs';
import { tap, map, share, catchError, mergeMap} from 'rxjs/operators';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService, SourceParameter } from './data.service';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import { ChartWidget, WidgetConfig as ParentWidgetConfig } from 'app/widgets/base/chart-widget';
import { RangeEvent } from 'app/shared/range-form/range-form.component';
import { QuickDateOption } from 'app/shared/quick-date-form/quick-date-form.component'
declare var Plotly: any;

export interface WidgetConfig extends ParentWidgetConfig {
    yAxis2Enabled?: boolean;
    yAxis2Title?: string;
    database: string;
    refreshSize: number;
    liveWindow: number;
    aggregationThreshold: number;
    sources: Array<SourceParameter>;
    fillQueriesEnabled?: boolean;
    runQueriesEnabled?: boolean;
    tooltipInfo?: Array<ChartUtils.TooltipInfoField>;
    rangeQueries?: Array<{fieldname: string, label?: string}>;
    rangeRefresh?: {
        enabled: boolean,
        index: string,
        nestedPath?: string,
        documentType?: string,
        field: string,
        range: number
    },
    forceMarkers?: boolean;
    quickDateOptions?: Array<QuickDateOption>;
    aggregationAlgo?: string;
}


@Component({
    selector: 'wm-numeric-field-widget',
    templateUrl: './numeric-field.component.html',
    styleUrls: ['./numeric-field.component.css']
})
export class NumericFieldComponent extends ChartWidget implements OnInit, AfterViewInit {

    wi: WidgetConfig;

    queryParams;
    flatFields = [];
    series = [];
    detectors = [];
    fits = [];
    initialShowHideSeriesDone = false;

    info = {};
    labelAggregated = undefined;
    _aggregated = false;
    get aggregated() {
        return this._aggregated;
    }
    set aggregated(newVal) {
        this._aggregated = newVal;
        this.info = Object.assign({}, this.info, {aggregated: newVal});
    }

    constructor(
        protected eventBus: EventBusService,
        protected dataService: DataService) {
        super(eventBus);
    }

    ngOnInit() {
        super.ngOnInit({
            'refreshSize': 100,
            'liveWindow': 600000,
            'database': 'default',
            'sources': [],
            'fits': []
        });
        this.wi = <WidgetConfig>this.config['widget'];
        if (!this.wi.hasOwnProperty('quickDateOptions')) {
            this.wi.quickDateOptions = [
                {"unit": "hours", "duration": 2, "text": "Last 2 hours"},
                {"unit": "hours", "duration": 6, "text": "Last 6 hours"}];
        }
        this.queryParams = {
            database: this.wi.database,
            sources: this.wi.sources
        };
        this.wi.sources.forEach(s => {
            s.timestampField = s.timestampField || 'timestamp';
            s.extraFields = s.extraFields || [];
            this.flatFields = this.flatFields.concat(s.fields);
        });
        if (this.wi.hasOwnProperty('aggregationAlgo')) {
            if (this.wi.aggregationAlgo != 'sum' && this.wi.aggregationAlgo != 'avg' &&
                this.wi.aggregationAlgo != 'max' && this.wi.aggregationAlgo != 'min' &&
                this.wi.aggregationAlgo != 'value_count') {
                    this.wi.aggregationAlgo = 'avg';
            }
        }
        this.makeSeries();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.plot.nativeElement.on('plotly_legendclick', this.onLegendClick.bind(this));
        this.plot.nativeElement.on('plotly_relayout', this.onRelayout.bind(this));
        if (!this.wrapper.started) {
            this.refresh().subscribe();
        }
    }

    queryFromEvent(event) {
        if (event['type'] === 'range_query') {
            this.widgetComponent.log('Received range query', 'info');
            this.queryRange(event['payload']);
        } else if (event['type'] === 'time_range_query') {
            this.widgetComponent.log('Received time range query', 'info');
            this.queryDateRange(event['payload']);
        } else if (event['type'] === 'fill_run_ls_query') {
            if (this.wi.fillQueriesEnabled || this.wi.runQueriesEnabled) {
                this.widgetComponent.log('Received fill/run query', 'info');
                this.queryFillRun(event['payload']);
            }
        }
    }

    onRefreshEvent() {
        this.widgetComponent.stop();
        this.refresh().subscribe();
    }

    onStartEvent() {
        this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
    }

    onQueryError(error) {
        this.widgetComponent.log(String(error), 'danger');
        this.clearChart();
        this.enableInteraction();
        throw(error);
    }

    refresh(size?) {
        let obs;
        if (this.wi.rangeRefresh && this.wi.rangeRefresh.enabled) {
            const r = this.wi.rangeRefresh;
            obs = this.dataService.queryMaxValue(
                this.queryParams.database, r.index, r.documentType, r.nestedPath, r.field
            ).pipe(
                mergeMap(max => {
                    if (!max['value']) {
                        return throwError('Failed to get max for range refresh ' + JSON.stringify(r));
                    }
                    const range: RangeEvent = {
                        key: r.field,
                        min: max['value'] - r.range,
                        max: max['value'],
                        detectors: this.detectors,
                        fits: this.fits
                    };
                    this.widgetComponent.log('Querying range refresh:' + JSON.stringify(range),'info', 1000);
                    return of(range);
                }),
                map(this.queryRange.bind(this)),
                tap(this.enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this))
            );
        } else {
            size = size || this.wi.refreshSize;
            obs = this.dataService.queryNewest(this.queryParams, size).pipe(
                tap(() => this.aggregated = false),
                map(this.setData.bind(this)),
                tap(this.enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this)),
                share()
            );
        }
        this.disableInteraction();
        return obs;
    }

    setData(newData) {
        this.flatFields = [];
        this.queryParams.sources.forEach((source, i) => {
            const extra = this.makeSourceExtraFields(newData[i], source);
            const text = this.makeSourceText(newData[i]);
            const x = this.makeSourceXValues(newData[i], source);
            source.fields.forEach((field, j) => {
                const series = this.series[i][j];
                series.x = x;
                series.text = text;
                series._extra = extra;
                series.y = this.makeFieldYValues(newData[i], field);
                this.flatFields = this.flatFields.concat(field);
                if (field.errorField) {
                    series.error_y = this.makeFieldErrorBars(newData[i], field);
                }
            });
        });
        this.updateFieldSeparators();
        Plotly.redraw(this.plot.nativeElement, this.chartData);
        this.autorange();
    }

    clearChart() {
        this.queryParams.sources.forEach((source, i) => {
            source.fields.forEach((field, j) => {
                const series = this.series[i][j];
                series.x = [];
                series.y = [];
                series._extra = [];
                series.text = [];
            });
        });
        Plotly.redraw(this.plot.nativeElement, this.chartData);
    }

    queryRange(event: RangeEvent) {
        this.widgetComponent.stop();
        this.updateSources(event.detectors, event.fits);
        this.makeSeries();
        const obs = this.dataService.queryRange(
            this.queryParams, event.key, event.min, event.max).pipe(
                tap(() => this.aggregated = false),
                map(this.setData.bind(this)),
                tap(this.enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this)),
                share());
        this.disableInteraction();
        obs.subscribe();
        return obs;
    }

    queryDateRange(range: ChartUtils.DateRangeEvent) {
        this.widgetComponent.stop();
        let obs;
        if (range.msecTo - range.msecFrom > this.wi.aggregationThreshold) {
            obs = this.dataService.queryDateRangeAggregated(
                this.queryParams, this.chartTimestampToTs(range.strFrom), this.chartTimestampToTs(range.strTo), this.wi.aggregationAlgo).pipe(
                    tap(() => this.aggregated = true),
                );
        } else {
            obs = this.dataService.queryDateRange(
                this.queryParams, this.chartTimestampToTs(range.strFrom), this.chartTimestampToTs(range.strTo)).pipe(
                    tap(() => this.aggregated = false),
                );
        }
        obs = obs.pipe(
            map(this.setData.bind(this)),
            tap(this.enableInteraction.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share());
        this.disableInteraction();
        obs.subscribe();
        return obs;
    }

    queryFillRun(event) {
        this.widgetComponent.stop();
        const terms = [];
        if (event['run']) {
            this.queryParams.sources.forEach(s => {
                const term = {};
                term[s['runField']] = event['run'];
                terms.push(term);
            })
        } else if (event['fill']) {
            this.queryParams.sources.forEach(s => {
                const term = {};
                term[s['fillField']] = event['fill'];
                terms.push(term);
            })
        } else {
            this.widgetComponent.log('One of [FILL, RUN] must be specified', 'warning')
            return EmptyObservable();
        }
        this.widgetComponent.log('Querying timestamp extremes for FILL/RUN', 'info')
        this.disableInteraction();
        this.dataService.queryExtremesByTerms(this.queryParams, terms)
            .pipe(
                mergeMap(extremes => {
                    if (!extremes['min']['value'] || !extremes['max']['value']) {
                        return throwError('Failed to get timestamp extremes for FILL/RUN query. ' + JSON.stringify(event));
                    }
                    const min = extremes['min']['value_as_string'];
                    const max = extremes['max']['value_as_string'];
                    this.widgetComponent.log('Got timestamp extremes. ' + min + ', ' + max, 'info')
                    const range =  ChartUtils.makeQueryRangeFromStrings(min, max);
                    return of(range);
                }),
                map(this.queryDateRange.bind(this)),
                tap(this.enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this))
            )
            .subscribe();
    }

    updateLive() {
        if (this.series.length < 1 || this.aggregated) {
            this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
            return;
        }
        const lastXPerSource = this.getLastXPerSource();
        this.dataService.queryNewestSince(this.queryParams, lastXPerSource)
            .subscribe(resp => {
                this.queryParams.sources.forEach((source, i) => {
                    const hits = resp[i].filter(hit => hit[source.timestampField] !== lastXPerSource[i]);
                    if (hits.length < 1) {
                        return;
                    }
                    const x = this.makeSourceXValues(hits, source);
                    const extra = this.makeSourceExtraFields(hits, source);
                    const text = this.makeSourceText(hits);
                    source.fields.forEach((field, j) => {
                        const series = this.series[i][j];
                        series.x = series.x.concat(x);
                        series.y = series.y.concat(this.makeFieldYValues(hits, field));
                        series.text = series.text.concat(text);
                        Object.keys(series['_extra']).forEach(key => {
                            series['_extra'][key] = series['_extra'][key].concat(extra[key]);
                        });
                        if (field.errorField) {
                            series.error_y.array = series.error_y.array.concat(
                                this.makeFieldErrorBars(hits, field).array);
                        }
                        this.dropPointsOutsideLiveWindow(series);
                    });
                });
                this.updateFieldSeparators();
                this.setXZoomToLiveWindow();
                Plotly.redraw(this.plot.nativeElement, this.chartData);
            });
    }

    getLastXPerSource() {
        return this.series.map(s => {
            const x = s[0].x;
            return x[x.length -1];
        })
    }

    dropPointsOutsideLiveWindow(series) {
        const lastX = new Date(series.x[series.x.length -1]);
        const liveWindow = this.wi.liveWindow;
        let count = 0;
        let dropErrorValues = function() {};
        if (series.hasOwnProperty('error_y')) {
            dropErrorValues = function() {series.error_y.array.shift();};
        }
        while(lastX.getTime() - (new Date(series.x[0])).getTime() > liveWindow) {
            series.x.shift();
            series.y.shift();
            series.text.shift();
            Object.keys(series['_extra']).forEach(key => {
                series['_extra'][key].shift();
            });
            dropErrorValues();
            count += 1;
        }
    }

    setXZoomToLiveWindow(lastPerSource?) {
        if (!lastPerSource) {
            lastPerSource = this.getLastXPerSource();
        }
        lastPerSource = lastPerSource.map(x => (new Date(x)).getTime()).filter(x => Number.isFinite(x));
        const max = Math.max.apply(null, lastPerSource);
        if (!Number.isInteger(max)) {
            return;
        }
        const min = max - this.wi.liveWindow;
        const xaxis = this.plot.nativeElement['layout']['xaxis'];
        const newRange = [
            (new Date(min)).toISOString(),
            (new Date(max)).toISOString()];
        xaxis['range'] = newRange;
        xaxis['autorange'] = false;
        Plotly.relayout(this.plot.nativeElement, {xaxis: xaxis});
    }

    makeSeries() {
        this.chartData.length = 0;
        this.series.length = 0;
        this.queryParams.sources.forEach((s, i) => {
            const seriesOfCurrentSource = [];
            s.fields.forEach((field, j) => {
                const newSeries = {
                    x: [],
                    y: [],
                    _extra: [],
                    text: [],
                    name: field.seriesName || field.name,
                    type: 'scatter',
                    mode: (this.wi.forceMarkers || field.forceMarkers) ? 'lines+markers' : 'auto',
                    line: { width: field['lineWidth'] || 1, color: field['color']},
                    visible: (field['hidden'] ? 'legendonly' : true)
                };
                if (field['yAxis'] === 2) {
                    newSeries['yaxis'] = 'y2';
                }
                seriesOfCurrentSource.push(newSeries);
                this.chartData.push(newSeries);
            });
            this.series.push(seriesOfCurrentSource);
        });
    }

    onLegendClick(event) {
        this.flatFields[event.expandedIndex]['hidden'] = !this.flatFields[event.expandedIndex]['hidden'];
    }

    onRelayout(event): boolean {
        if (!this.aggregated) {
            return true;
        }
        const range = ChartUtils.makeQueryRangeFromZoomEvent(event);
        if (range) {
            this.disableInteraction();
            this.widgetComponent.log('X axis zoom changed with aggregated data. Requerying', 'info');
            this.queryDateRange(range)
                .pipe(tap(this.enableInteraction.bind(this)))
                .subscribe();
        }
        return false;
    }

    updateFieldSeparators(relayout=false) {
        return super.updateFieldSeparators(relayout, this.aggregated);
    }

    protected makeSourceXValues(sourceData, source) {
        return sourceData.map(hit => this.tsToChartTimestamp(hit[source.timestampField]));
    }

    protected makeFieldYValues(hits, field) {
        const result = hits.map(hit => hit[field.name]);
        if (result.length > 0) {
            // ES cannot store NaN values as numeric.
            // So, when a flashlist inserts a NaN, the webmonitor receives -300M
            // in it's place.
            // So the following code maps -300M values to null as a temporary fix..
            // (!) This should be removed after XDAQ encodes NaN to null.
            return result.map(value => value == -300000000 ? null : value);
        } else {
            return [null];
        }
    }

    protected makeFieldErrorBars(hits, field) {
        return {
            type: 'data',
            array: hits.map(hit => hit[field.errorField]),
            color: 'black',
            thickness: 1,
            symmetric: true
        }
    }

    protected makeSourceExtraFields(sourceData, source) {
        const extra = {};
        source.extraFields.forEach(field => {
            if (field.renameTo) {
                extra[field.renameTo] = sourceData.map(hit => hit[field.renameTo]);
            } else {
                extra[field.name] = sourceData.map(hit => hit[field.name]);
            }
        });
        return extra;
    }

    protected makeSourceText(sourceData) {
        const tooltipTextConfig = this.wi.tooltipInfo;
        if (!tooltipTextConfig) {
            return [];
        }
        return sourceData.map(point => ChartUtils.makeTooltipText(point, tooltipTextConfig));
    }

    // Update detector value in source parameters depending on user input
    protected updateSources(sources, fits) {
        
        if (!sources.length) {
            return;
        }

        let updatedSources = [];
        if (this.wi.database === 'analysis_store') {
            for (let source of sources) {
                let templateSource = JSON.parse(JSON.stringify(this.wi.sources[0]));
                templateSource.fields[0].seriesName = source;
                templateSource.terms["detector"] = source;

                if (fits.length) {
                    fits.forEach(fit => {
                        templateSource = JSON.parse(JSON.stringify(templateSource));
                        templateSource.fields[0].seriesName = source + '/' + fit;
                        templateSource.terms["fit"] = fit;
                        updatedSources.push(templateSource);
                    });
                }else {
                    templateSource.fields[0].seriesName = source;
                    updatedSources.push(templateSource);
                }
            }
        }else if (this.wi.database === 'main_daq_monitoring') {
            for (let source of sources) {
                let templateSource = JSON.parse(JSON.stringify(this.wi.sources[0]));
                templateSource.fields[0].seriesName = source;
                templateSource.terms["detectorname"] = source;
                updatedSources.push(templateSource);
            }
        }

        this.queryParams.sources = updatedSources;
    }
}
