import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DragulaModule } from 'ng2-dragula';
import { ClarityModule } from '@clr/angular';
import { FormsModule } from '@angular/forms'
import { SharedModule } from '../../shared/shared.module';

import { DashboardComponent } from './dashboard.component';
import { DashboardContainerResizeFormComponent } from './dashboard-container-resize-form/dashboard-container-resize-form.component';
import { DynamicWidgetComponent } from '../dynamic-widget/dynamic-widget.component';
import { TimersService } from '../timers.service';
import { DatabaseService } from '../database.service';
import { EventBusService } from '../event-bus.service';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ DashboardComponent, DashboardContainerResizeFormComponent, DynamicWidgetComponent ],
            imports: [DragulaModule, ClarityModule, FormsModule, SharedModule],
            providers: [TimersService, EventBusService, DatabaseService]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
