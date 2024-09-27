import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QueryEvent } from 'app/shared/query-event';
import { QueryForm } from 'app/shared/query-form';
import * as tsUtil from 'app/shared/timestamp-utils';

export interface StringPlusDateQueryEvent extends QueryEvent {
    text: string;
    date: Date;
    ts: number;
    msec: number;
    dateStr: string,
    utc: boolean
}

@Component({
    selector: 'wm-string-plus-date-form',
    templateUrl: './string-plus-date-form.component.html',
    styleUrls: ['./string-plus-date-form.component.css']
})
export class StringPlusDateFormComponent implements QueryForm, OnInit {

    @Input('key') key: string;
    @Input('label') label: string;
    @Output('query') onQuery = new EventEmitter<StringPlusDateQueryEvent>();

    dateValue;
    textValue;
    utc: false;

    constructor() { }

    ngOnInit() {}

    query() {
        let makeTSSec, makeTSMSec;
        if (this.utc) {
            makeTSSec = tsUtil.makeUTCTimestampSec;
            makeTSMSec = tsUtil.makeUTCTimestampMSec;
        } else {
            makeTSSec = tsUtil.makeTimestampSec;
            makeTSMSec = tsUtil.makeTimestampMSec;
        }
        this.onQuery.emit({
            'key': this.key,
            'text': this.textValue,
            'date': this.dateValue,
            'ts': makeTSSec(this.dateValue),
            'msec': makeTSMSec(this.dateValue),
            'dateStr': tsUtil.makeISOWithoutMilliseconds(this.dateValue, this.utc),
            'utc': this.utc
        });
    }
}
