import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { StandaloneComponent } from './standalone.component';

const routes: Routes = [
    { path: '**', component: StandaloneComponent}
];

export const StandaloneRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
