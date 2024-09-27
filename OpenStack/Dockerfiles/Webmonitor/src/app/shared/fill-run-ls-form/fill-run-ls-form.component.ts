import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QueryEvent } from 'app/shared/query-event';
import { QueryForm } from 'app/shared/query-form';

export interface FillRunLsQueryEvent extends QueryEvent {
    fill: number;
    run: number;
    ls: number;
}

@Component({
    selector: 'wm-fill-run-ls-form',
    templateUrl: './fill-run-ls-form.component.html',
    styleUrls: ['./fill-run-ls-form.component.css']
})
export class FillRunLsFormComponent implements OnInit, QueryForm {

    @Input('key') key: string;
    @Input('fillEnabled') fillEnabled = false;
    @Input('runEnabled') runEnabled = true;
    @Input('lsEnabled') lsEnabled = true;
    @Output('query') onQuery = new EventEmitter<FillRunLsQueryEvent>();

    fill: number;
    run: number;
    ls: number;

    constructor() { }

    ngOnInit() {
    }

    query() {
        this.onQuery.emit({
            key: this.key,
            fill: this.fill,
            run: this.run,
            ls: this.ls
        });
    }

}
