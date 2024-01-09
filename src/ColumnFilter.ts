import {SFTColumnCriteria, eColumnComparator } from './ColumnCriteria';
import {SFTColumnFilters, eFilterEvent, eSortDirection } from './ColumnFilters';

export class SFTColumnFilter {
    key: string;
    sort: eSortDirection = eSortDirection.none;
    parent: SFTColumnFilters;
    criteria: SFTColumnCriteria[] = [];

    constructor(key: string, parent: SFTColumnFilters, sort: eSortDirection = eSortDirection.none, criteria: any[] = []) {
        this.key = key;
        this.parent = parent;
        this.sort = sort || eSortDirection.none;
        criteria.forEach((crit: any) => {
            if (crit instanceof SFTColumnCriteria === false) {
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
            this.criteria.push(new SFTColumnCriteria(crit.comparator, crit.value, crit.value2));
        });
        this.notify = this.notify.bind(this);
    }

    clone(): SFTColumnFilter {
        const clone = new SFTColumnFilter(this.key, this.parent, this.sort, this.criteria);
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
                this.sort = eSortDirection.descending;
                break;
            case eSortDirection.descending:
                this.sort = eSortDirection.ascending;
                break;
            case eSortDirection.ascending:
                this.sort = eSortDirection.none;
                break;
            default:
                this.sort = eSortDirection.none;
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
        this.criteria.forEach((crit: SFTColumnCriteria) => {
            filter.criteria.push(crit.getForStorage());
        });

        return JSON.stringify(filter);
    }

    getForFSS(): String {
        const filter: any = {};
        filter.developerName = this.key;
        this.criteria.forEach((crit: SFTColumnCriteria) => {
            let val: any = crit.getForFSS();
            filter.comparator=crit.comparator.toString();
            filter.value = val.value;
            filter.value2 = val.value2;
        });
        return filter;
    }
}
