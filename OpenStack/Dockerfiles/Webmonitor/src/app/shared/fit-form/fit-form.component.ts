import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { FitFormService } from './data.service';

@Component({
    selector: 'wm-fit-form',
    templateUrl: './fit-form.component.html',
    styleUrls: ['./fit-form.component.css']
})
export class FitFormComponent implements OnInit {

    @Input('database') database: string;
    @Input('index') index: string;
    @Output('onChange') queryFits = new EventEmitter<string[]>();

    fitNames: string[];
    selected;
    selection;

    constructor(protected dataService: FitFormService) { }

    ngOnInit() {
        // Query detector names
        if (this.database && this.index) {
            const names = this.dataService.queryFitNames(this.index, this.database).pipe(
                map(this.setDropdown.bind(this))
            );
            names.subscribe();
        }
    }

    // Get results of the query for the detector names
    setDropdown(result) {
        if (this.index === "vdmtest") {
            let response = result.responses[0].aggregations.fit_names.buckets;
            this.fitNames = [];
            response.forEach((fit, i) => {
                this.fitNames[i] = fit.key;
            })
        }
    }

    onChange(event) {
        this.queryFits.emit(this.selection);
    }
    
}
