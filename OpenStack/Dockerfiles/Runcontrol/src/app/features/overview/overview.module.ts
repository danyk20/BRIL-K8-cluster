import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { StoreModule } from '@ngrx/store';

import { RouterModule } from '@angular/router';
import { OverviewRouting } from './overview.routing';

import { OverviewComponent } from './overview.component';
import { OverviewHeaderComponent } from './overview-header/overview-header.component';
import { OverviewTreeComponent } from './overview-tree/overview-tree.component';
import { TreeNodeComponent } from './overview-tree/tree-node/tree-node.component';
import { OverviewActivePanelComponent } from './overview-active-panel/overview-active-panel.component';
import { ActionMenuComponent } from './action-menu/action-menu.component';
import { ConfigFieldsComponent } from './config-fields/config-fields.component';
import { ConfigFieldComponent } from './config-fields/config-field/config-field.component';
import * as overviewReducer from './state/overview.reducer';
import { OldVersionIndicatorComponent } from './old-version-indicator/old-version-indicator.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ClarityModule,
        RouterModule,
        OverviewRouting,
        StoreModule.forFeature('overviewModule', overviewReducer.reducer)
    ],
    declarations: [
        OverviewComponent,
        OverviewActivePanelComponent,
        OverviewTreeComponent,
        OverviewHeaderComponent,
        ActionMenuComponent,
        TreeNodeComponent,
        ConfigFieldsComponent,
        ConfigFieldComponent,
        OldVersionIndicatorComponent
    ],
    providers: [
        OverviewComponent
    ],
    exports: [
        OverviewComponent,
        OverviewTreeComponent,
        OverviewActivePanelComponent,
        ActionMenuComponent
    ]
})
export class OverviewModule { }
