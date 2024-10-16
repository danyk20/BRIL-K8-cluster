import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { Subscription, EMPTY, of, throwError } from 'rxjs';
import { map, tap, share, catchError, mergeMap } from 'rxjs/operators';
import * as ChartUtils from 'app/shared/chart-utils';
import { ArrayLinesComponent, WidgetConfig as SuperWidgetConfig } from './array-lines.component';
import { DataService } from './data.service';
import { ChartWidget } from 'app/widgets/base/chart-widget';
import { WidgetComponent } from 'app/shared/widget/widget.component';
declare var Plotly: any;

export interface WidgetConfig extends SuperWidgetConfig {
    xField: string;
    xAxisTitle?: string;
    xAxisType?: 'category' | 'lin';
}

@Component({
    selector: 'wm-widget-array-lines',
    templateUrl: './array-lines.component.html',
    styleUrls: ['./array-lines.component.css']
})
export class ArrayLinesBasicXComponent extends ArrayLinesComponent implements OnInit, AfterViewInit {

    wi: WidgetConfig;

    setupWidget() {
        this.wi = <WidgetConfig>super.setupWidget();
        this.wi['timestampField'] = undefined;
        this.queryParams['timestampField'] = undefined;
        return this.wi;
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        const xAxisTitle = this.wi.xAxisTitle ? this.wi.xAxisTitle : this.wi.xField;
        const xAxisType = this.wi.xAxisType ? this.wi.xAxisType : 'category';
        (<ChartWidget>this).chartLayout.xaxis.title = xAxisTitle;
        (<ChartWidget>this).chartLayout.xaxis.type = xAxisType;
    }

    queryFromEvent(event) {
        if (event['type'] === 'range_query') {
            this.queryFillRun(event['payload']);
        }else if (this.wi.histogramAggregatedQuery){
            this.queryFillRun(event);
            
        }else {
            this.onBasicXRangeQuery(event);
        }
    }

    refresh(size?) {
        size = Number.isInteger(size) ? size : this.wi.refreshSize || 20;
        (<ChartWidget>this).disableInteraction();
        const obs = this.dataService.queryBasicX(
            this.queryParams,
            this.wi.xField,
            undefined,
            undefined,
            size).pipe(
                tap(() => this.aggregated = false),
                tap(this.setChartData.bind(this)),
                tap((<ChartWidget>this).enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this)),
                share());
        obs.subscribe();
        return obs;
    }

    onBasicXRangeQuery(event) {
        console.log(event);
        (<ChartWidget>this).disableInteraction();
        const obs = this.dataService.queryBasicX(
            this.queryParams,
            this.wi.xField,
            event.min,
            event.max).pipe(
                tap(() => this.aggregated = false),
                tap(this.setChartData.bind(this)),
                tap((<ChartWidget>this).enableInteraction.bind(this)),
                catchError(this.onQueryError.bind(this)),
                share());
        obs.subscribe();
        return obs;
    }


    protected _parseXValues(hits) {
        return hits.map(hit => hit[this.wi.xField]);
    }

    queryRange(range) {
        throw new Error("Date range query not supproted on array-lines-basicx widget");
    }

    queryFillRun(event) {
        this.widgetComponent.stop();
        if (Number.isNaN(event['min']) && Number.isNaN(event['max']) ) {
            console.log("NaN");
            this.widgetComponent.log('Specify Min fill and/or Max fill', 'danger');
            return EMPTY;
        }
        this.disableInteraction();
        let obs;
        obs = this.dataService.queryRangeAggregated(
            this.queryParams, event['min'], event['max'], this.wi.aggregationAlgo).pipe(
                tap(() => this.aggregated = true),
            );

        obs = obs.pipe(
            map(this.setChartData.bind(this)),
            tap(this.enableInteraction.bind(this)),
            catchError(this.onQueryError.bind(this)),
            share());
        this.disableInteraction();
        obs.subscribe();
    }

    updateLive() {
        throw new Error("Live update not supproted on array-lines-basicx widget");
    }

    dropPointsOutsideLiveWindow(trace) {
        throw new Error("dropPointsOutsideLiveWindow not supproted on array-lines-basicx widget");
    }

}
