import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy
} from '@angular/core';
import { Subscription, empty as EmptyObservable, throwError, of } from 'rxjs';
import { tap, map, share, catchError, mergeMap} from 'rxjs/operators';

import * as ChartUtils from 'app/shared/chart-utils';
import { WidgetComponent } from 'app/shared/widget/widget.component';
import { NumericFieldComponent } from 'app/widgets/numeric-field/numeric-field.component';

declare var Plotly: any;

interface Ratio {
    x: Array<number>;
    y: Array<number>;
}

@Component({
    selector: 'wm-numeric-field-with-ratios-widget',
    templateUrl: '../numeric-field/numeric-field.component.html',
    styleUrls: ['../numeric-field/numeric-field.component.css']
})
export class NumericFieldWithRatiosComponent extends NumericFieldComponent
implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('ratioPlot') protected ratioPlot: ElementRef;
    ratioChartConfig = ChartUtils.getDefaultConfig();
    ratioChartLayout = {};
    ratioChartData = [];

    static makeRatio(numerator, denominator): Ratio {
        let iN = numerator.x.length -1;
        let iD = denominator.x.length -1;
        const ratio = {x: [], y: []};
        while( iN >= 2 && iD >= 2) {
            if (numerator.x[iN] < denominator.x[iD - 1]) {
                --iD;
                continue;
            }
            if (numerator.x[iN - 1] > denominator.x[iD]) {
                --iN;
                continue;
            }
            const ts = numerator.x[iN] > denominator.x[iD] ? numerator.x[iN] : denominator.x[iD];
            ratio.x.unshift(ts);
            ratio.y.unshift(numerator.y[iN]/denominator.y[iD]);
            --iN;
            --iD;
        }
        return ratio;
    }

    ngOnInit() {
        super.ngOnInit();
        const wi = this.config['widget'];
        wi['yAxisTitle'] = 'Ratio';
        this.ratioChartLayout = ChartUtils.configureDefaultLayout(wi);
        //ChartUtils.disableNavigation2d(this.ratioChartLayout, this.ratioChartConfig);
        const xaxis = this.ratioChartLayout['xaxis'] = this.ratioChartLayout['xaxis'] || {};
        xaxis['fixedrange'] = false;
        xaxis['autorange'] = false;
        if (wi['ratioYRangeZoom']) {
            this.ratioChartLayout['yaxis']['fixedrange'] = false;
            this.ratioChartLayout['yaxis']['range'] = wi['ratioYRangeZoom'];
        }
    }

    ngAfterViewInit() {
        Plotly.newPlot(
            this.ratioPlot.nativeElement,
            this.ratioChartData,
            this.ratioChartLayout,
            this.ratioChartConfig);

        super.ngAfterViewInit();
    }

    setData(newData) {
        super.setData(newData);
        this.updateRatioPlot();
    }

    updateLive() {
        super.updateLive();
        this.updateRatioPlot();
    }

    updateRatioPlot() {
        this.ratioChartData.length = 0;
        this.config['widget']['ratios'].forEach(r => {
            const d = r['denominator'];
            const n = r['numerator'];
            const denominator = this.series[d['source']][d['field']];
            const numerator = this.series[n['source']][n['field']];
            const ratio = NumericFieldWithRatiosComponent.makeRatio(numerator, denominator);
            ratio['name'] = r['name'] || numerator.name + '/' + denominator.name;
            this.ratioChartData.push(ratio);
        });
        Plotly.redraw(this.ratioPlot.nativeElement, this.ratioChartData);
    }

    onRelayout(event): boolean {
        const propagate = super.onRelayout(event);
        const xaxis = this.ratioChartLayout['xaxis'];
        xaxis['range'] = this.chartLayout['xaxis']['range'];
        const yaxis = this.ratioChartLayout['yaxis'];
        // yaxis['autorange'] = true; Enable this if you want the y axis to automatically scale after changing the x axis zoom.
        Plotly.relayout(this.ratioPlot.nativeElement, {xaxis: xaxis, yaxis: yaxis});
        return propagate;
    }

}
