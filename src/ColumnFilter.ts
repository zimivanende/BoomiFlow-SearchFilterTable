import ColumnCriteria from './ColumnCriteria';
import ColumnFilters, { eFilterEvent, eSortDirection } from './ColumnFilters';

export default class ColumnFilter {
    key: string;
    sort: eSortDirection = eSortDirection.none;
    parent: ColumnFilters;
    criteria: ColumnCriteria[] = [];

    constructor(key: string, parent: ColumnFilters, sort: eSortDirection = eSortDirection.none, criteria: ColumnCriteria[] = []) {
        this.key = key;
        this.parent = parent;
        this.sort = sort;
        criteria.forEach((crit: any) => {
            crit = JSON.parse(crit);
            this.criteria.push(new ColumnCriteria(crit.comparator, crit.value));
        });
        this.notify = this.notify.bind(this);
    }

    clearFilters() {
        this.criteria = [];
        this.notify(eFilterEvent.filter);
    }

    notify(event: eFilterEvent) {
        this.parent.notify(this.key, event);
    }

    sortAscending() {
        this.sort = eSortDirection.ascending;
        this.notify(eFilterEvent.sort);
    }

    sortDescending() {
        this.sort = eSortDirection.descending;
        this.notify(eFilterEvent.sort);
    }

    sortToggle() {
        switch (this.sort) {
            case eSortDirection.none:
            case eSortDirection.descending:
                this.sort = eSortDirection.ascending;
                break;
            default:
                this.sort = eSortDirection.descending;
                break;
        }
        this.notify(eFilterEvent.sort);
    }

    sortNone() {
        this.sort = eSortDirection.none;
        this.notify(eFilterEvent.sort);
    }

    getForStorage(): string {
        const filter: any = {};
        filter.key = this.key;
        filter.sort = this.sort;
        filter.criteria = [];
        this.criteria.forEach((crit: ColumnCriteria) => {
            filter.criteria.push(crit.getForStorage());
        });

        return JSON.stringify(filter);
    }
}
