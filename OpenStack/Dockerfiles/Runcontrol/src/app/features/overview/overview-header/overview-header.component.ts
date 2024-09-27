import {
    Component, EventEmitter, OnInit, Input, Output, ChangeDetectionStrategy
} from '@angular/core';
import { Alarm } from '@app/core/models/alarm';

@Component({
    selector: 'overview-header',
    templateUrl: './overview-header.component.html',
    styleUrls: ['./overview-header.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewHeaderComponent implements OnInit {

    @Input() users: Array<string> = [];
    @Input() selectedUser = null;
    @Input() isLoading = false;
    @Output() userChange = new EventEmitter();
    @Output() refresh = new EventEmitter();

    constructor() {
    }

    ngOnInit() {}

    toggleAlarmMute() {
        // this.alarmService.toggleMute();
    }

    playAlarm() {
        // this.alarmService.play();
    }

    selectUser(newUser) {
        this.userChange.emit(newUser);
    }

    onRefreshClick() {
        this.refresh.emit();
    }
}
