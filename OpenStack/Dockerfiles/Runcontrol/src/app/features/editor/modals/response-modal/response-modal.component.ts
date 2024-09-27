import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: 'response-modal',
    templateUrl: './response-modal.component.html',
    styleUrls: ['./response-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResponseModalComponent implements OnInit {

    @Output() close = new EventEmitter();
    @Input() state;

    constructor() { }

    ngOnInit() {
    }

    onClickClose() {
        this.close.emit();
    }

    badStatus() {
        return this.state && this.state.response &&
            (this.state.response.status < 200 || this.state.response.status >= 300);
    }
}
