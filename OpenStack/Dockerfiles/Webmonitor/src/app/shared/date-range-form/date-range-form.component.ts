import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DateRangeQueryEvent} from 'app/shared/chart-utils';
import * as tsUtil from 'app/shared/timestamp-utils'
import {QueryForm} from 'app/shared/query-form';

@Component({
    selector: 'wm-date-range-form',
    templateUrl: './date-range-form.component.html',
    styleUrls: ['./date-range-form.component.css']
})
export class DateRangeFormComponent implements OnInit, QueryForm {

    @Input('key') key: string;
    @Input('dateBegin') dateBegin = new Date();
    @Input('dateEnd') dateEnd = new Date();
    @Output('query') onQuery = new EventEmitter<DateRangeQueryEvent>();
    utc = false;

    public timeRange = [this.dateBegin, this.dateEnd];

    ngOnInit() {
    }

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
            'from': this.timeRange[0],
            'to': this.timeRange[1],
            'tsFrom': makeTSSec(this.timeRange[0]),
            'tsTo': makeTSSec(this.timeRange[1]),
            'msecFrom': makeTSMSec(this.timeRange[0]),
            'msecTo': makeTSMSec(this.timeRange[1]),
            'strFrom': tsUtil.makeISOWithoutMilliseconds(this.timeRange[0], this.utc),
            'strTo': tsUtil.makeISOWithoutMilliseconds(this.timeRange[1], this.utc),
            'utc': this.utc
        });
    }

    setRange(range: Date[]) {
        this.timeRange = range
    }
}
