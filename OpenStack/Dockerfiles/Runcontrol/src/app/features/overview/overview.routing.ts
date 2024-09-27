import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OverviewComponent } from './overview.component';

const overviewRoutes: Routes = [
    { path: '', component: OverviewComponent}
];

export const OverviewRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(overviewRoutes);
