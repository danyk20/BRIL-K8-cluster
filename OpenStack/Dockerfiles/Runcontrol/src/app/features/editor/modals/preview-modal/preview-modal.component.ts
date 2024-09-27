import { Component, OnInit, Input, Output, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import * as ace from 'brace';
import 'brace/mode/xml';

const VirtualRenderer = ace.acequire('ace/virtual_renderer').VirtualRenderer;
const Editor = ace.acequire('ace/editor').Editor;
const EditSession = ace.acequire('ace/edit_session').EditSession;

@Component({
    selector: 'preview-modal',
    templateUrl: './preview-modal.component.html',
    styleUrls: ['./preview-modal.component.css']
})
export class PreviewModalComponent implements OnInit, AfterViewInit {

    @ViewChild('editorContainer') editorContainer;

    @Output() close = new EventEmitter();
    protected _state;
    @Input() set state(newState) {
        this._state = newState;
        this.setEditorText();
    };
    get state() {
        return this._state;
    }

    editor: ace.Editor;

    constructor() { }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.initializeEditor();
    }

    initializeEditor() {
        if (this.editor || !this.editorContainer) {
            return;
        }
        const renderer = new VirtualRenderer(this.editorContainer.nativeElement);
        const session = new EditSession('', 'ace/mode/xml');
        this.editor = new Editor(renderer, session);
        this.editor.$blockScrolling = Infinity;
        this.editor.setReadOnly(true);
    }

    setEditorText() {
        if (this.editor) {
            this.editor.setValue(this.state.xml);
        }
    }

    onClickClose() {
        console.log('click close');
        this.close.emit();
    }

}
