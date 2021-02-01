import React, { Fragment } from "react";
import { FlowDisplayColumn, FlowObjectData, FlowObjectDataProperty, modalDialogButton } from "flow-component-model";
import ColumnFilter from "./ColumnFilter";
import SearchFilterTable from "./SearchFilterTable";
import FilterConfigForm from "./FilterConfigForm";
import ColumnCriteria, { eColumnComparator } from "./ColumnCriteria";
import RowItem from "./RowItem";

export enum eFilterEvent {
    none = 0,
    sort = 1,
    filter = 2
}

export enum eSortDirection {
    none = 0,
    ascending = 1,
    descending = -1
}

export default class ColumnFilters {
    
    private items: Map<string,ColumnFilter> = new Map();
    parent: SearchFilterTable;

    dialog: any;

    constructor(parent: SearchFilterTable) {
        this.parent = parent;

        this.notify = this.notify.bind(this);

        this.getSortIcon = this.getSortIcon.bind(this);
        this.getFilterIcon = this.getFilterIcon.bind(this);

        this.sortClicked = this.sortClicked.bind(this);
        this.filterClicked = this.filterClicked.bind(this);

        this.saveFilter = this.saveFilter.bind(this);
        this.cancelFilter = this.cancelFilter.bind(this);

        this.matchesCriteria = this.matchesCriteria.bind(this);
    }

    // stores / deletes a ref to the child dialog component
    setDialog(element: any) {
        this.dialog = element;
    }

    // this is called when individual filters change
    notify(key: string, event: eFilterEvent) {
        this.parent.filtersChanged(key,event);
    }

    get(key: string) : ColumnFilter {
        if(this.items.has(key)) {
            return this.items.get(key);
        }
        else {
            return undefined;
        }
    }

    has(key: string) : boolean {
        if(this.items.has(key)) {
            return true;
        }
        else {
            return false;
        }
    }

    sortClicked(key: string){
        if(!this.items.has(key)) {
            this.items.set(key,new ColumnFilter(key,this));
        }
        this.items.forEach((item: ColumnFilter) => {
            // exclude current
            if(item.key !== key) {
                item.sortNone();
            }
        })
        this.items.get(key).sortToggle();
    }

    // the filter button was pressed
    filterClicked(key: string){

        const root: SearchFilterTable = this.parent;
        if(!this.items.has(key)) {
            this.items.set(key,new ColumnFilter(key,this));
        }
    
        let col: FlowDisplayColumn = this.parent.colMap.get(key);
        
        this.parent.messageBox.showMessageBox("Filter " + col.label,
            (
                <FilterConfigForm 
                    root={root}
                    parent={this}
                    key={key}
                    developerName={key}
                    filter={this.items.get(key)}
                    ref={(element: FilterConfigForm) => {this.setDialog(element) }}
                />
            ),
            [new modalDialogButton("Apply",this.saveFilter),new modalDialogButton("Cancel",this.cancelFilter)]);
    }

    filterClear(key: string){
        this.items.get(key).clearFilters();
    }

    saveFilter() {
        let key: string = this.dialog.filter.key;
        this.dialog.filter.criteria = this.dialog.newCriteria;
        this.items.set(key,this.dialog.filter);
        this.dialog=undefined;
        this.parent.messageBox.hideMessageBox();
        this.notify(key,eFilterEvent.filter);
    }

    cancelFilter() {
        let key: string = this.dialog.filter.key;
        this.dialog=undefined;
        this.parent.messageBox.hideMessageBox();
        this.notify(key,eFilterEvent.filter);
    }

    getSortIcon(key: string) : any {
        if(this.items.has(key)) {
            switch(this.items.get(key).sort){
                case eSortDirection.none:
                    return (
                        <span 
                            className="sft-column-header-flag glyphicon glyphicon-ban-circle"
                            onClick={(e: any) => {this.sortClicked(key)}}
                            title="Not sorted - click to toggle"
                        />
                    );
                    //return undefined;
                case eSortDirection.ascending:
                    return (
                        <span 
                            className="sft-column-header-flag sft-column-header-flag-hot glyphicon glyphicon-arrow-up"
                            onClick={(e: any) => {this.sortClicked(key)}}
                            title="Ascending - click to toggle"
                        />
                    );
                case eSortDirection.descending:
                    return (
                        <span 
                            className="sft-column-header-flag sft-column-header-flag-hot glyphicon glyphicon-arrow-down"
                            onClick={(e: any) => {this.sortClicked(key)}}
                            title="Descending - click to toggle"
                        />
                    );
            }
        }
        else {
            return (
                <span 
                    className="sft-column-header-flag glyphicon glyphicon-ban-circle"
                    onClick={(e: any) => {this.sortClicked(key)}}
                    title="Not sorted - click to toggle"
                />
            );
        }
    }

    getFilterIcon(key: string) : any {
        if(this.items.has(key) && this.items.get(key).criteria?.length > 0) {
            return (
                <Fragment>
                    <span 
                        className="sft-column-header-button sft-column-header-button-hot glyphicon glyphicon-search"
                        onClick={(e: any) => {this.filterClicked(key)}}
                        title="Change filter"
                    />,
                    <span 
                        className="sft-column-header-button sft-column-header-button-hot glyphicon glyphicon-remove"
                        onClick={(e: any) => {this.filterClear(key)}}
                        title="Clear filter"
                    />
                </Fragment>
            );
        }
        else {
            return (
                <span 
                    className="sft-column-header-button glyphicon glyphicon-search"
                    onClick={(e: any) => {this.filterClicked(key)}}
                />
            );
        }
    }

    // this will filter the passed source map based on the current filters and return a new map of matches.
    filter(source: Map<string,RowItem>) : Map<string,RowItem> {
        let matches: Map<string,RowItem> = new Map();
        source.forEach((item: RowItem, key: string) => {
            if(this.matchesCriteria(item)) {
                matches.set(key,undefined);
            }
        });
        
        return matches;
        //return new Map(Array.from(source).filter(this.matchesCriteria));
    }

    matchesCriteria(value: RowItem) : boolean {
        let objData: FlowObjectData = value.objectData;
        let matches: boolean = true;

        // each item represents a column
        this.items.forEach((item: ColumnFilter) => {
            // each criteria needs to pass
            item.criteria.forEach((criteria: ColumnCriteria) => {
                let val: string = (objData.properties[item.key].value as string).toLowerCase();
                let crit: string;
                if(typeof criteria.value === "string") {
                    crit = (criteria.value as string).toLowerCase();
                }
                switch(criteria.comparator) {
                    case eColumnComparator.equalTo:
                        if(val !== crit) {
                            matches=false; 
                        }
                        break;
                    case eColumnComparator.notEqualTo:
                        if(val === crit) {
                            matches=false; 
                        }
                        break;
                    case eColumnComparator.contains:
                        if(val.indexOf(crit) < 0) {
                            matches=false; 
                        }
                        break;
                    case eColumnComparator.startsWith:
                        if(!val.startsWith(crit)) {
                            matches=false; 
                        }
                        break;
                    case eColumnComparator.endsWith:
                        if(!val.endsWith(crit)) {
                            matches=false; 
                        }
                        break;
                    case eColumnComparator.notContains:
                        if(val.indexOf(crit) >= 0) {
                            matches=false; 
                        }
                        break;
                    case eColumnComparator.in:
                        //criteria.value will be a map of allowable valued
                        if(! criteria.value.has(objData.properties[item.key].value as string)) {
                            matches=false; 
                        }
                        break;
                    case eColumnComparator.notIn:
                        //criteria.value will be a map of allowable valued
                        if(criteria.value.has(objData.properties[item.key].value as string)) {
                            matches=false; 
                        }
                        break;
    



                    default:
                        matches=false;
                        break;
                }
            });
        });


        return matches;
    }

    getSortColumn() : ColumnFilter {
        let sortColumn : ColumnFilter;
        this.items.forEach((col : ColumnFilter) => {
            if(col.sort !== eSortDirection.none) {
                sortColumn = col;
            }
        });
        return sortColumn;
    }

    // this will sort the passed map based on the current filter's sorts and return a new map
    sort(items: Map<string,RowItem>,source: Map<string,RowItem>) : Map<string,RowItem> {
        let sortColumn : ColumnFilter = this.getSortColumn();

        let candidates: Map<string,RowItem> = new Map(Array.from(source).filter(item => {
            if(items.has(item[0])){
                return true;
            }
        }));
        
        if(sortColumn) {
            let colDef = this.parent.colMap.get(sortColumn.key);
            var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
            let sorted: any = Array.from(candidates).sort((a: any,b: any) => 
                collator.compare(a[1].objectData.properties[sortColumn.key].value,b[1].objectData.properties[sortColumn.key].value)
            );

            if(sortColumn.sort === eSortDirection.descending) {
                sorted = sorted.reverse();
            }
            
            let results: Map<string,RowItem> = new Map(sorted);
            results.forEach((item: RowItem, key: string) => {
                results.set(key,undefined);
            });
            return results
        }
        else {
            return items;
        }
    }
}