import {
    Component, OnInit, Input, ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { FormlyFieldConfig } from '@ngx-formly/core';
import * as ChartUtils from 'app/shared/chart-utils';
import * as Stats from 'app/shared/stats';
import { ArraySnapshotComponent, WidgetConfig as ParentWidgetConfig } from '../array-snapshot/array-snapshot.component';
import { ChartWidget } from 'app/widgets/base/chart-widget';

declare var Plotly: any;

export interface WidgetConfig extends ParentWidgetConfig {
    histogramStep: number;
    minbias: number;
    statisticsFilter: number;
}
@Component({
    selector: 'wm-pileup-widget',
    templateUrl: '../array-snapshot/array-snapshot.component.html',
    styleUrls: ['../array-snapshot/array-snapshot.component.css']
})
export class PileupComponent extends ArraySnapshotComponent implements OnInit {

    public static HISTOGRAM_STEP_DEFAULT = 2;
    public static MINBIAS_DEFAULT = 80000;
    public static STATISTICS_FILTER_DEFAULT = 1.0;

    widget: WidgetConfig;
    pileups: Array<number>;
    lastData = null;

    ngOnInit() {
        super.ngOnInit();
        this.widget.xAxisTitle = this.widget.xAxisTitle || 'Pileup';
        this.widget.yAxisTitle = this.widget.yAxisTitle || 'Frequency (interactions)';
        this.widget.histogramStep = this.widget.histogramStep || PileupComponent.HISTOGRAM_STEP_DEFAULT;
        this.widget.minbias = this.widget.minbias || PileupComponent.MINBIAS_DEFAULT;
        this.widget.statisticsFilter = this.widget.statisticsFilter || PileupComponent.STATISTICS_FILTER_DEFAULT;
        this.wrapper.infoEnabled = true;
        if (this.queryParams.fields.length !== 1) {
            const msg = 'Pileup chart must have a single field configured';
            console.error(msg, this.widget);
            throw(msg);
        }
        this.setupPileupOptions();
    }

    setData(newData) {
        this.lastData = newData;
        if (!newData[0]) {
            this.widgetComponent.log('Cannot draw chart: no data.', 'danger', 3500);
            return;
        }
        (<ChartWidget>this).chartData.length = 0;
        this.series.length = 0;
        const field = this.queryParams.fields[0];
        this.pileups = newData[0][field.name].map(value => value * this.widget.minbias / 11245.0);
        const y = [];
        this.pileups.forEach(pu => {
            const bin = Math.floor(pu/this.widget.histogramStep);
            if (y[bin]) {
                y[bin] += 1;
            } else {
                y[bin] = 1;
            }
        });
        const x = y.map((val, i) => i * this.widget.histogramStep);
        const newSeries = {
            x: x,
            y: y,
            name: field.seriesName,
            type: 'bar',
            mode: 'markers',
            marker: { size: 5 }
        };
        this.chartData.push(newSeries);
        this.series.push(newSeries);
        this.updateAnnotation(newData);
        ChartUtils.setAutorange(this.chartLayout)
        Plotly.redraw(this.plot.nativeElement, this.chartData, this.chartLayout);
        this.updateInfo(newData);
    }

    updateInfo(newData) {
        super.updateInfo(newData);
        const stats = this.calculateStatistics();
        (<any>Object).assign(this.info, {
            'MinBiasXSec.': this.widget.minbias,
            'Bin size': this.widget.histogramStep,
            'Stats filter': '>=' + this.widget.statisticsFilter,
            'nBX': stats.filteredBX,
            'Mean': stats.mean.toFixed(6),
            'Std.deviation': stats.stdDeviation.toFixed(6)
        });
    }

    calculateStatistics() {
        const filtered = this.pileups.filter(v => v >= this.widget.statisticsFilter);
        const filteredBX = filtered.length;
        const mean = Stats.mean(filtered);
        const stdDev = Stats.standardDeviation(filtered);
        return {
            filteredBX: filtered.length,
            mean: Stats.mean(filtered),
            stdDeviation: Stats.standardDeviation(filtered)
        };
    }

    protected setupPileupOptions() {
        const pileupOptions: Array<FormlyFieldConfig> = [{
            key: 'histogramStep', type: 'number', templateOptions: {label: 'Histogram step'}
        }, {
            key: 'minbias', type: 'number', templateOptions: {label: 'Minbias'}
        }, {
            key: 'statisticsFilter', type: 'number', templateOptions: {label: 'Statistics filter', min: 0, step: 0.1}
        }];
        if (this.widgetComponent.extraOptions && this.widgetComponent.extraOptions.length) {
            this.widgetComponent.extraOptions = this.widgetComponent.extraOptions.concat(pileupOptions);
        } else {
            this.widgetComponent.extraOptions = pileupOptions;
        }
        this.widgetComponent.extraOptionsModel = (<any>Object).assign(
            {},
            this.widgetComponent.extraOptionsModel,
            {
                'histogramStep': this.widget.histogramStep,
                'minbias': this.widget.minbias,
                'statisticsFilter': this.widget.statisticsFilter
            }
        );
        this.widgetComponent.extraOptionsModelChange.pipe(debounceTime(1000)).subscribe(model => {
            this.widget.histogramStep = model['histogramStep'];
            this.widget.minbias = model['minbias'];
            this.widget.statisticsFilter = model['statisticsFilter'];
            this.setData(this.lastData);
        });
    }
}
