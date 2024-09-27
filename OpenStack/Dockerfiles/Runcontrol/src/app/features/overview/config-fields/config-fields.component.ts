import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'config-fields',
    templateUrl: './config-fields.component.html',
    styleUrls: ['./config-fields.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigFieldsComponent implements OnInit {

    @Input('fields') fields;

    constructor() { }

    ngOnInit() {
    }

}
