import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoutedEditorComponent } from './routed-editor.component';

const routes: Routes = [
    { path: '**', component: RoutedEditorComponent}
];

export const Routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
