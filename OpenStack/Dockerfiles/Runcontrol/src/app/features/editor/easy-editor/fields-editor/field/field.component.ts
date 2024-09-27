import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'field',
    templateUrl: './field.component.html',
    styleUrls: ['./field.component.css'],
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldComponent implements OnInit {

    ObjectKeys = Object.keys;

    protected _field;
    @Input() set field(newField) {
        this._field = newField;
        if (this._field.type === 'bool') {
            if (this._field.value === 'false') {
                this._field.value = false;
            } else {
                this._field.value = true;
            }
        }
    }
    get field() {
        return this._field;
    }

    newStringItemValue = '';
    newStringItemKey = '';

    constructor() { }

    ngOnInit() {
    }

    stringItemMoveUp(index) {
        if (index === 0) {
            return;
        }
        const tmp = this.field.value[index - 1];
        this.field.value[index - 1] = this.field.value[index];
        this.field.value[index] = tmp;
    }

    stringItemMoveDown(index) {
        if (index === this.field.value.length -1) {
            return;
        }
        const tmp = this.field.value[index + 1];
        this.field.value[index + 1] = this.field.value[index];
        this.field.value[index] = tmp;
    }

    stringItemRemove(keyOrIndex) {
        if (this.field.type === 'stringMap') {
            delete this.field.value[keyOrIndex];
        } else {
            this.field.value.splice(keyOrIndex, 1);
        }
    }

    stringItemAdd() {
        if (this.field.type === 'commaSeparatedString' && this.newStringItemValue.indexOf(',') < 0) {
            this.field.value.push(this.newStringItemValue);
            this.newStringItemValue = '';
        } else if (this.field.type === 'stringArray' && this.newStringItemKey) {
            this.field.value.push([this.newStringItemKey, this.newStringItemValue]);
            this.newStringItemValue = '';
            this.newStringItemKey = '';
        } else if (this.field.type === 'stringMap' && this.newStringItemKey) {
            if (this.field.value.hasOwnProperty(this.newStringItemKey)) {
                return;
            }
            this.field.value[this.newStringItemKey] = this.newStringItemValue;
            this.newStringItemValue = '';
            this.newStringItemKey = '';
        }
    }

}
