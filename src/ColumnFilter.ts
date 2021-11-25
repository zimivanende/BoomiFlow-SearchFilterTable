import ColumnCriteria, { eColumnComparator } from './ColumnCriteria';
import ColumnFilters, { eFilterEvent, eSortDirection } from './ColumnFilters';

export default class ColumnFilter {
    key: string;
    sort: eSortDirection = eSortDirection.none;
    parent: ColumnFilters;
    criteria: ColumnCriteria[] = [];

    constructor(key: string, parent: ColumnFilters, sort: eSortDirection = eSortDirection.none, criteria: any[] = []) {
        this.key = key;
        this.parent = parent;
        this.sort = sort;
        criteria.forEach((crit: any) => {
            if (crit instanceof ColumnCriteria === false) {
                crit = JSON.parse(crit);
            }
            if (crit.comparator === eColumnComparator.in || crit.comparator === eColumnComparator.notIn) {
                if (crit.value instanceof Map) {
                    // do nothing
                } else {

                    const vals: any[] = JSON.parse(crit.value);
                    const vmap: Map<string, string> = new Map();
                    vals.forEach((v: string) => {
                        vmap.set(v, v);
                    });
                    crit.value = vmap;
                }
            }
            this.criteria.push(new ColumnCriteria(crit.comparator, crit.value));
        });
        this.notify = this.notify.bind(this);
    }

    clone(): ColumnFilter {
        const clone = new ColumnFilter(this.key, this.parent, this.sort, this.criteria);
        return clone;
    }

    clearFilters() {
        this.criteria = [];
        this.notify(eFilterEvent.filter);
    }

    notify(event: eFilterEvent) {
        this.parent.notify(this.key, event);
    }

    sortAscending() {
        if (this.sort !== eSortDirection.ascending) {
            this.sort = eSortDirection.ascending;
            this.notify(eFilterEvent.sort);
        }
    }

    sortDescending() {
        if (this.sort !== eSortDirection.descending) {
            this.sort = eSortDirection.descending;
            this.notify(eFilterEvent.sort);
        }
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
        if (this.sort !== eSortDirection.none) {
            this.sort = eSortDirection.none;
            this.notify(eFilterEvent.sort);
        }
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
