import {
    Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: 'easy-editor',
    templateUrl: './easy-editor.component.html',
    styleUrls: ['./easy-editor.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EasyEditorComponent implements OnInit {

    @Output() preview = new EventEmitter();
    @Output() submit = new EventEmitter();
    @Input() configDetails;

    constructor() { }

    ngOnInit() {
    }

}
