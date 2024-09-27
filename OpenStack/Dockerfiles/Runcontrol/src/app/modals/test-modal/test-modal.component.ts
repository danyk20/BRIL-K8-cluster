import { Component, OnInit, Input } from '@angular/core';
import { Modal } from '../modal';

@Component({
    selector: 'test-modal',
    templateUrl: './test-modal.component.html',
    styleUrls: ['./test-modal.component.css']
})
export class TestModalComponent extends Modal {

    constructor() {
        super();
    }

}
