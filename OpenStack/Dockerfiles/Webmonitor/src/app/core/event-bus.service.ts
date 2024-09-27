import { Injectable } from '@angular/core';
import { Subject ,  Observable ,  Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class Event {
    constructor(public type: string, public payload: any) {}
}

class ChanneledEvent {
    constructor(public channel: number, public event: Event) {}
}

@Injectable()
export class EventBusService {

    events$ = new Subject<ChanneledEvent>();

    constructor() {

    }

    getEvents(channel: number, _filter?: string): Observable<Event> {
        let filtered =  this.events$
            .pipe(filter(x => x.channel === channel));
        if (_filter) {
            filtered = filtered.pipe(filter(x => x.event.type === _filter));
        }
        return filtered.pipe(map(x => x.event));
    }

    emit(channel: number, event: Event) {
        if (!Number.isInteger(channel)) {
            return;
        }
        this.events$.next({channel: channel, event: event});
    }

    reset() {
        this.events$.complete();
        this.events$ = new Subject<ChanneledEvent>();
    }

}
