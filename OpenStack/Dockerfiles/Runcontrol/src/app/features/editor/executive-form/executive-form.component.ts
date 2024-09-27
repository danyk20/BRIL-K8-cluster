import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'executive-form',
    templateUrl: './executive-form.component.html',
    styleUrls: ['./executive-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutiveFormComponent implements OnInit {

    protected _executive;
    @Input() set executive(newExecutive) {
        this._executive = Object.assign({}, newExecutive);
    }
    get executive() {
        return this._executive;
    }

    @Input() disabled;

    constructor() { }

    ngOnInit() {
    }

    getValue() {
        return this._executive;
    }

}
