import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Alert, AlertActionNames } from '@app/models/alert';

@Component({
    selector: 'app-alerts',
    templateUrl: './alerts.component.html',
    styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {

    @Output() processAlert = new EventEmitter<{alert: Alert, actionName: AlertActionNames}>();

    protected _alerts: Array<Alert>;
    @Input() set alerts(newAlerts) {
        this._alerts = newAlerts;
    }
    get alerts() {
        return this._alerts;
    }

    set closed(newVal) {
        if (newVal) {
            this.process(this.alerts[0], 'closeAction');
        }
    }

    constructor() { }

    ngOnInit() {
    }

    process(alert: Alert, actionName: AlertActionNames) {
        this.processAlert.emit({alert: alert, actionName: actionName});
    }

}
