import { environment } from '../../environments/environment';
import { NgModule, SkipSelf, Optional } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { ConfigurationsEffects } from './state/configurations.effects';
import { RunningConfigsEffects } from './state/running-configs.effects';
import { ConfigDetailsEffects } from './state/config-details.effects';
import { ActionRequestsEffects } from './state/action-requests.effects';
import { HistoryEffects } from './state/history.effects';
import { reducers, makeLoggingReducer } from './state/state.reducer';

import { ConfigurationsService } from './services/configurations.service';
import { AlarmService } from './services/alarm.service';


@NgModule({
    declarations: [],
    imports: [
        StoreModule.forRoot(reducers, { metaReducers: [makeLoggingReducer] }),
        EffectsModule.forRoot([
            ConfigurationsEffects,
            RunningConfigsEffects,
            ConfigDetailsEffects,
            ActionRequestsEffects,
            HistoryEffects,
        ]),
        !environment.production ? StoreDevtoolsModule.instrument({maxAge: 50}) : [],
        BrowserAnimationsModule, // Needed for clarity modals
        ClarityModule
    ],
    providers: [
        ConfigurationsService,
        AlarmService
    ],
})
export class CoreModule {

    constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error(
                'CoreModule is already loaded. Import it in the AppModule only');
        }
    }
}
