import { eContentType, FlowDisplayColumn, FlowObjectData } from 'flow-component-model';
import React, { Fragment } from 'react';
import CellItem from './CellItem';
import ColumnCriteria, { eColumnComparator } from './ColumnCriteria';
import ColumnFilter from './ColumnFilter';
import { ColumnRule } from './ColumnRule';
import FilterConfigForm from './FilterConfigForm';
import RowItem from './RowItem';
import SearchFilterTable from './SearchFilterTable';
import { FCMModalButton } from 'fcmkit/lib/ModalDialog/FCMModalButton';

export enum eFilterEvent {
    none = 0,
    sort = 1,
    filter = 2,
}

export enum eSortDirection {
    none = 0,
    ascending = 1,
    descending = -1,
}

export default class ColumnFilters {
    parent: SearchFilterTable;

    dialog: any;

    items: Map<string, ColumnFilter> = new Map();
    globalCriteria: string;

    quickChecks: Map<string, HTMLInputElement> = new Map();
    suppressNotify: boolean = false;

    constructor(parent: SearchFilterTable) {
        this.parent = parent;

        this.notify = this.notify.bind(this);

        this.getSortIcon = this.getSortIcon.bind(this);
        this.getFilterIcon = this.getFilterIcon.bind(this);
        this.getQuickCheck = this.getQuickCheck.bind(this);

        this.sortClicked = this.sortClicked.bind(this);
        this.filterClicked = this.filterClicked.bind(this);
        this.quickCheckClicked = this.quickCheckClicked.bind(this);
        this.saveFilter = this.saveFilter.bind(this);
        this.cancelFilter = this.cancelFilter.bind(this);

        this.matchesCriteria = this.matchesCriteria.bind(this);
    }

    clone(): ColumnFilters {
        const clone = new ColumnFilters(this.parent);
        clone.globalCriteria = this.globalCriteria;
        this.items.forEach((item: ColumnFilter, key: string) => {
            clone.items.set(key, item.clone());
        });
        return clone;
    }

    // stores / deletes a ref to the child dialog component
    setDialog(element: any) {
        this.dialog = element;
    }

    // this is called when individual filters change
    notify(key: string, event: eFilterEvent) {
        if(this.suppressNotify===false) {
            this.parent.filtersChanged(key, event);
        }
    }

    get(key: string): ColumnFilter {
        if (this.items.has(key)) {
            return this.items.get(key);
        } else {
            return undefined;
        }
    }

    has(key: string): boolean {
        if (this.items.has(key)) {
            return true;
        } else {
            return false;
        }
    }

    isFiltered(): boolean {
        let filtered: boolean = false;

        this.items.forEach((item: ColumnFilter) => {
            if (item.criteria.length > 0) {
                filtered = true;
            }
        });
        return filtered;
    }

    isFilteredOn(columnName: string): boolean {
        let filtered: boolean = false;

        if (this.items.has(columnName)) {
            if (this.items.get(columnName).criteria.length > 0) {
                filtered = true;
            }
        }
        return filtered;
    }

    clearAll() {
        this.suppressNotify = true;
        this.items.forEach((item: ColumnFilter) => {
            item.clearFilters();
        });
        this.suppressNotify = false;
        this.notify('', eFilterEvent.filter);
    }

    sortClicked(key: string) {
        if (!this.items.has(key)) {
            this.items.set(key, new ColumnFilter(key, this));
        }
        this.items.forEach((item: ColumnFilter) => {
            // exclude current
            if (item.key !== key) {
                item.sortNone();
            }
        });
        this.items.get(key).sortToggle();
    }

    // the filter button was pressed
    filterClicked(key: string) {

        const root: SearchFilterTable = this.parent;
        if (!this.items.has(key)) {
            this.items.set(key, new ColumnFilter(key, this));
        }

        const col: FlowDisplayColumn = this.parent.colMap.get(key);

        this.parent.messageBox.showDialog(
            null,
            'Filter ' + col.label,
            (
                <FilterConfigForm
                    root={root}
                    parent={this}
                    key={key}
                    developerName={key}
                    filter={this.items.get(key)}
                    contentType={col.contentType}
                    ref={(element: FilterConfigForm) => {this.setDialog(element); }}
                />
            ),
            [new FCMModalButton('Apply', this.saveFilter), new FCMModalButton('Cancel', this.cancelFilter)]);
    }

    filterClear(key: string) {
        this.items.get(key).clearFilters();
    }

    saveFilter() {
        const key: string = this.dialog.filter.key;
        this.dialog.filter.criteria = this.dialog.newCriteria;
        this.items.set(key, this.dialog.filter);
        this.dialog = undefined;
        this.parent.messageBox.hideDialog();
        this.notify(key, eFilterEvent.filter);
    }

    cancelFilter() {
        const key: string = this.dialog.filter.key;
        this.dialog = undefined;
        this.parent.messageBox.hideDialog();
        this.notify(key, eFilterEvent.filter);
    }

    getSortIcon(key: string): any {
        if (this.items.has(key)) {
            switch (this.items.get(key).sort) {
                case eSortDirection.none:
                    return (
                        <div
                            //onClick={(e: any) => {this.sortClicked(key); }}
                            title="Not sorted - click to toggle"
                            style={{display: 'flex', flexDirection: 'column'}}
                        >
                            <span
                                className="sft-column-header-flag  glyphicon glyphicon-triangle-top"

                            />
                            <span
                                className="sft-column-header-flag  glyphicon glyphicon-triangle-bottom"
                            />
                        </div>

                    );
                    // return undefined;
                case eSortDirection.ascending:
                    return (
                        <div
                            onClick={(e: any) => {this.sortClicked(key); }}
                            title="Ascending - click to toggle"
                            style={{display: 'flex', flexDirection: 'column'}}
                        >
                            <span
                                className="sft-column-header-flag sft-column-header-flag-hot glyphicon glyphicon-triangle-top"

                            />
                            <span
                                className="sft-column-header-flag   glyphicon glyphicon-triangle-bottom"
                            />
                        </div>
                    );
                case eSortDirection.descending:
                    return (
                        <div
                        onClick={(e: any) => {this.sortClicked(key); }}
                        title="Descending - click to toggle"
                        style={{display: 'flex', flexDirection: 'column'}}
                    >
                        <span
                            className="sft-column-header-flag  glyphicon glyphicon-triangle-top"

                        />
                        <span
                            className="sft-column-header-flag sft-column-header-flag-hot glyphicon glyphicon-triangle-bottom"
                        />
                    </div>
                    );
            }
        } else {
            return (
                <div
                    onClick={(e: any) => {this.sortClicked(key); }}
                    title="Not sorted - click to toggle"
                    style={{display: 'flex', flexDirection: 'column'}}
                >
                    <span
                        className="sft-column-header-flag  glyphicon glyphicon-triangle-top"

                    />
                    <span
                        className="sft-column-header-flag  glyphicon glyphicon-triangle-bottom"
                    />
                </div>
            );
        }
    }

    getFilterIcon(key: string): any {
        if (this.items.has(key) && this.items.get(key).criteria?.length > 0) {
            return (
                <Fragment>
                    <span
                        className="sft-column-header-button sft-column-header-button-hot glyphicon glyphicon-search"
                        onClick={(e: any) => {this.filterClicked(key); }}
                        title="Change filter"
                    />
                    <span
                        className="sft-column-header-button sft-column-header-button-hot glyphicon glyphicon-remove"
                        onClick={(e: any) => {this.filterClear(key); }}
                        title="Clear filter"
                    />
                </Fragment>
            );
        } else {
            return (
                <span
                    className="sft-column-header-button glyphicon glyphicon-search"
                    onClick={(e: any) => {this.filterClicked(key); }}
                />
            );
        }
    }

    getQuickCheck(columnName: string): any {
        if (this.parent.getAttribute('QuickCheck', 'false') === 'true' && this.parent.colMap.get(columnName)?.contentType === eContentType.ContentBoolean) {
            const crit: ColumnCriteria = (this.items.get(columnName) as ColumnFilter)?.criteria[0];
            return (
                <input
                    className="sft-checkbox sft-quick-check"
                    type="checkbox"
                    onChange={(e: any) => {this.quickCheckClicked(columnName, e); }}
                    ref={(element: HTMLInputElement) => {this.quickChecks.set(columnName, element); }}
                    checked={(crit?.value ? crit.value as boolean : false)}
                />
            );
        } else {
            return undefined;
        }
    }

    quickCheckClicked(key: string, e: any) {
        console.log('quick ' + key);
        if (e.currentTarget.checked === true) {
            this.items.set(key, new ColumnFilter(key, this, eSortDirection.none, [new ColumnCriteria(eColumnComparator.equalTo, true)]));
        } else {
            this.items.get(key).clearFilters();
        }
        this.notify(key, eFilterEvent.filter);
    }

    // this will filter the passed source map based on the current filters and return a new map of matches.
    filter(source: Map<string, RowItem>): Map<string, RowItem> {
        const matches: Map<string, RowItem> = new Map();
        source.forEach((item: RowItem, key: string) => {
            if (this.matchesCriteria(item)) {
                matches.set(key, undefined);
            }
        });

        return matches;
        // return new Map(Array.from(source).filter(this.matchesCriteria));
    }

    matchesCriteria(value: RowItem): boolean {
        const objData: FlowObjectData = value.objectData;
        let matches: boolean = true;
        let globalMatches: boolean;

        // each criteria needs to pass including global one
        if (this.globalCriteria && this.globalCriteria.length > 0) {
            globalMatches = false;
            const comparator: string = this.globalCriteria.toLowerCase();
            value.columns.forEach((col: CellItem) => {
                const val: string = ('' + (objData.properties[col.name].value as string))?.toLowerCase();
                if (val.indexOf(comparator) >= 0) {
                    globalMatches = true;
                }
            });
        }
        // each item represents a column
        this.items.forEach((item: ColumnFilter) => {

            item.criteria.forEach((criteria: ColumnCriteria) => {
                let val: any;
                let crit: any;
                let crit2: any;
                switch (objData.properties[item.key]?.contentType) {
                    case eContentType.ContentString:
                        val = (objData.properties[item.key].value as string)?.toLowerCase();
                        if (criteria.value instanceof Map) {
                            crit = criteria.value;
                        } else {
                            crit = (criteria.value as string).toLowerCase();
                        }
                        break;
                    case eContentType.ContentNumber:
                        val = (objData.properties[item.key].value as number);
                        crit = parseInt(criteria.value);
                        crit2 = parseInt(criteria.value2);
                        break;
                    case eContentType.ContentBoolean:
                        val = (objData.properties[item.key].value as boolean);
                        crit = criteria.value;
                        break;
                    case eContentType.ContentDateTime:
                        val = new Date(objData.properties[item.key].value as string);
                        if (isNaN(val)) {val = 0; } else {(val = val.getTime()); }
                        crit = new Date(criteria.value);
                        if (isNaN(crit)) {crit = 0; } else {(crit = crit.getTime()); }
                        crit2 = new Date(criteria.value2);
                        if (isNaN(crit2)) {crit2 = 0; } else {(crit2 = crit2.getTime()); }
                        break;
                    default:
                        val = '';
                        crit = '';
                }

                let crits: string[];
                let matchArray: boolean[];

                switch (criteria.comparator) {
                    case eColumnComparator.equalTo:
                        if (val !== crit) {
                            matches = false;
                        }
                        break;
                    case eColumnComparator.notEqualTo:
                        if (val === crit) {
                            matches = false;
                        }
                        break;
                    case eColumnComparator.contains:
                        crits = crit.split(',');
                        matchArray = [];
                        crits.forEach((crit: string) => {
                            if (val.indexOf(crit.trim()) < 0) {
                                matchArray.push(false);
                            } else {
                                matchArray.push(true);
                            }
                        });
                        matches = matchArray.indexOf(true) >= 0;

                        break;
                    case eColumnComparator.startsWith:
                        if (!val.startsWith(crit)) {
                            matches = false;
                        }
                        break;
                    case eColumnComparator.endsWith:
                        if (!val.endsWith(crit)) {
                            matches = false;
                        }
                        break;
                    case eColumnComparator.notContains:
                        crits = crit.split(',');
                        matchArray = [];
                        crits.forEach((crit: string) => {
                            if (val.indexOf(crit.trim()) >= 0) {
                                matchArray.push(true);
                            }
                        });
                        matches = matchArray.indexOf(true) < 0;
                        break;
                    case eColumnComparator.in:
                        // criteria.value will be a map
                        if (!crit.has(objData.properties[item.key].value as string)) {
                            matches = false;
                        }
                        break;
                    case eColumnComparator.notIn:
                        // criteria.value will be a map of allowable valued
                        if (crit.has(objData.properties[item.key].value as string)) {
                            matches = false;
                        }
                        break;
                    case eColumnComparator.lessThan:
                        if (crit <= val) {
                            matches = false;
                        }
                        break;
                    case eColumnComparator.greaterThan:
                        if (crit >= val) {
                            matches = false;
                        }
                        break;
                    case eColumnComparator.between:
                        if (val < crit || val > crit2 ) {
                            matches = false;
                        }
                        break;
                    default:
                        matches = false;
                        break;
                }
            });
        });

        // if matches = true or globalMatches = true
        if (this.globalCriteria?.length > 0) {
            if (globalMatches === true && matches === true) {
                return true;
            } else {
                return false;
            }
        } else {
            return matches;
        }
    }

    getSortColumn(): ColumnFilter {
        let sortColumn: ColumnFilter;
        this.items.forEach((col: ColumnFilter) => {
            if (col.sort !== eSortDirection.none) {
                sortColumn = col;
            }
        });
        return sortColumn;
    }

    // this will sort the passed map based on the current filter's sorts and return a new map
    sort(items: Map<string, RowItem>, source: Map<string, RowItem>): Map<string, RowItem> {
        //get all the rows
        const candidates: Map<string, RowItem> = new Map(Array.from(source).filter((item) => {
            if (items.has(item[0])) {
                return true;
            }
        }));

        const sortColumn: ColumnFilter = this.getSortColumn();
        if(sortColumn) {
            let sorted: any;
            let sortPropertyName: string = sortColumn.key;
            // see if there's a columnRule
            let colRule: ColumnRule = this.parent.columnRules.get(sortColumn.key);
            if(colRule){
                if(["url"].indexOf(colRule.mode) >= 0 ) {
                    if(colRule.label && colRule.label.startsWith("{{") && colRule.label.endsWith("}}")) {
                        sortPropertyName = colRule.label.replaceAll("{{","").replaceAll("}}","");
                    }
                }
            }
            //get the matching display column
            const colDef: FlowDisplayColumn = this.parent.colMap.get(sortPropertyName);
            sorted = Array.from(candidates);
            if(colDef) {
                if(sortColumn.sort !== eSortDirection.none) {
                    switch (colDef?.contentType) {

                        case eContentType.ContentDateTime:
                            sorted.sort((a: any, b: any) => {
                                const d1: Date = new Date(a[1].objectData.properties[sortPropertyName].value);
                                const d2: Date = new Date(b[1].objectData.properties[sortPropertyName].value);
                                if (d1 < d2) { return -1; }
                                if (d1 > d2) { return 1; }
                                return 0; 
                            });
                            break;

                        default:
                            const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
                            sorted.sort((a: any, b: any) =>
                                collator.compare(a[1].objectData.properties[sortPropertyName].value, b[1].objectData.properties[sortPropertyName].value),
                            );
                            break;

                    }

                    if (sortColumn.sort === eSortDirection.descending) {
                        sorted = sorted.reverse();
                    }
                }

                const results: Map<string, RowItem> = new Map(sorted);
                results.forEach((item: RowItem, key: string) => {
                    results.set(key, undefined);
                });
                return results;
            } else {
                return items;
            }

        } else {
            return items;
        }
    }

    getForStorage(): string {
        const filters: any[] = [];
        this.items.forEach((item: ColumnFilter) => {
            filters.push(item.getForStorage());
        });
        return JSON.stringify(filters);
    }

    loadFromStorage(filters: string) {
        this.items = new Map();
        const src: any[] = JSON.parse(filters);
        if (src) {
            src.forEach((filter: any) => {
                filter = JSON.parse(filter);
                if (filter.key) {
                    this.items.set(filter.key, new ColumnFilter(filter.key, this, filter.sort, filter.criteria));
                }
            });
        }

    }

    getForFSS(): string {
        let filters: any = {};
        let sort: any;
        if(this.getSortColumn()) {
            sort = {
                developerName: this.getSortColumn().key,
                direction: this.getSortColumn().sortAscending?"ASC":"DESC"
            };
            filters.sort = sort;
        }
        if(this.items.size > 0 || this.globalCriteria) {
            filters.filters = [];
            if(this.globalCriteria) {
                filters.filters.push(
                    {
                        developerName: "stringSearch",
                        comparator: "CONTAINS",
                        value: this.globalCriteria
                    }
                );
            }
            this.items.forEach((item: ColumnFilter) => {
                filters.filters.push(item.getForFSS());
            });
        }
        return JSON.stringify(filters);
    }
}
