import { Component, OnInit } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
    selector: 'wm-dynamic-fomr-test-widget',
    templateUrl: './dynamic-form-test.component.html'
})
export class DynamicFormTestComponent {

    quickDateFormOptions = [{
        unit: 'minutes',
        duration: 11,
        text: 'last 11 minutes'
    }, {
        unit: 'days',
        duration: 2,
        text: 'last 2 days'
    }];

    fields: Array<FormlyFieldConfig> = [{
        "key": "ch",
        "type": "number",
        "templateOptions": {
            "label": "Channels", "min": 0, "step": 0.1
        }
    }, {
        "key": "a",
        "type": "delimited-numbers",
        "templateOptions": {"label": "asdf", "delimiter": ":"}
    }];

    model = {};

    onModelChange(event) {
        console.log('FORM MODEL CHANGE', event);
    }

    onQuickDateQuery(event) {
        console.log(event);
    }
}
