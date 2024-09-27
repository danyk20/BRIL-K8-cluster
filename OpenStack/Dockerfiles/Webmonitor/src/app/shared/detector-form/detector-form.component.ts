import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { DetectorFormService } from './data.service';

@Component({
    selector: 'wm-detector-form',
    templateUrl: './detector-form.component.html',
    styleUrls: ['./detector-form.component.css']
})
export class DetectorFormComponent implements OnInit {

    @Input('database') database: string;
    @Input('index') index: string;
    @Output('onChange') queryDetectors = new EventEmitter<string[]>();

    detectorNames: string[];
    selected;
    selection;

    constructor(protected dataService: DetectorFormService) { }

    ngOnInit() {
        // Query detector names
        if (this.database && this.index) {
            const names = this.dataService.queryDetectorNames(this.index, this.database).pipe(
                map(this.setDropdown.bind(this))
            );
            names.subscribe();
        }
    }

    // Get results of the query for the detector names
    setDropdown(result) {
        if (this.index === "vdmtest") {
            let response = result.responses[0].aggregations.detector_names.buckets;
            this.detectorNames = [];
            response.forEach((detector, i) => {
                this.detectorNames[i] = detector.key;
            })
    
        }else if (this.index === 'cmsos-data-bril-vdmshape' || this.index === 'cmsos-data-bril-vdmsigma') {
            let response = result.responses[0].hits.hits;
            this.detectorNames = [];
            response.forEach((detector, i) => {
                    
                if (!this.detectorNames.includes(detector._source.detectorname)) {
                    this.detectorNames[i] = detector._source.detectorname;
                }
            })
        }
    }

    onChange(event) {
        this.queryDetectors.emit(this.selection);
    }
    
}
