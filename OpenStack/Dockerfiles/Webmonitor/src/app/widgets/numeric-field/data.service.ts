import { Injectable } from '@angular/core';
import { DatabaseService } from 'app/core/database.service';
import { QueryCache } from 'app/shared/query-cache/query-cache';
import { map } from 'rxjs/operators';

export const MAX_QUERY_SIZE = 10000;
export const MAX_QUERY_SIZE_FOR_NEWEST = 200;

export interface FieldParameter {
    name: string;
    seriesName?: string;
    color?: string;
    yAxis?: number;
    errorField?: string;
    forceMarkers?: boolean;
}

export interface ExtraFieldParameter {
    name: string;
    renameTo?: string;
}

export interface SourceParameter {
    index: string;
    fields: Array<FieldParameter>;
    extraFields: Array<ExtraFieldParameter>;
    nestedPath?: string;
    documentType?: string;
    timestampField?: string;
    terms?: { string: any };
}

export interface Parameters {
    database: string;
    sources: Array<SourceParameter>;
}

@Injectable()
export class DataService {

    queryCache = new QueryCache(1000);

    constructor(protected db: DatabaseService) {}

    protected _query(queries, params: Parameters, aggregated=false) {
        params.sources.forEach((s, i) => {
            this.db.transformQueryWithNestedPath(queries[i*2 + 1], s.nestedPath);
        });
        let extractResponse;
        if (aggregated) {
            extractResponse = (response) => this.extractAggregatedResponseFields(response, params);
        } else {
            extractResponse = (response) => this.extractResponseFields(response, params);
        }
        return this.db.multiSearch(this.db.stringifyToNDJSON(queries), params.database)
            .pipe(map(extractResponse));
    }

    queryMaxValue(database, index, documentType, nestedPath, field) {
        const query = this.makeMaxQuery(index, documentType, field);
        this.db.transformQueryWithNestedPath(query[1], nestedPath);
        const queryStr = this.db.stringifyToNDJSON(query);
        const queryObs = this.db.multiSearch(queryStr, database).pipe(
            map(this.extractMax.bind(this))
        );
        return this.queryCache.ask(
            database + index + queryStr, queryObs
        );
    }

    queryExtremesByTerms(params, terms) {
        let queries = [];
        params.sources.forEach((source, i) => {
            const query = this.makeExtremesQuery(source);
            const term = terms[i];
            query[1]['query']['bool']['filter'].push({"term": term});
            this.db.transformQueryWithNestedPath(query[1], params.nestedPath);
            queries = queries.concat(query);
        });
        return this.db.multiSearch(this.db.stringifyToNDJSON(queries), params.database)
            .pipe(map(this.extractExtremes.bind(this)));
    }

    queryTerms(params, terms) {
        let queries = [];
        params.sources.forEach((source, i) => {
            const query = this.makeSingleSourceQuery(source);
            const term = terms[i];
            query[1]['query']['bool']['filter'].push({"term": term});
            queries = queries.concat(query);
        });
        return this._query(queries, params, false);
    }

    queryDateRangeAggregated(params: Parameters, min, max, aggregation='avg', buckets=1800) {
        let queries = [];
        params.sources.forEach(source => {
            queries = queries.concat(
                this.makeSingleSourceAggregationQuery(
                    source, min, max, aggregation, buckets)
            );
        });
        return this._query(queries, params, true);
    }

    queryNewest(params: Parameters, size) {
        let queries = [];
        params.sources.forEach(source => {
            const query = this.makeSingleSourceQuery(source);
            query[1]['size'] = size;
            queries = queries.concat(query);
        });
        return this._query(queries, params, false);
    }

    queryRange(params: Parameters, field, min, max) {
        let queries = [];
        params.sources.forEach(source => {
            const query = this.makeSingleSourceQuery(source);
            const range = {};
            range[field] = {"gte": min, "lte": max};
            query[1]['query']['bool']['filter'].push({"range": range});
            queries = queries.concat(query);
        });
        return this._query(queries, params, false);
    }

    queryDateRange(params: Parameters, min, max) {
        let queries = [];
        params.sources.forEach(source => {
            const query = this.makeSingleSourceQuery(source);
            const range = {};
            range[source.timestampField] = {"gte": min, "lte": max};
            query[1]['query']['bool']['filter'].push({"range": range});
            queries = queries.concat(query);
        });
        return this._query(queries, params, false);
    }

    queryNewestSince(params: Parameters, perSourceMin) {
        let queries = [];
        params.sources.forEach((source, i) => {
            const query = this.makeSingleSourceQuery(source);
            query[1]['size'] = MAX_QUERY_SIZE_FOR_NEWEST;
            const range = {};
            range[source.timestampField] = {
                "gte": perSourceMin[i]
            }
            query[1]['query']['bool']['filter'].push({"range": range});
            queries = queries.concat(query);
        });
        return this._query(queries, params, false);
    }

    protected makeSingleSourceAggregationQuery(
        source: SourceParameter, min, max, aggregation='avg', buckets=1800) {
        const header = {
            index: source.index,
            type: source.documentType
        };
        const interval = Math.ceil(
            ((new Date(max)).getTime() - (new Date(min)).getTime()) / buckets
        );
        const body = {
            'size':0,
            'query': {'bool': {'filter': []}},
            'aggs': {
                'points': {
                    'date_histogram': {
                        'field': source.timestampField,
                        'interval': String(interval) + 'ms',
                        'extended_bounds': {'min': min, 'max': max}
                    },
                    'aggs': {}
                }
            }
        };
        body['query']['bool']['filter'].push({
            'range':{'timestamp':{'gte': min, 'lte': max}}
        });
        if (source.extraFields.length > 0) {
            body['aggs']['points']['aggs']['_extra'] = {'top_hits': {'size': 1}};
            body['aggs']['points']['aggs']['_extra']['top_hits']['_source'] = {
                'include': source.extraFields.map(f => f.name)
            };
            const topHitsSort = {};
            topHitsSort[source.timestampField] = {'order': 'desc'};
            body['aggs']['points']['aggs']['_extra']['top_hits']['sort'] = [topHitsSort];
        }
        source.fields.forEach(f => {
            const agg = {};
            agg[aggregation] = {'field': f.name};
            body['aggs']['points']['aggs'][f.name] = agg;
        });
        if (source.terms) {
            Object.keys(source.terms).forEach(k => {
                const term = {};
                term[k] = source.terms[k];
                body['query']['bool']['filter'].push({'term': term});
            });
        }
        return [header, body];
    }

    protected makeMaxQuery(index, documentType, field) {
        const header = {
            index: index,
            type: documentType
        };
        const sort = {};
        sort[field] = {order: 'desc'};
        const body = {
            "_source": [field],
            "sort": sort,
            "size": 1
        };
        return [header, body];
    }

    protected makeExtremesQuery(source) {
        const header = {
            index: source.index,
            type: source.documentType
        };
        const body = {
            "sort": {},
            "size": 0,
            "query": {
                "bool": {
                    "filter": []
                }
            },
            'aggs':{
                'min_ts':{
                    'min':{
                        'field': source.timestampField
                    }
                },
                'max_ts':{
                    'max':{
                        'field': source.timestampField
                    }
                }
            }
        };
        if (source.terms) {
            Object.keys(source.terms).forEach(k => {
                const term = {};
                term[k] = source.terms[k];
                body['query']['bool']['filter'].push({'term': term});
            });
        }
        return [header, body];
    }

    protected makeSingleSourceQuery(source: SourceParameter) {
        const header = {
            index: source.index,
            type: source.documentType
        };
        const body = {
            "_source": this.parseQueryFields(source),
            "sort": {},
            "size": MAX_QUERY_SIZE,
            "query": {
                "bool": {
                    "filter": []
                }
            }
        };
        body['sort'][source.timestampField] = "desc";
        if (source.terms) {
            Object.keys(source.terms).forEach(k => {
                const term = {};
                term[k] = source.terms[k];
                body['query']['bool']['filter'].push({"term": term});
            });
        }
        return [header, body];
    }

    protected parseQueryFields(source: SourceParameter) {
        const fields = [source.timestampField || 'timestamp'];
        source.fields.forEach(f => {
            fields.push(f.name);
            if (f.errorField) {
                fields.push(f.errorField);
            }
        });
        source.extraFields.forEach(f => {
            fields.push(f.name);
        });
        return fields;
    }

    protected extractResponseFields(response, params: Parameters) {
        const responseFields = response['responses']
            .map(r => r['hits']['hits'].reverse())
            .map((hits, i) => {
                if (params.sources[i].nestedPath) {
                    return hits.map(hit => hit['_source'][params.sources[i].nestedPath]);
                } else {
                    return hits.map(hit => hit['_source']);
                }
            });
        params.sources.forEach((s, i) => {
            s.extraFields.forEach(f => {
                if (!f.renameTo) {
                    return;
                }
                responseFields[i].forEach(hit => {
                    hit[f.renameTo] = hit[f.name];
                })
            });
        });
        return responseFields;
    }

    protected extractAggregatedResponseFields(response, params: Parameters) {
        const result = [];
        params.sources.forEach((source, i) => {
            const buckets = response['responses'][i]['aggregations']['points']['buckets'];
            const sourceResult = [];
            buckets.forEach(bucket => {
                const point = {};
                point[source.timestampField] = bucket['key_as_string'];
                source.fields.forEach(field => {
                    point[field.name] = bucket[field.name]['value'];
                    if (field.errorField) {
                        point[field.errorField] = bucket[field.errorField]['value'];
                    }
                });
                source.extraFields.forEach(field => {
                    const name = field.renameTo || field.name;
                    const hit = bucket['_extra']['hits']['hits'][0];
                    point[name] = hit ? hit['_source'][field.name] : undefined;
                });
                sourceResult.push(point);
            });
            result.push(sourceResult);
        });
        return result;
    }

    protected extractExtremes(response) {
        const perSource = response['responses']
            .map(r => r['aggregations']);
        const min = perSource.map(e => e['min_ts']);
        const max = perSource.map(e => e['max_ts']);
        const gMin = min.reduce((result, el) => el['value'] < result ? el['value'] : result);
        const gMax = max.reduce((result, el) => el['value'] < result ? el['value'] : result);
        return {
            min: gMin,
            max: gMax,
            perSourceMin: min,
            perSourceMax: max
        }
    }

    protected extractMax(response) {
        try {
            return {value: response['responses'][0]['hits']['hits'][0]['sort'][0]};
        } catch {
            return {};
        }
    }
}
