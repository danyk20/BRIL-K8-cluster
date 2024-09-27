import {
    Component, OnInit, Input, Output, EventEmitter, ComponentFactoryResolver,
    ViewChild, ViewContainerRef
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { QueryForm } from 'app/shared/query-form';
import { QueryEvent } from 'app/shared/query-event';

@Component({
    selector: 'wm-dynamic-query-form',
    templateUrl: './dynamic-query-form.component.html'
})
export class DynamicQueryFormComponent implements OnInit {

    @Input('component') component;
    @Input('config') config: any;
    @Output('query') onQuery = new EventEmitter<QueryEvent>();
    @ViewChild('content', { read: ViewContainerRef, static: true }) content: ViewContainerRef;

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngOnInit() {
        const componentFactory = this.componentFactoryResolver
            .resolveComponentFactory(this.component);
        this.content.clear();
        const componentRef = this.content.createComponent(componentFactory);
        if (this.config) {
            Object.keys(this.config).forEach(k => {
                componentRef.instance[k] = this.config[k];
            });
        }
        (<QueryForm>componentRef.instance).onQuery = this.onQuery;
    }


}
