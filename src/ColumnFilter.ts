import ColumnCriteria from "./ColumnCriteria";
import ColumnFilters, { eFilterEvent, eSortDirection } from "./ColumnFilters";



export default class ColumnFilter {
    key: string;
    sort: eSortDirection = eSortDirection.none;
    parent: ColumnFilters;
    criteria: Array<ColumnCriteria> = [];

    constructor(key: string, parent: ColumnFilters){
        this.key = key;
        this.parent = parent;
        this.notify = this.notify.bind(this);
    }

    clearFilters() {
        this.criteria = [];
        this.notify(eFilterEvent.filter);
    }

    notify(event: eFilterEvent) {
        this.parent.notify(this.key, event);
    }

    sortAscending () {
        this.sort = eSortDirection.ascending;
        this.notify(eFilterEvent.sort);
    }

    sortDescending () {
        this.sort = eSortDirection.descending;
        this.notify(eFilterEvent.sort);
    }

    sortToggle () {
        switch(this.sort) {
            case eSortDirection.none:
            case eSortDirection.descending:
                this.sort = eSortDirection.ascending;
                break;
            default:
                this.sort=eSortDirection.descending;
                break;
        }
        this.notify(eFilterEvent.sort);
    }

    sortNone () {
        this.sort = eSortDirection.none;
        this.notify(eFilterEvent.sort);
    }
}