import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'fields-editor',
    templateUrl: './fields-editor.component.html',
    styleUrls: ['./fields-editor.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldsEditorComponent implements OnInit {

    protected _fields;
    @Input() set fields(newFields: Array<any>) {
        if (!newFields) {
            this._fields = [];
            return;
        }
        this._fields = newFields.map(v => {
            const newField =  Object.assign({}, v);
            if (newField.value instanceof Array) {
                newField.value = newField.value.slice();
            } else if (newField.value instanceof Object) {
                newField.value = Object.assign({}, newField.value);
            }
            return newField;
        });
    };
    get fields() {
        return this._fields;
    }

    constructor() { }

    ngOnInit() {
    }

    getValue() {
        return this._fields;
    }

}
