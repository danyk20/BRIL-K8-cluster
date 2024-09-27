import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { StoreModule } from '@ngrx/store';
import { RouterModule } from '@angular/router';

import { EditorModule } from '../editor/editor.module';
import { OverviewModule } from '../overview/overview.module';

import { StandaloneRouting } from './standalone.routing';
import { StandaloneComponent } from './standalone.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ClarityModule,
        RouterModule,
        StandaloneRouting,
        EditorModule,
        OverviewModule
    ],
    declarations: [
        StandaloneComponent
    ],
    providers: [
    ]
})
export class StandaloneModule { }
