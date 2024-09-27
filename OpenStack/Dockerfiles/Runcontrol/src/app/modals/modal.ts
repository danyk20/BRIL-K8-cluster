import { Input, Output, EventEmitter, ViewChild, Directive } from '@angular/core';

@Directive()
export class Modal {

    @ViewChild('modal', { static: true }) modal;
    @Output() closed = new EventEmitter();
    @Output() opened = new EventEmitter();

    protected _open = false;
    set open(newVal) {
        if (!newVal && newVal !== this._open) {
            this.closed.emit();
        } else {
            this.opened.emit();
        }
        this._open = newVal;
    }

    @Input() set state(newVal) {
        if (newVal.open) {
            this.modal.open();
        } else {
            this.modal.close();
        }
    };

}
