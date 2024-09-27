import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QueryEvent } from 'app/shared/query-event';
import { QueryForm } from 'app/shared/query-form';

export interface DelimitedQueryEvent extends QueryEvent {
    value: Array<number|string>
}
@Component({
    selector: 'wm-delimited-form',
    templateUrl: './delimited-form.component.html',
    styleUrls: ['./delimited-form.component.css']
})
export class DelimitedFormComponent implements OnInit, QueryForm {

    @Input('key') key: string;
    @Input('label') label: string;
    @Input('delimiter') delimiter: string = ',';
    @Input('inputType') inputType: 'string' | 'number';
    @Output('query') onQuery = new EventEmitter<DelimitedQueryEvent>();

    placeholder: string;
    inputModel: string = '';

    constructor() { }

    ngOnInit() {
        this.placeholder = (this.label || this.key) +
            '. \"' + this.delimiter + '\" delimited';
    }

    query() {
        if (typeof this.inputModel == 'undefined' || this.inputModel === '') {
            return;
        }
        const split = this.inputModel.split(this.delimiter);
        let values = [];
        if (this.inputType == 'string') {
            values = split.map(v => String(v));
        } else if (this.inputType == 'number') {
            values = split.map(v => Number(v));
        }

        this.onQuery.emit({
            'key': this.key,
            'value': values
        });
    }
}
