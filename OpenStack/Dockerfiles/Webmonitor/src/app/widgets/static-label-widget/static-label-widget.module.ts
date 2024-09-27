import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticLabelWidgetComponent } from './static-label-widget.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [StaticLabelWidgetComponent]
})
export class StaticLabelWidgetModule {
    static entry = StaticLabelWidgetComponent;
}
