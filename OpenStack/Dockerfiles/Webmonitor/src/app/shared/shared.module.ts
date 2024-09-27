import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';

import { DynamicFormModule } from './dynamic-form/dynamic-form.module';
import { WidgetComponent } from './widget/widget.component';
import { SettingsComponent } from './widget/settings/settings.component';
import { QuickDateFormComponent } from './quick-date-form/quick-date-form.component';
import { DateRangeFormComponent } from './date-range-form/date-range-form.component';
import { RangeFormComponent } from './range-form/range-form.component';
import { DelimitedFormComponent } from './delimited-form/delimited-form.component';
import { FillRunLsFormComponent } from './fill-run-ls-form/fill-run-ls-form.component';
import { StringPlusDateFormComponent } from './string-plus-date-form/string-plus-date-form.component';
import { DynamicQueryFormComponent } from './dynamic-query-form/dynamic-query-form.component';
import { DetectorFormComponent } from './detector-form/detector-form.component';
import { FitFormComponent } from './fit-form/fit-form.component';

import { DetectorFormService } from './detector-form/data.service';
import { FitFormService } from './fit-form/data.service';
import {NzDatePickerComponent} from 'ng-zorro-antd/date-picker';
import {NzSpaceComponent} from 'ng-zorro-antd/space';
import {NzOptionComponent, NzSelectComponent} from 'ng-zorro-antd/select';
import {PickerComponent} from '../picker/picker.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ClarityModule,
        DynamicFormModule,
        NzDatePickerComponent,
        NzSpaceComponent,
        NzSelectComponent,
        NzOptionComponent,
        PickerComponent
    ],
    declarations: [
        WidgetComponent,
        SettingsComponent,
        DateRangeFormComponent,
        FillRunLsFormComponent,
        RangeFormComponent,
        DelimitedFormComponent,
        QuickDateFormComponent,
        StringPlusDateFormComponent,
        DynamicQueryFormComponent,
        DetectorFormComponent,
        FitFormComponent
    ],
    providers: [DetectorFormService, FitFormService],
    exports: [
        CommonModule,
        ClarityModule,
        FormsModule, ReactiveFormsModule,
        DynamicFormModule,
        WidgetComponent, DateRangeFormComponent, FillRunLsFormComponent,
        RangeFormComponent, DelimitedFormComponent, QuickDateFormComponent,
        StringPlusDateFormComponent, DynamicQueryFormComponent, DetectorFormComponent,
        FitFormComponent
    ]
})
export class SharedModule { }
