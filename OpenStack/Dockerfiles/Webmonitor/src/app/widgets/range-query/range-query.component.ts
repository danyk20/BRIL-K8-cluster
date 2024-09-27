import { Component, OnInit, Input } from '@angular/core';
import { EventBusService } from 'app/core/event-bus.service';

@Component({
    selector: 'wm-range-query-widget',
    templateUrl: './range-query.component.html',
    styleUrls: ['./range-query.component.css']
})
export class RangeQueryComponent implements OnInit {

    @Input('config') config;
    info;
    wi;

    constructor(protected eventBus: EventBusService) {
    }

    ngOnInit() {
        this.config = this.config || {};
        if (!this.config.hasOwnProperty('widget')) {
            this.config['widget'] = {};
        }
        this.wi = this.config['widget'];
    }

    query(event) {
        const ebEvent = {type: 'range_query', payload: event};
        this.eventBus.emit(this.config['widget']['channel'], ebEvent);
    }

}
