import {Component, EventEmitter, Output} from '@angular/core';

import {FormsModule} from '@angular/forms';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';


@Component({
    selector: 'timestamp-picker',
    templateUrl: './picker.component.html',
    standalone: true,
    imports: [FormsModule, NzDatePickerModule],
    styleUrl: './picker.component.css'
})
export class PickerComponent {
    @Output('selectedRange')
    chosenRange: EventEmitter<Date[]> = new EventEmitter<Date[]>();
    dates: Date[] = []

    onChange(dateRange: Date[]): void {
        this.chosenRange.emit(dateRange)
    }
}
