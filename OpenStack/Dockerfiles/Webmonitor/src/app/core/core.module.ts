import {
    ModuleWithProviders, Optional, SkipSelf, NgModule
} from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule } from '@angular/forms'
import { ClarityModule } from '@clr/angular';
import { DragulaModule } from 'ng2-dragula';
import { NgxPopperjsModule } from 'ngx-popperjs';
import { SharedModule } from '../shared/shared.module';

import { DynamicWidgetService } from './dynamic-widget/dynamic-widget.service';
import { DatabaseService } from './database.service';
import { TimersService } from './timers.service';
import { EventBusService } from './event-bus.service';
import { SandboxPresetService } from './sandbox-preset.service';

import { DashboardComponent } from './dashboard/dashboard.component';
import { DynamicWidgetComponent } from './dynamic-widget/dynamic-widget.component';
import { DashboardContainerResizeFormComponent } from './dashboard/dashboard-container-resize-form/dashboard-container-resize-form.component';

@NgModule({ declarations: [
        DashboardComponent,
        DynamicWidgetComponent,
        DashboardContainerResizeFormComponent,
    ],
    exports: [
        DashboardComponent
    ], imports: [FormsModule,
        ClarityModule,
        DragulaModule.forRoot(),
        SharedModule,
        NgxPopperjsModule.forRoot({
            disableAnimation: true,
            disableDefaultStyling: true,
            positionFixed: true,
            hideOnClickOutside: true
        })], providers: [
        DynamicWidgetService,
        DatabaseService,
        TimersService,
        EventBusService,
        SandboxPresetService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class CoreModule {
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error('Tried loading CoreModule more than once.')
        }
    }

    static forRoot(): ModuleWithProviders<CoreModule> {
        return {
            ngModule: CoreModule,
            providers: []
        }
    }
}
