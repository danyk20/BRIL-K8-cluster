import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';

import { EditorModule } from '../editor/editor.module';
import { Routing } from './routed-editor.routing';

import { RoutedEditorComponent } from './routed-editor.component';

@NgModule({
    imports: [
        CommonModule,
        EditorModule,
        Routing,
        ClarityModule
    ],
    declarations: [
        RoutedEditorComponent
    ]
})
export class RoutedEditorModule { }
