import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { NumericFieldSplitComponent } from './numeric-field-split.component';
import { DataService } from '../numeric-field/data.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [NumericFieldSplitComponent],
    providers: [DataService]
})
export class NumericFieldSplitModule {
    static entry = NumericFieldSplitComponent;
}
