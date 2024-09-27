import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core/core.module';

import { SharedModule } from './shared/shared.module';
import { SettingsModule } from './settings/settings.module';
import { AppLocationModule } from './app-location';
import { WidgetsModule } from './widgets/widgets.module';

import { PresetResolveService } from './preset-resolve.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ClarityModule } from '@clr/angular';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';

registerLocaleData(en);

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CoreModule.forRoot(),
        SharedModule,
        SettingsModule,
        WidgetsModule,
        AppLocationModule,
        ClarityModule,
        FormsModule,
    ],
    declarations: [
        AppComponent,
        HomeComponent,
    ],
    providers: [
        PresetResolveService,
        { provide: NZ_I18N, useValue: en_US },
        provideAnimationsAsync(),
        provideHttpClient()
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
