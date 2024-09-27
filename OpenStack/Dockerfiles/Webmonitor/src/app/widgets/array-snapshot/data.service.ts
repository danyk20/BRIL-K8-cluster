import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { map } from 'rxjs/operators';


export interface FieldParameter {
    name: string;
    seriesName?: string;
    mask?: string;
    error?: string;
    color?: string;
}

export interface Parameters {
    database: string;
    index: string;
    documentType?: string;
    timestampField?: string;
    fields: Array<FieldParameter>;
    terms?: { string: any };
    runField?: string;
    lsField?: string;
    nestedPath?: string;
}


@Injectable()
export class DataService {

    constructor(protected db: DatabaseService) {

    }

    queryTerms(params: Parameters, terms: Array<any>, ranges?: Array<any>) {
        let query = this.makeQuery(params);
        if (terms.length) {
            terms.forEach(t => {
                query[1]['query']['bool']['filter'].push({"term": t});
            });
        }
        if (ranges && ranges.length) {
            ranges.forEach(r => {
                query[1]['query']['bool']['filter'].push({"range": r});
            });
        }
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this.db.multiSearch(this.db.stringifyToNDJSON(query), params.database)
            .pipe(
                map(response => this.extractResponseFields(response, params))
            );
    }

    queryNewest(params: Parameters) {
        let query = this.makeQuery(params);
        this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
        return this.db.multiSearch(this.db.stringifyToNDJSON(query), params.database)
            .pipe(
                map(response => this.extractResponseFields(response, params))
            );
    }

    protected makeQuery(params: Parameters) {
        const header = {
            "index": params.index,
            "type": params.documentType
        };
        const body = {
            "_source": this.parseQueryFields(params),
            "size": 1,
            "sort": {},
            "query": {
                "bool": {
                    "filter": []
                }
            }
        };
        body['sort'][params.timestampField || 'timestamp'] = 'desc';
        if (params.terms) {
            Object.keys(params.terms).forEach(k => {
                const term = {};
                term[k] = params.terms[k];
                body['query']['bool']['filter'].push({"term": term});
            });
        }
        return [header, body];
    }

    protected parseQueryFields(params: Parameters) {
        const fields = [params.timestampField || 'timestamp'];
        params.fields.forEach(f => {
            fields.push(f.name);
            if (f.mask) {
                fields.push(f.mask);
            }
            if (f.error) {
                fields.push(f.error);
            }
        });
        return fields;
    }

    protected extractResponseFields(response, params) {
        response = response['responses'][0]['hits']['hits']
            .map(hit => hit['_source']);
        if (params.nestedPath) {
            response = response.map(hit => hit[params.nestedPath]);
        }
        return response;


    }

}
