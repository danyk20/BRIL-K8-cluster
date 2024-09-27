import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { Subscription, empty as emptyObservable, of, throwError } from 'rxjs';
import { map, tap, share, catchError, mergeMap } from 'rxjs/operators';
import { DatabaseService } from 'app/core/database.service';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService, Parameters as QueryParameters } from './data.service';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import { ChartWidget, WidgetConfig as ParentWidgetConfig } from 'app/widgets/base/chart-widget';
declare var Plotly: any;

export interface WidgetConfig extends ParentWidgetConfig, QueryParameters {
    errorField?: string;
    legendNames?: Array<string>;
    liveWindow?: number;
    refreshSize?: number;
    aggregationThreshold?: number;
    tooltipInfo?: Array<ChartUtils.TooltipInfoField>;
    fillQueriesEnabled?: boolean;
    runQueriesEnabled?: boolean;
    aggregationAlgo?: string;
    histogramAggregatedQuery?: boolean;
}

@Component({
    selector: 'wm-widget-array-lines',
    templateUrl: './array-lines.component.html',
    styleUrls: ['./array-lines.component.css']
})
export class ArrayLinesComponent extends ChartWidget implements OnInit, AfterViewInit {

    wi: WidgetConfig;
    queryParams: QueryParameters;
    reflow = () => undefined;
    _aggregated = false;
    set aggregated(newVal) {
        this._aggregated = newVal;
        this.info = Object.assign({}, this.info, {aggregated: newVal})
    }
    get aggregated() { return this._aggregated};
    info = {};

    constructor(
        protected db: DatabaseService,
        protected eventBus: EventBusService,
        protected dataService: DataService) {
        super(eventBus);
    }

    setupWidget() {
        this.wi = <WidgetConfig>super.setupWidget({
            'liveWindow': 600000,
            'refreshSize': 100,
            'series': [],
            'timestampField': 'timestamp'
        });
        this.queryParams = {
            database: this.wi.database,
            index: this.wi.index,
            documentType: this.wi.documentType,
            timestampField: this.wi.timestampField,
            field: this.wi.field,
            series: this.wi.series,
            nestedPath: this.wi.nestedPath,
            terms: this.wi.terms,
            fillField: this.wi.fillField,
            runField: this.wi.runField,
            errorField: this.wi.errorField,
            aggregationAlgo: this.wi.aggregationAlgo,
            extraFields: this.wi.extraFields || [],
            histogramAggregatedQuery: this.wi.histogramAggregatedQuery,
            aggregationQueryParams: this.wi.aggregationQueryParams || [],
        }
        if (this.wi.errorField) {
            this.queryParams.extraFields.push(this.wi.errorField);
        }
        if (this.wi.hasOwnProperty('aggregationAlgo')) {
            if (this.wi.aggregationAlgo != 'sum' && this.wi.aggregationAlgo != 'avg' &&
                this.wi.aggregationAlgo != 'max' && this.wi.aggregationAlgo != 'min' &&
                this.wi.aggregationAlgo != 'value_count' && this.wi.aggregationAlgo != 'extended_stats') {
                    this.wi.aggregationAlgo = 'avg';
            }
        }
        return this.wi;
    }

    ngAfterViewInit() {
        this.makeSeries();
        super.ngAfterViewInit();
        this.plot.nativeElement.on('plotly_relayout', this.onRelayout.bind(this));
        if (!this.wrapper.started) {
            this.refresh();
        }
    }

    queryFromEvent(event) {
        if (event['type'] === 'time_range_query') {
            this.widgetComponent.log('Received time range query', 'info');
            this.queryRange(event['payload']);
        } else if (event['type'] === 'fill_run_ls_query') {
            if (this.wi.fillQueriesEnabled || this.wi.runQueriesEnabled) {
                this.widgetComponent.log('Received FILL/RUN query', 'info');
                this.queryFillRun(event['payload']);
            }
        }
    }

    onRefreshEvent() {
        this.widgetComponent.stop();
        this.refresh();
    }

    onStartEvent() {
        this.updateLive();
    }

    onQueryError(error) {
        this.widgetComponent.log(String(error), 'danger');
        this.setChartData([]);
        throw(error);
    }

    refresh(size?) {
        size = Number.isInteger(size) ? size : this.wi.refreshSize || 50;
        this.disableInteraction();
        const obs = this.dataService.queryNewest(this.queryParams, size).pipe(
            tap(() => this.aggregated = false),
            tap(this.setChartData.bind(this)),
            tap(this.enableInteraction.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share());
        obs.subscribe();
        return obs;
    }

    setChartData(hits) {
        const extra = {};
        this.queryParams.extraFields.forEach(f => {
            extra[f] = hits.map(hit => hit[f]);
        });
        const x = this._parseXValues(hits);
        this.wi.series.forEach((s, i) => {
            this.chartData[i].y = hits.map(hit => hit[this.wi.field][s]);
            this.chartData[i].x = x;
            this.chartData[i].text = this.makeTooltipTexts(hits);
            this.chartData[i]._extra = extra;
            if (this.wi.errorField) {
                this.chartData[i].error_y = this.makeErrorBars(hits, s);
            }
        });
        this.updateFieldSeparators();
        ChartUtils.setAutorange(this.chartLayout);
        Plotly.redraw(this.plot.nativeElement);
    }

    protected _parseXValues(hits) {
        return hits.map(hit => this.tsToChartTimestamp(hit[this.queryParams.timestampField]));
    }

    makeErrorBars(hits, series) {
        return {
            type: 'data',
            array: hits.map(hit => hit[this.wi.errorField][series]),
            color: 'black',
            thickness: 1,
            symmetric: true
        }
    }

    queryRange(range: ChartUtils.DateRangeEvent) {
        this.widgetComponent.stop();
        let obs;
        if (range.msecTo - range.msecFrom > this.wi.aggregationThreshold) {
            obs = this.dataService.queryRangeAggregated(
                this.queryParams, range['strFrom'], range['strTo'], this.wi.aggregationAlgo).pipe(
                    tap(() => this.aggregated = true),
                );
        } else {
            obs = this.dataService.queryRange(
                this.queryParams, range['strFrom'], range['strTo']).pipe(
                    tap(() => this.aggregated = false),
                );
        }
        obs = obs.pipe(
            map(this.setChartData.bind(this)),
            tap(this.enableInteraction.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share());
        this.disableInteraction();
        obs.subscribe();
        return obs;
    }

    queryFillRun(event) {
        this.widgetComponent.stop();
        const term = {};
        if (event['run']) {
            term[this.queryParams['runField']] = event['run'];
        } else if (event['fill']) {
            term[this.queryParams['fillField']] = event['fill'];
        } else {
            this.widgetComponent.log('One of [FILL, RUN] must be specified', 'warning');
            return emptyObservable();
        }

        this.widgetComponent.log('Querying timestamp extremes for FILL/RUN', 'info')
        this.disableInteraction();
        this.dataService.queryExtremesByTerm(this.queryParams, term)
            .pipe(
                mergeMap(extremes => {
                    console.log(extremes);
                    if (!extremes['min']['value'] || !extremes['max']['value']) {
                        return throwError('Failed to get timestamp extremes for FILL/RUN query. ' + JSON.stringify(event));
                    }
                    const min = extremes['min']['value_as_string'];
                    const max = extremes['max']['value_as_string'];
                    this.widgetComponent.log('Got timestamp extremes. ' + min + ', ' + max, 'info')
                    const range =  ChartUtils.makeQueryRangeFromStrings(min, max);
                    return of(range);
                }),
                map(this.queryRange.bind(this)),
                tap(this.enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this))
            )
            .subscribe();
    }

    updateLive() {
        if (this.aggregated || this.chartData.length < 1 || this.chartData[0].x.length < 1) {
            this.refresh().subscribe(this.setXZoomToLiveWindow.bind(this));
            return;
        }
        const x = this.chartData[0].x;
        const lastX = x[x.length - 1];
        this.dataService.queryNewestSince(this.queryParams, lastX)
            .subscribe(hits => {
                const extra = this.chartData[0]['_extra'];
                this.queryParams['extraFields'].forEach(f => {
                    extra[f] = extra[f].concat(hits.map(hit => hit[f]));
                });
                this.wi.series.forEach((s, i) => {
                    const trace = this.chartData[i];
                    trace.y = trace.y.concat(
                        hits.map(hit => hit[this.wi.field][s]));
                    trace.x = trace.x.concat(
                        this._parseXValues(hits));
                    trace.text = trace.text.concat(this.makeTooltipTexts(hits));
                    trace._extra = extra;
                    if (this.wi.errorField) {
                        trace.error_y = trace.error_y.concat(this.makeErrorBars(hits, s).array);
                    }
                    this.dropPointsOutsideLiveWindow(trace);
                });
                this.updateFieldSeparators();
                this.setXZoomToLiveWindow();
                Plotly.redraw(this.plot.nativeElement, this.chartData);
            });
    }


    makeTooltipTexts(hits) {
        const tooltipTextConfig = this.wi.tooltipInfo;
        if (!tooltipTextConfig) {
            return [];
        }
        return hits.map(point => ChartUtils.makeTooltipText(point, tooltipTextConfig));
    }

    dropPointsOutsideLiveWindow(trace) {
        const lastX = this.tsToMilliseconds(trace.x[trace.x.length -1]);
        const liveWindow = this.wi.liveWindow;
        var dropErrorY = function(trace) {};
        if (this.wi.errorField) {
            dropErrorY = function(trace) {
                trace.error_y.array.shift();
            };
        }
        while(lastX - this.tsToMilliseconds(trace.x[0]) > liveWindow) {
            trace.x.shift();
            trace.y.shift();
            trace.text.shift();
            this.queryParams['extraFields'].forEach(f => {
                trace._extra[f].shift();
            });
            dropErrorY(trace);
        }
    }

    setXZoomToLiveWindow() {
        if (this.chartData.length < 1) {
            return;
        }
        const trace = this.chartData[0];
        const max = this.tsToMilliseconds(trace.x[trace.x.length -1]);
        const min = max - this.wi.liveWindow;
        const mod = ChartUtils.setXRange(
            this.plot.nativeElement['layout'],
            (new Date(min)).toISOString(),
            (new Date(max)).toISOString());
        Plotly.relayout(this.plot.nativeElement, mod);
    }

    makeSeries() {
        this.chartData.length = 0;
        const names = this.wi.legendNames || [];
        this.wi.series.forEach((s, i) => {
            const newSeries = {
                x: [],
                y: [],
                text: [],
                name: names[i] || this.wi.field + '.' + s,
                type: 'scatter',
                line: { width: 1},
            };
            this.chartData.push(newSeries);
        });
    }

    onRelayout(event) {
        if (!this.aggregated) {
            return 1;
        }
        const range = ChartUtils.makeQueryRangeFromZoomEvent(event);
        if (range) {
            this.disableInteraction();
            this.queryRange(range)
                .pipe(tap(this.enableInteraction.bind(this)))
                .subscribe();
        }
    }

    updateFieldSeparators(relayout=false) {
        return super.updateFieldSeparators(relayout, this.aggregated);
    }

}
