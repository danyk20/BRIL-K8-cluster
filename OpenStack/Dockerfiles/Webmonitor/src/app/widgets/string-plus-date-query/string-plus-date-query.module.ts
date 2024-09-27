import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { StringPlusDateQueryComponent } from './string-plus-date-query.component';

@NgModule({
    imports: [
        CommonModule,
        SharedModule
    ],
    declarations: [StringPlusDateQueryComponent]
})
export class StringPlusDateQueryModule {
    static entry = StringPlusDateQueryComponent;
}
