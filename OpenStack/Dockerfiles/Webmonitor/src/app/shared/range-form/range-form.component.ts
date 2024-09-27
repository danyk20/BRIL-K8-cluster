import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { QueryEvent } from 'app/shared/query-event';
import { QueryForm } from 'app/shared/query-form';

export interface RangeEvent extends QueryEvent {
    min: string | number;
    max: string | number;
    detectors: Array<string>;
    fits: Array<string>;
}

@Component({
    selector: 'wm-range-form',
    templateUrl: './range-form.component.html',
    styleUrls: ['./range-form.component.css']
})
export class RangeFormComponent implements QueryForm, OnInit {

    @Input('key') key: string;
    @Input('label') label: string;
    @Input('database') database: string;
    @Input('index') index: string;
    @Input('queryDetectors') queryDetectors: boolean;
    @Input('queryFits') queryFits: boolean;
    @Input('inputType') inputType: 'text' | 'number' = 'number';
    @Output('query') onQuery = new EventEmitter<RangeEvent>();

    minValue: string;
    maxValue: string;
    selectedDetectors;
    selectedFits;

    constructor() { }

    ngOnInit() {
        this.selectedDetectors = [];
        this.selectedFits = [];
    }

    query() {
        this.onQuery.emit({
            'key': this.key,
            'min': this.inputType === 'number' ? parseFloat(this.minValue) : this.minValue,
            'max': this.inputType === 'number' ? parseFloat(this.maxValue) : this.maxValue,
            'detectors': this.selectedDetectors,
            'fits': this.selectedFits
        });
    }

    changeDetectors(detectors) {
        this.selectedDetectors = detectors;
        if(!this.selectedDetectors) {
            this.selectedDetectors = [];
        }
    }

    changeFits(fits) {
        this.selectedFits = fits;
        if(!this.selectedFits) {
            this.selectedFits = [];
        }
    }
}
