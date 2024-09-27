import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { map } from 'rxjs/operators';

@Injectable()
export class FitFormService {

    constructor(protected db: DatabaseService) {}

    queryFitNames(index, database) {
        const query = this.makeFitNameQuery(index);
        const queryJSON = this.db.stringifyToNDJSON(query);
        return this.db.queryNDJson('_msearch', queryJSON, database);
    }
    
    // Creates request for quering the detector names
    protected makeFitNameQuery(index) {
        const header = {'index': index};

        let body;
        if (index === 'vdmtest') {
            body = {
                '_source': ['fit'],
                'size':0,
                'aggs': {
                    'fit_names': {
                        'terms': {
                            'field': 'fit.keyword',
                            'size': 1000,
                        }
                    }
                }
            };
        } else {
            return '';
        }

        return [header, body];
    }


}
