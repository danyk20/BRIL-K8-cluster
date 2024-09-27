import {
    Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild
} from '@angular/core';

@Component({
    selector: 'confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent implements OnInit, AfterViewInit {

    @ViewChild('modal', { static: true }) modal;
    callback = null;
    comment = '';

    set isOpen(newVal) {
        if (!newVal) {
            this.callback = null;
            this.comment = '';
        }
    }

    constructor() { }

    ngOnInit() {
    }

    ngAfterViewInit() {

    }

    setCallback(func) {
        this.callback = func;
    }

    open() {
        this.modal.open();
    }

    close() {
        this.modal.close();
    }

    confirm() {
        if (this.callback) {
            this.callback(this.comment);
            setTimeout(() => {
              this.modal.close()
            }, 50);
        }
    }

}
