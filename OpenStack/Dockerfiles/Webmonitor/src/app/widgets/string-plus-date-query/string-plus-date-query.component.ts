import { Component, OnInit, Input } from '@angular/core';
import { EventBusService } from 'app/core/event-bus.service';

@Component({
    selector: 'wm-string-plus-date-query-widget',
    templateUrl: './string-plus-date-query.component.html'
})
export class StringPlusDateQueryComponent implements OnInit {

    @Input('config') config;
    key: string;
    label: string;

    constructor(protected eventBus: EventBusService) {
    }

    ngOnInit() {
        this.config = this.config || {};
        if (!this.config.hasOwnProperty('widget')) {
            this.config['widget'] = {};
        }
        this.key = this.config['widget']['key'];
        this.label = this.config['widget']['label'];
    }

    query(event) {
        const ebEvent = {type: 'string_plus_date_query', payload: event};
        this.eventBus.emit(this.config['widget']['channel'], ebEvent);
    }

}
