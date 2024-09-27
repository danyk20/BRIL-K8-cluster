import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'bc-routed-editor',
    templateUrl: './routed-editor.component.html',
    styleUrls: ['./routed-editor.component.css']
})
export class RoutedEditorComponent implements OnInit {

    path: string;
    urlSegments = [];

    constructor(protected route: ActivatedRoute) {
    }

    ngOnInit() {
        // ActivatedRoute attributes do not need to be unsubscribed.
        this.route.url.subscribe(urlSegments => {
            this.urlSegments = urlSegments;
            this.updatePathFromURLSegments();
        });
    }

    protected updatePathFromURLSegments() {
        if (this.urlSegments.length === 0) {
            this.path = null;
            return;
        }
        this.path = this.urlSegments.reduce((acc, val, index, array) => {
            return acc + '/' + val.path;
        }, '');
    }

}
