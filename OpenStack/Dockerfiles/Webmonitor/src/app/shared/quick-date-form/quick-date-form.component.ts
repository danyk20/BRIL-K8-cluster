import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DateRangeQueryEvent } from 'app/shared/chart-utils';
import * as tsUtil from 'app/shared/timestamp-utils';
import { QueryForm } from 'app/shared/query-form';

export interface QuickDateOption {
    unit: 'minutes' | 'hours' | 'days';
    duration: number;
    offset?: number;
    text: string;
}

@Component({
    selector: 'wm-quick-date-form',
    templateUrl: './quick-date-form.component.html',
    styleUrls: ['./quick-date-form.component.css']
})
export class QuickDateFormComponent implements OnInit, QueryForm {

    @Input('key') key: string;
    @Input('options') options: Array<QuickDateOption>;
    @Output('query') onQuery = new EventEmitter<DateRangeQueryEvent>();

    constructor() { }

    ngOnInit() {
    }

    query(opt: QuickDateOption) {
        const now = new Date();
        let unitMS = 60000;
        if (opt.unit === 'hours') {
            unitMS = 3600000;
        } else if (opt.unit === 'days') {
            unitMS = 86400000;
        }
        let end = now;
        if (opt.hasOwnProperty('offset')) {
            end = new Date(now.getTime() + opt.offset * unitMS);
        }
        const start = new Date(end.getTime() - opt.duration * unitMS);
        this.onQuery.emit({
            'key': this.key,
            'from': start,
            'to': end,
            'tsFrom': Math.round(start.getTime()/1000),
            'tsTo': Math.round(end.getTime()/1000),
            'msecFrom': start.getTime(),
            'msecTo': end.getTime(),
            'strFrom': tsUtil.makeISOWithoutMilliseconds(start, false),
            'strTo': tsUtil.makeISOWithoutMilliseconds(end, false),
            'utc': false
        });
    }

}
