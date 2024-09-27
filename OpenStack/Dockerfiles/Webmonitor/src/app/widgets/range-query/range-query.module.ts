import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { RangeQueryComponent } from './range-query.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [RangeQueryComponent]
})
export class RangeQueryModule {
    static entry = RangeQueryComponent;
}
