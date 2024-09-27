import {
    Injectable, ViewContainerRef, NgModuleFactory,
    NgModuleRef, Compiler, Injector, ComponentFactory, Type, NgModule
} from '@angular/core';

import { widgetModuleSelector } from 'app/widgets/widget-module-selector';


@Injectable({providedIn: 'root'})
export class DynamicWidgetService {

    // Contains the already registered modules
    protected registeredModules = {};
    // Get the widgets that are supported for quickly checking availability
    protected availableWidgets = Object.keys(widgetModuleSelector);

    constructor(private compiler: Compiler,
                private injector: Injector,
                ) {}

    // Registers a module, saving its NgModuleRef and entryComponent in order to
    // avoid multiple compilations of the same module.
    protected registerModule(widget: string, mod: NgModuleRef<any>, comp: Type<any>) {
        if (this.getModule(widget)) {
            throw new Error('Module already registered ' + widget);
        }
        this.registeredModules[widget] = {
                                            "ref": mod,
                                            "entry": comp
                                          };
    }

    // Returns the module or undefined if the module is not yet registered
    protected getModule(widget: string) {
        return this.registeredModules[widget];
    }

    // Return a loaded module based on string input
    async selectWidget(widget: string) {
        switch (widget) {
            case 'static-label':
                return (await import('app/widgets/static-label-widget/static-label-widget.module').then(m => m.StaticLabelWidgetModule));

            case 'label':
                return (await import('app/widgets/label-widget/label-widget.module').then(m => m.LabelWidgetModule));

            case 'time-query':
                return (await import('app/widgets/time-query-widget/time-query-widget.module').then(m => m.TimeQueryWidgetModule));

            case 'range-query':
                return (await import('app/widgets/range-query/range-query.module').then(m => m.RangeQueryModule));

            case 'fill-run-ls-query':
                return (await import('app/widgets/fill-run-ls-query-widget/fill-run-ls-query-widget.module').then(m => m.FillRunLsQueryWidgetModule));

            case 'event-bus-tester':
                return (await import('app/widgets/event-bus-test-widget/event-bus-test-widget.module').then(m => m.EventBusTestWidgetModule));

            case 'numeric-field':
                return (await import('app/widgets/numeric-field/numeric-field.module').then(m => m.NumericFieldModule));

            case 'array-snapshot':
                return (await import('app/widgets/array-snapshot/array-snapshot.module').then(m => m.ArraySnapshotModule));

            case 'array-lines':
                return (await import('app/widgets/array-field/array-lines.module').then(m => m.ArrayLinesModule));

            case 'array-lines-basicx':
                return (await import('app/widgets/array-field/array-lines-basicx.module').then(m => m.ArrayLinesBasicXModule));

            case 'array-heatmap':
                return (await import('app/widgets/array-field/array-heatmap.module').then(m => m.ArrayHeatmapModule));

            case 'numeric-field-with-ratios':
                return (await import('app/widgets/numeric-field-with-ratios/numeric-field-with-ratios.module').then(m => m.NumericFieldWithRatiosModule));

            case 'pileup':
                return (await import('app/widgets/pileup/pileup.module').then(m => m.PileupModule));

            case 'images':
                return (await import('app/widgets/binary-images/binary-images.module').then(m => m.BinaryImagesModule));

            case 'dynamic-form-test':
                return (await import('app/widgets/dynamic-form-test/dynamic-form-test.module').then(m => m.DynamicFormTestModule));

            case 'numeric-field-split':
                return (await import('app/widgets/numeric-field-split/numeric-field-split.module').then(m => m.NumericFieldSplitModule));

            case 'vdm-bx':
                return (await import('app/widgets/vdm-bx/vdm-bx.module').then(m => m.VDMBXModule));

            case 'string-plus-date-query':
                return (await import('app/widgets/string-plus-date-query/string-plus-date-query.module').then(m => m.StringPlusDateQueryModule));

            default:
                console.error("You need to add a switch case for the new widget you implemented: " + widget);
                return Promise.reject("You need to add a switch case for the new widget you implemented: " + widget);
        }
    }

    // Compiles module if it is not already registered and instantiates components
    loadWidget(widget: string, container: ViewContainerRef, config: any) {
        if(!(this.availableWidgets.includes(widget))) {
            console.error('No such widget declared: ', widget);
            return Promise.reject('No such widget: ' + widget);
        } else {
            return this.selectWidget(widget)
                .then((moduleCode: Type<any>) => {
                    let moduleObject = this.getModule(widget);
                    if (!moduleObject) { // if the module is not registered
                        let moduleFactory = this.compiler.compileModuleSync(moduleCode);
                        let ngModuleRef = moduleFactory.create(container.injector);
                        let entryComponent = moduleFactory.moduleType["entry"];
                        this.registerModule(widget, ngModuleRef, entryComponent);

                        let componentFactory = ngModuleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
                        let componentRef = container.createComponent(componentFactory);
                        componentRef.instance['config'] = config;
                        componentRef.changeDetectorRef.detectChanges();
                        componentRef.onDestroy(()=> {
                            componentRef.changeDetectorRef.detach();
                        });
                    } else { // if the module is already registered
                        let ngModuleRef = moduleObject.ref;
                        let entryComponent = moduleObject.entry;

                        let componentFactory = ngModuleRef.componentFactoryResolver.resolveComponentFactory(entryComponent);
                        let componentRef = container.createComponent(componentFactory);
                        componentRef.instance['config'] = config;
                        componentRef.changeDetectorRef.detectChanges();
                        componentRef.onDestroy(()=> {
                            componentRef.changeDetectorRef.detach();
                      });
                    }

                    return true;
                });
        }
    }
}
