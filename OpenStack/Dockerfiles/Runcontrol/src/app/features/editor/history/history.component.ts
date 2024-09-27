import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: 'history-table',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent implements OnInit {

    @Input() selectedVersion: number;

    protected _entries: Array<any>;
    @Input() set entries(newEntries) {
        this._entries = newEntries;
        this.updateDisableBtnLoadOlder();
    }
    get entries() : Array<any> {
        return this._entries;
    }

    @Output() loadOlder = new EventEmitter();
    @Output() selectVersion = new EventEmitter();

    disabledBtnLoadOlder = false;

    constructor() { }

    ngOnInit() {
    }

    onBtnLoadOlder() {
        this.loadOlder.emit();
    }

    onBtnSelectVersion(version) {
        this.selectVersion.emit(version);
    }

    updateDisableBtnLoadOlder() {
        if (!this._entries || !this._entries.length) {
            this.disabledBtnLoadOlder = true;
            return;
        }
        this.disabledBtnLoadOlder = (this._entries[this._entries.length - 1][0] <= 1);
    }

}
