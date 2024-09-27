import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { map } from 'rxjs/operators';

@Injectable()
export class DetectorFormService {

    constructor(protected db: DatabaseService) {}

    queryDetectorNames(index, database) {
        const query = this.makeDetectorNameQuery(index);
        const queryJSON = this.db.stringifyToNDJSON(query);
        return this.db.queryNDJson('_msearch', queryJSON, database);
    }
    
    // Creates request for quering the detector names
    protected makeDetectorNameQuery(index) {
        const header = {'index': index};

        let body;
        if (index === 'vdmtest') {
            body = {
                '_source': ['detector'],
                'size':0,
                'aggs': {
                    'detector_names': {
                        'terms': {
                            'field': 'detector.keyword',
                            'size': 1000,
                        }
                    }
                }
            };
        } else if (index === 'cmsos-data-bril-vdmshape' || index === 'cmsos-data-bril-vdmsigma') {
            body = {
                '_source': ['detectorname'],
                'size': 1000
            };
        } else {
            return '';
        }

        return [header, body];
    }


}
