import { Injectable } from '@angular/core';
import { Alarm } from '@app/core/models/alarm';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable()
export class AlarmService {

    alarm: Observable<Alarm>;
    protected audio: HTMLAudioElement;

    constructor(
    ) {
        this.audio = new Audio('/assets/alarm.ogg');
        this.audio.addEventListener('ended', this.onended.bind(this));
        // this.audio.onended = ... <-- is not in angular zone
    }

    play() {
        this.alarm.pipe(take(1)).subscribe(state => {
            if (!state.isPlaying) {
                this.audio.play();
                // this.store.dispatch({type: AlarmActions.STARTED});
            }
        });
    }

    onended(error) {
    //     this.store.dispatch({type: AlarmActions.ENDED});
    }
}
