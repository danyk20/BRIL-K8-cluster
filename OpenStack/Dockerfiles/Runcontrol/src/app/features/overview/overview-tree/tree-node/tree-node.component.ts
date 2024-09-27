import {
    Component, OnInit, AfterViewInit, Input, ViewChild, OnDestroy
} from '@angular/core';
import Tether from 'tether';

@Component({
    selector: 'overview-tree-node',
    templateUrl: './tree-node.component.html',
    styleUrls: ['./tree-node.component.css'],
    host: {
        '(document:click)': 'toggleDropdown($event)',
    }
})
export class TreeNodeComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() node;
    tether: Tether;
    @ViewChild('dropdown') dropdown;
    @ViewChild('dropdownMenu') dropdownMenu;
    dropdownIsOpen = false;

    constructor() { }

    ngOnInit() {
    }

    ngOnDestroy() {
        if (this.tether) {
            this.tether.destroy();
        }
        // sometimes dropdownMenu can be just left detached and not hidden,
        // below is the fix which probably is not the Angular way. But I don't
        // know how to solve this other way.
        if (this.dropdownMenu) {
            const el = this.dropdownMenu.nativeElement;
            el.parentNode.removeChild(el);
        }
    }

    ngAfterViewInit() {
        if (this.node['isLeaf']) {
            this.tether = new Tether({
                element: this.dropdownMenu.nativeElement,
                target: this.dropdown.nativeElement,
                attachment: 'middle left',
                targetAttachment: 'top right',
                offset: '0 -6px',
                constraints: [{
                    to: 'scrollParent',
                    pin: ['top', 'bottom']
                }]
            });
            this.tether.disable();
        }
    }

    toggleDropdown(event) {
        if (this.node['isLeaf']) {
            if (event['target'] === this.dropdown.nativeElement) {
                this.dropdownIsOpen = true;
                this.tether.enable();
                this.tether.position();
            } else {
                this.tether.disable();
                this.dropdownIsOpen = false;
            }
        }
    }

}
