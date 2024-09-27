import {
    Component, OnInit, Input, ViewChild, ElementRef
} from '@angular/core';
import { Subscription, empty as emptyObservable } from 'rxjs';
import { map, tap, catchError, share } from 'rxjs/operators';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService } from 'app/core/event-bus.service';
import { DataService, Parameters as QueryParameters } from './data.service';
import {
    ChartWidget, WidgetConfig as ParentWidgetConfig
} from 'app/widgets/base/chart-widget';

declare var Plotly: any;

export interface WidgetConfig extends ParentWidgetConfig, QueryParameters {
    runLsQueriesEnabled?: boolean;
    chartType?: 'scattergl' | 'scatter' | 'bar';
    xAxisTitle?: string;
    xOffset?: number;
}

@Component({
    selector: 'wm-array-snapshot',
    templateUrl: './array-snapshot.component.html',
    styleUrls: ['./array-snapshot.component.css']
})
export class ArraySnapshotComponent extends ChartWidget implements OnInit {

    queryParams: QueryParameters;
    series = [];
    info = {};
    needWebGLFallback = false;
    widget: WidgetConfig

    constructor(
        protected eventBus: EventBusService,
        protected dataService: DataService) {
        super(eventBus);
    }

    ngOnInit() {
        super.ngOnInit({'timestampField': 'timestamp'});
        this.widget = <WidgetConfig>this.config['widget'];
        this.configureLayout();
        if (this.widget.chartType && this.widget.chartType.toLowerCase() === 'scattergl') {
            if (!ChartUtils.detectWebGLContext()) {
                this.needWebGLFallback = true;
            }
        }
        this.queryParams = {
            database: this.widget.database,
            timestampField: this.widget.timestampField,
            index: this.widget.index,
            documentType: this.widget.documentType,
            terms: this.widget.terms,
            fields: this.widget.fields,
            runField: this.widget.runField,
            lsField: this.widget.lsField,
            nestedPath: this.widget.nestedPath
        };
    }

    ngAfterViewInit() {
        if (this.needWebGLFallback) {
            return;
        }
        super.ngAfterViewInit();
        if (!this.wrapper.started) {
            this.refresh();
        }
    }

    configureLayout() {
        const update = {
            xaxis: {
                type: 'linear',
                title: this.widget.xAxisTitle
            },
            yaxis: {title: this.widget.yAxisTitle},
            barmode: 'group'
        }
        this.chartLayout = Object.assign(this.chartLayout, update);
    }

    queryFromEvent(event) {
        if (event['type'] === 'fill_run_ls_query') {
            if (this.widget.runLsQueriesEnabled) {
                this.widgetComponent.log('Received RUN,LS query', 'info');
                this.queryRunLs(event['payload']);
            }
        }
    }

    onRefreshEvent() {
        this.widgetComponent.stop();
        this.refresh();
    }

    onStartEvent() {
        this.refresh();
    }

    onQueryError(error) {
        this.setData([]);
        this.widgetComponent.log(String(error), 'danger', 5000);
        throw(error);
    }

    refresh() {
        if (this.needWebGLFallback) {
            return;
        }
        const obs = this.dataService.queryNewest(this.queryParams).pipe(
            map(this.setData.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share()
        );
        obs.subscribe();
        return obs;
    }

    queryRunLs(event) {
        this.widgetComponent.stop();
        if (!event['run'] || !event['ls']) {
            this.widgetComponent.log('RUN and LS must be specified', 'warning', 3500);
            return emptyObservable();
        }
        const runTerm = {};
        const lsTerm = {};
        runTerm[this.queryParams.runField] = event['run'];
        lsTerm[this.queryParams.lsField] = event['ls'];
        const obs = this.dataService.queryTerms(this.queryParams, [runTerm, lsTerm]).pipe(
            map(this.setData.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share()
        );
        obs.subscribe();
        return obs;
    }

    setData(newData, namePrefix?) {
        if (!newData[0]) {
            this.widgetComponent.log('Cannot draw chart: no data.', 'danger', 3500);
            return;
        }
        this.chartData.length = 0;
        this.series.length = 0;
        this.queryParams.fields.forEach((f, i) => {
            let y = newData[0][f.name];
            if (f.mask) {
                y = this.applyMask(y, newData[0][f.mask]);
            }
            const newSeries = {
                y: y,
                name: (namePrefix ? namePrefix : '') + f.seriesName,
                type: this.widget.chartType || 'bar',
                mode: 'markers',
                marker: { size: 5 }
            };
            if (f.error && newData[0][f.error]) {
                newSeries['error_y'] = {
                    type: 'data',
                    visible: true,
                    color: 'black',
                    array: newData[0][f.error]
                };
                // workaround for scattergl with error bars: needs 'lines'
                // Maybe not exactly the same, but seems related issue:
                // https://github.com/plotly/plotly.js/issues/2900
                newSeries['mode'] = 'lines+markers';
                newSeries['line'] = {width: 0};
            }
            this.offsetXValues(newSeries);
            this.chartData.push(newSeries);
            this.series.push(newSeries);
        });
        this.updateAnnotation(newData);
        ChartUtils.setAutorange(this.chartLayout)
        Plotly.redraw(this.plot.nativeElement, this.chartData, this.chartLayout);
        this.updateInfo(newData);
    }

    applyMask(data, mask) {
        return data.map((v, i) => mask[i] ? v : null);
    }

    updateInfo(newData) {
        this.info = {
            timestamp: newData[0][this.queryParams.timestampField]
        }
    }

    updateLive() {
        return this.refresh();
    }

    updateAnnotation(newData) {
        this.chartLayout['annotations'] = [{
            y: 1,
            x: 0.5,
            xref: 'paper',
            yref: 'paper',
            xanchor: 'middle',
            yanchor: 'top',
            bgcolor: 'FFFFFF80',
            text: this.tsToChartTimestamp(newData[0][this.widget.timestampField]),
            showarrow: false,
            font: { size: 18 }
        }];
    }

    offsetXValues(newSeries) {
        if (this.widget.xOffset) {
            const x = newSeries['y'].map((v, i) => {
                return i + this.widget.xOffset;
            });
            newSeries['x'] = x;
        }
        return newSeries;
    }

    tryWebGLFallback() {
        if (this.needWebGLFallback &&
            this.widget.chartType === 'scattergl') {
            this.widget.chartType = 'scatter';
            this.needWebGLFallback = false;
            this.ngAfterViewInit();
        }

    }

}
