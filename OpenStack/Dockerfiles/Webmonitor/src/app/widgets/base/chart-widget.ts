import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy, Directive } from '@angular/core';
import {
    WidgetComponent, Config as WrapperConfig
} from 'app/shared/widget/widget.component';
import * as ChartUtils from 'app/shared/chart-utils';
import { EventBusService, Event } from 'app/core/event-bus.service';
import { map } from 'rxjs/operators';
import { Subscription, Observable, merge } from 'rxjs';
declare var Plotly: any;

export interface WidgetConfig {
    timestampUNIX?: boolean;
    queryChannel?: number;
    fieldChangeSeparators?: {enabled: boolean, fields: Array<ChartUtils.FieldSeparatorConfig>};
    legend?: ChartUtils.LegendPresetOptions;
    yAxisTitle?: string;
    yAxisScale?: 'lin' | 'log';
    scientific?: boolean;
}

@Directive()
export abstract class ChartWidget implements OnInit, OnDestroy, AfterViewInit {
    @Input('config') config;
    @ViewChild('plot', /* TODO: add static flag */ {}) plot: ElementRef;
    @ViewChild('widgetWrapper', { static: true }) widgetComponent: WidgetComponent;
    resizeEventSubs: Subscription;
    queryEventSubs: Subscription;
    reflow: () => void;
    chartData = [];
    chartLayout;
    chartConfig = ChartUtils.getDefaultConfig();
    tsToDate = ChartUtils.parseStringTimestamp;
    tsToChartTimestamp = (ts) => ts;
    chartTimestampToTs = (ts) => ts;
    tsToMilliseconds = (ts) => this.tsToDate(ts).getTime();
    widget: WidgetConfig;
    wrapper: WrapperConfig;
    queryEventTypes = ['range_query', 'time_range_query', 'fill_run_ls_query'];

    constructor(protected eventBus: EventBusService) {}

    ngOnDestroy() {
        if (this.resizeEventSubs) {
            this.resizeEventSubs.unsubscribe();
        }
        if (this.queryEventSubs) {
            this.queryEventSubs.unsubscribe();
        }
    }

    ngOnInit(defaults?: Object) {
        this.wrapper = this.setupWrapper();
        this.widget = <WidgetConfig>this.setupWidget(defaults);
        this.chartLayout = ChartUtils.configureDefaultLayout(this.widget);
    }

    setupWrapper(): WrapperConfig {
        return this.config['wrapper'] = <WrapperConfig>Object.assign({
            controlsEnabled: true,
            optionsEnabled: true,
            queriesEnabled: true,
            startEnabled: true,
            refreshEnabled: true
        }, this.config['wrapper'] || {});
    }

    setupWidget(defaults?: Object): WidgetConfig {
        this.widget = this.config['widget'] = this.config['widget'] || {};
        if (defaults) {
            Object.keys(defaults).forEach(key => {
                if (!this.widget.hasOwnProperty(key)) {
                    this.widget[key] = defaults[key];
                }
            });
        }
        if (this.widget.timestampUNIX) {
            this.tsToDate = ChartUtils.parseUNIXTimestamp;
            this.tsToChartTimestamp = (ts) => this.tsToDate(ts).toISOString();
            this.chartTimestampToTs = (ts) => (new Date(ts)).getTime() / 1000;
        }
        if (this.widget.hasOwnProperty('queryChannel')) {
            this.resubscribeQueryEvents();
        }
        return this.widget;
    }

    abstract queryFromEvent(event);

    ngAfterViewInit() {
        Plotly.newPlot(
            this.plot.nativeElement, this.chartData,
            this.chartLayout, this.chartConfig);
        this.reflow = ChartUtils.makeDefaultReflowFunction(this.plot.nativeElement);
        this.resizeEventSubs = ChartUtils.subscribeReflow(this.eventBus, this.reflow);
        this.reflow();
    }

    resubscribeQueryEvents() {
        if (this.queryEventSubs) {
            this.queryEventSubs.unsubscribe();
        }
        const ch = this.widget.queryChannel;
        let obs: Observable<Event>;
        this.queryEventTypes.forEach(eventType => {
            if (obs) {
                obs = merge(obs, this.eventBus.getEvents(ch, eventType));
            } else {
                obs = this.eventBus.getEvents(ch, eventType);
            }
        });
        this.queryEventSubs = obs.subscribe(this.queryFromEvent.bind(this));
    }

    autorange() {
        const mod = ChartUtils.setAutorange(this.plot.nativeElement['layout']);
        Plotly.relayout(this.plot.nativeElement, mod);
    }

    disableInteraction() {
        this.chartConfig['staticPlot'] = true;
        this.chartLayout['plot_bgcolor'] = 'whitesmoke';
        Plotly.react(this.plot.nativeElement, this.chartData, this.chartLayout, this.chartConfig);
    }

    enableInteraction() {
        this.chartConfig['staticPlot'] = false;
        this.chartLayout['plot_bgcolor'] = undefined;
        Plotly.react(this.plot.nativeElement, this.chartData, this.chartLayout, this.chartConfig);
    }

    updateFieldSeparators(relayout=false, aggregated=false) {
        if (!this.widget.fieldChangeSeparators) {
            return;
        }
        if (this.widget.fieldChangeSeparators.enabled) {
            const s = ChartUtils.makeSeparatorLines(
                this.chartData,
                this.widget.fieldChangeSeparators.fields,
                aggregated);
            this.plot.nativeElement['layout']['shapes'] = s['shapes'];
            this.plot.nativeElement['layout']['annotations'] = s['annotations'];
        } else {
            this.plot.nativeElement['layout']['shapes'] = [];
            this.plot.nativeElement['layout']['annotations'] = [];
        }
        if (relayout) {
            Plotly.relayout(this.plot.nativeElement, this.chartLayout)
        }
    }



}
