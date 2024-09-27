import { Component, ChangeDetectorRef} from '@angular/core';
import { Modal } from '../modal';

@Component({
    selector: 'app-refresh-modal',
    templateUrl: './app-refresh-modal.component.html',
    styleUrls: ['./app-refresh-modal.component.css']
})
export class AppRefreshModalComponent extends Modal {

    public timeRemaining = 60;
    protected countdownIntervalID = 0;

    constructor(protected changeDetectorRef: ChangeDetectorRef) {
        super();
        this.closed.subscribe(() => {
            clearInterval(this.countdownIntervalID);
        });
        this.opened.subscribe(() => {
            if (this.countdownIntervalID) {
                return;
            }
            this.countdownIntervalID = window.setInterval(this.countdown.bind(this), 1000);
        })
    }

    countdown() {
        if (this.timeRemaining > 0) {
            this.timeRemaining -= 1;
            this.changeDetectorRef.markForCheck();
        } else {
            this.refreshNow();
        }
    }

    refreshNow() {
        window.location.reload();
    }

    cancel() {
        this.modal.close();
    }

}
