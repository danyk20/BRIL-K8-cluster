import {
    Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { Config as Wrapper } from 'app/shared/widget/widget.component';
import { Subscription, empty as emptyObservable } from 'rxjs';
import { map, catchError, share } from 'rxjs/operators';
import * as ChartUtils from 'app/shared/chart-utils';
import {
    ArraySnapshotComponent, WidgetConfig as ParentWidgetConfig
} from 'app/widgets/array-snapshot/array-snapshot.component';
import {
    StringPlusDateFormComponent, StringPlusDateQueryEvent
} from 'app/shared/string-plus-date-form/string-plus-date-form.component';

export interface WidgetConfig extends ParentWidgetConfig {
    detectorField: string;
    detectorFieldCase: 'upcase' | 'lowcase' | 'original';
}

@Component({
    selector: 'wm-vdm-bx',
    templateUrl: '../array-snapshot/array-snapshot.component.html',
    styleUrls: ['../array-snapshot/array-snapshot.component.css']
})
export class VDMBXComponent extends ArraySnapshotComponent implements OnInit {

    widget: WidgetConfig;

    ngOnInit() {
        super.ngOnInit();
        this.widget = <WidgetConfig>this.config['widget'];
        this.widget.detectorField = this.widget.detectorField || 'detector';
        this.widget.detectorFieldCase = this.widget.detectorFieldCase || 'upcase';
        this.wrapper.refreshEnabled = false;
        this.wrapper.startEnabled = false;
        this.widgetComponent.extraQueries = [{
            component: StringPlusDateFormComponent,
            config: {key: 'vdmbx', label: 'Detector'}
        }];
        this.queryEventTypes.push('string_plus_date_query');
        this.resubscribeQueryEvents();
        // don't need to unsubscribe, because 'extraQueriesEvents' completes
        // when the widget is destroyed
        this.widgetComponent.extraQueriesEvents.subscribe(
            (event: StringPlusDateQueryEvent) => {
                if (event.key === 'vdmbx') {
                    this.queryDetectorAndTime(event);
                }
            });
    }

    refresh() {
        return emptyObservable();
    }

    queryFromEvent(event) {
        if (event['type'] === 'string_plus_date_query') {
            this.widgetComponent.log('Received VDM-BX query', 'info');
            this.queryDetectorAndTime(event['payload']);
        } else {
            super.queryFromEvent(event);
        }
    }

    queryDetectorAndTime(event) {
        this.widgetComponent.stop();
        if (!event['text'] || !event['date']) {
             this.widgetComponent.log('Detector name and date must be specified', 'warning', 3500);
             return emptyObservable();
        }
        const detector = this.transformDetectorName(event['text']);
        const detectorTerm = {};
        const tsRange = {};
        detectorTerm[this.widget.detectorField] = detector;
        if (this.widget.timestampUNIX) {
            tsRange[this.queryParams.timestampField] = {'lte': event['ts']};
        } else {
            tsRange[this.queryParams.timestampField] = {'lte': event['dateStr']};
        }
        const obs = this.dataService.queryTerms(this.queryParams, [detectorTerm], [tsRange]).pipe(
            map(response => {
                return this.setData(response, detector + ' ');
            }),
            catchError(super.onQueryError.bind(this)),
            share()
        );
        obs.subscribe();
        return obs;
    }

    transformDetectorName(name) {
        if (this.widget.detectorFieldCase === 'upcase') {
            return name.toUpperCase();
        } else if (this.widget.detectorFieldCase === 'lowcase') {
            return name.toLowerCase();
        } else {
            return name;
        }
    }
}
