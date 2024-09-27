import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription, empty as EmptyObservable, throwError, of } from 'rxjs';
import { tap, map, share, catchError, mergeMap} from 'rxjs/operators';

import * as ChartUtils from 'app/shared/chart-utils';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import { ChartWidget } from 'app/widgets/base/chart-widget';
import {
    NumericFieldComponent, WidgetConfig as ParentWidgetConfig
} from 'app/widgets/numeric-field/numeric-field.component';
import {
    SourceParameter as ParentSourceParameter
} from 'app/widgets/numeric-field/data.service';

declare var Plotly: any;

export interface SourceParameter extends ParentSourceParameter {
    split: {
        field: string;
        text: string;
        values: Array<number>
    }
}

export interface WidgetConfig extends ParentWidgetConfig {
    sources: Array<SourceParameter>;
}

export interface QueryParameters {
    database: string;
    sources: Array<SourceParameter>;
}


@Component({
    selector: 'wm-numeric-field-split-widget',
    templateUrl: '../numeric-field/numeric-field.component.html',
    styleUrls: ['../numeric-field/numeric-field.component.css']
})
export class NumericFieldSplitComponent extends NumericFieldComponent
implements OnInit, AfterViewInit, OnDestroy {

    wi: WidgetConfig;
    queryParams: QueryParameters;

    ngOnInit() {
        super.ngOnInit();
        this.wi = <WidgetConfig>this.wi;
        this.queryParams = <QueryParameters>this.queryParams;
        this.queryParams.sources.forEach(s => {
            s.extraFields.push({'name': s.split.field});
        });
        this.flatFields = [];
        this.makeSeries();
    }

    setData(newData) {
        this.queryParams.sources.forEach((source, i) => {
            const splits = this.splitSourceHits(newData[i], source);
            source.split.values.forEach((splitVal, j) => {
                const extra = this.makeSourceExtraFields(splits[splitVal], source);
                const text = this.makeSourceText(splits[splitVal]);
                const x = this.makeSourceXValues(splits[splitVal], source);
                source.fields.forEach((field, k) => {
                    const series = this.series[i][j][k];
                    series.x = x;
                    series.text = text;
                    series._extra = extra;
                    series.y = this.makeFieldYValues(splits[splitVal], field);
                    if (field.errorField) {
                        series.error_y = this.makeFieldErrorBars(splits[splitVal], field);
                    }
                });
            });
        });
        this.updateFieldSeparators();
        Plotly.redraw(this.plot.nativeElement, this.chartData);
        this.autorange();
    }

    splitSourceHits(sourceData, source: SourceParameter) {
        const splits = {};
        source.split.values.forEach(splitVal => {
            splits[splitVal] = [];
        });
        sourceData.forEach(hit => {
            const splitVal = Number(hit[source.split.field]);
            try {
                splits[splitVal].push(hit);
            } catch(e) {
                // pass indexes that are returned by query but not configured
            }
        });
        return splits;
    }

    updateLive() {
        throw new Error("Live update not implemented for numeric-field-split widget");
    }

    makeSeries() {
        this.chartData.length = 0;
        this.series.length = 0;
        this.queryParams.sources.forEach((source, i) => {
            const seriesOfCurrentSource = [];
            source.split.values.forEach((splitVal, j) => {
                const seriesOfCurrentSplit = [];
                source.fields.forEach((field, k) => {
                    const newSeries = {
                        x: [],
                        y: [],
                        _extra: [],
                        text: [],
                        name: (field.seriesName || field.name) + source.split.text + splitVal,
                        type: 'scatter',
                        mode: (this.wi.forceMarkers || field.forceMarkers) ? 'lines+markers' : 'auto',
                        line: { width: field['lineWidth'] || 1 },
                        visible: (field['hidden'] ? 'legendonly' : true)
                    };
                    if (field['yAxis'] === 2) {
                        newSeries['yaxis'] = 'y2';
                    }
                    seriesOfCurrentSplit.push(newSeries);
                    this.chartData.push(newSeries);
                });
                seriesOfCurrentSource.push(seriesOfCurrentSplit);
            });
            this.series.push(seriesOfCurrentSource);
        });
    }

    onLegendClick(event) {}

}
