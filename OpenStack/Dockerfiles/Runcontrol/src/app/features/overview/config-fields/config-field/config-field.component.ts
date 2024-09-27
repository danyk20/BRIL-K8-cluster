import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'config-field',
    templateUrl: './config-field.component.html',
    styleUrls: ['./config-field.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigFieldComponent implements OnInit {

    @Input('field') field;
    public ObjectKeys = Object.keys;

    constructor() { }

    ngOnInit() {
    }

}
