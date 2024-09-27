import { EventEmitter } from '@angular/core';
import { QueryEvent } from './query-event'

export interface QueryForm {
    onQuery: EventEmitter<QueryEvent>;
}
