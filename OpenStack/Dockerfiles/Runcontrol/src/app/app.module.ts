import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

import { AppRouting } from './app.routing';
import { CoreModule } from './core/core.module';

import { AppService } from './services/app.service';
import { AppComponent } from './app.component';
import { AlertsComponent } from './alerts/alerts.component';
import * as appReducer from './state/app.reducer';
import { AppEffects } from './state/app.effects';
import { ModalsComponent } from './modals/modals.component';
import { NameCookieModalComponent } from './modals/name-cookie-modal/name-cookie-modal.component';
import { TestModalComponent } from './modals/test-modal/test-modal.component';
import { AppRefreshModalComponent } from './modals/app-refresh-modal/app-refresh-modal.component';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({ declarations: [
        AppComponent,
        AlertsComponent,
        ModalsComponent,
        NameCookieModalComponent,
        AppRefreshModalComponent,
        TestModalComponent,
    ],
    bootstrap: [AppComponent], imports: [CommonModule,
        FormsModule,
        BrowserModule,
        AppRouting,
        StoreModule.forFeature('appModule', appReducer.reducer),
        EffectsModule.forFeature([
            AppEffects
        ]),
        CoreModule,
        ClarityModule,
        BrowserAnimationsModule], providers: [
        AppService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
