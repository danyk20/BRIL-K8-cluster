import {
    Component, OnInit, Input, ChangeDetectionStrategy
} from '@angular/core';
import { Configuration } from '@app/core/models/configuration';
import { STATES } from '@app/core/models/running-details';
import { customConfigSortFn } from '@app/shared/utils/custom-sort';
import { ActionRequest } from '@app/core/models/action-request';
import { RequestFailedState } from '@app/core/models/request-state';

class Leaf {
    name: string;
    isLeaf = true;
    actionRequest: ActionRequest = null;
    icon = 'document';
    iconClass = 'is-solid';
    spinner = false;
    tooltip = '';
    configDetails = undefined;
    runningVersion = -1;
    newestVersion = -1;

    constructor(public path: string) {
        this.name = path.split('/').pop();
    }
}

@Component({
    selector: 'overview-tree',
    templateUrl: './overview-tree.component.html',
    styleUrls: ['./overview-tree.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewTreeComponent implements OnInit {

    protected _runningDetails: {string: any} | {};
    @Input() set running(newRunning) {
        this._runningDetails = newRunning;
        this.updateLeafs(this.paths);
    }

    protected _runningStates: {string: string} | {};
    @Input() set states(newStates) {
        this._runningStates = newStates;
        this.updateLeafs(Object.keys(newStates));
    }

    protected paths: Array<string>;
    protected _configs: {string: Configuration};
    @Input() set configs(newConfigs) {
        this.paths = Object.keys(newConfigs).sort(customConfigSortFn);
        this._configs = newConfigs;
        this.buildTree();
    }

    protected _actionRequests: {string: ActionRequest} | {};
    @Input() set actionRequests(newActionRequests) {
        this._actionRequests = newActionRequests;
        this.updateLeafs(Object.keys(newActionRequests));
    }

    protected _configDetails;
    @Input() set configDetails(newConfigDetails) {
        this._configDetails = newConfigDetails;
        this.updateLeafs(Object.keys(this._runningDetails))
    }

    configTree = [];
    configTreeLeafs = {};

    constructor() {
        this.paths = [];
        this._runningStates = {};
        this._runningDetails = {};
        this._actionRequests = {};
    }

    ngOnInit() {
    }

    protected buildTree() {
        this.configTree = [];
        this.updateLeafs(this.paths);
        this.paths.forEach(path => {
            const branch = path.split('/');
            branch.shift(); // drop first element because path starts with '/'
            branch.shift(); // drop second element because it is user
            this.makeTreeBranch(this.configTree, branch, path);
        });
    }

    protected makeTreeBranch(fromNode, branch, fullpath) {
        let name = branch.shift();
        if (branch.length === 0) {
            // name is last element of branch
            const leaf = this.configTreeLeafs[fullpath];
            return fromNode.push(leaf);
        }
        let node = fromNode.find((el) => el.name === name);
        if (typeof node === 'undefined') {
            // node does not exists, create new
            node = {
                name: name,
                expanded: true,
                nodes: []
            };
            fromNode.push(node);
        }
        // continues building branch on child nodes
        return this.makeTreeBranch(node.nodes, branch, fullpath);
    }

    protected updateLeafs(paths) {
        paths.forEach(path => {
            let leaf = this.configTreeLeafs[path];
            if (!leaf) {
                leaf = new Leaf(path);
                this.configTreeLeafs[path] = leaf;
            }
            leaf.actionRequest = this._actionRequests[path];
            if (this._runningDetails && this._runningDetails[path]) {
                leaf.runningVersion = this._runningDetails[path].version;
                if (this._configDetails) {
                    const detailsID = path + '/v=' + this._runningDetails[path].version;
                    leaf.configDetails = this._configDetails[detailsID];
                }
            } else {
                leaf.runningVersion = -1;
            }
            if (this._configs && this._configs[path]) {
                leaf.newestVersion = this._configs[path].version;
            }
            this.updateLeafStatus(leaf);
        });
    }

    protected updateLeafStatus(leaf) {
        if (this._actionRequests &&
            this._actionRequests.hasOwnProperty(leaf.path) &&
            this._actionRequests[leaf.path].state.loading) {
            leaf.state = null;
            leaf.icon = null;
            leaf.iconClass = '';
            leaf.spinner = true;
            leaf.tooltip = 'Sending command';
            return;
        }
        leaf.spinner = false;
        if (!this._runningDetails.hasOwnProperty(leaf.path)) {
            leaf.state = STATES.NO_FM;
            leaf.icon = 'document';
            leaf.iconClass = 'is-solid';
            leaf.tooltip = 'No function manager.';
            return;
        }
        leaf.state = this._runningStates[leaf.path];
        switch (this._runningStates[leaf.path]) {
        case STATES.ON:
            leaf.icon = 'heart';
            leaf.iconClass = 'is-solid is-success';
            leaf.tooltip = 'ON';
            break;
        case STATES.OFF:
            leaf.icon = 'cog';
            leaf.iconClass = 'is-solid is-info';
            leaf.tooltip = 'OFF';
            break;
        case STATES.ERROR:
            leaf.icon = 'error';
            leaf.iconClass = 'is-solid is-error';
            leaf.tooltip = 'ERROR';
            break;
        case STATES.RESETTING:
        case STATES.TURNING_ON:
        case STATES.TURNING_OFF:
            leaf.icon = null;
            leaf.iconClass = '';
            leaf.spinner = true;
            leaf.tooltip = leaf.state;
            break;
        default:
            leaf.state = STATES.UNKNOWN;
            leaf.icon = 'warning';
            leaf.iconClass = 'is-solid is-warning';
            leaf.tooltip = 'Unknown state';
        }

    }

}
