import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
    { path: '', redirectTo: '/overview', pathMatch: 'full'},
    { path: 'overview', loadChildren: () => import('app/features/overview/overview.module').then(m => m.OverviewModule)},
    { path: 'editor', loadChildren: () => import('app/features/routed-editor/routed-editor.module').then(m => m.RoutedEditorModule)},
    { path: 'standalone', loadChildren: () => import('app/features/standalone/standalone.module').then(m => m.StandaloneModule)}
];

export const AppRouting: ModuleWithProviders<RouterModule> = RouterModule.forRoot(appRoutes, {});
