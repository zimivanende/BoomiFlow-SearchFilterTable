import { FlowDisplayColumn } from 'flow-component-model';
import * as React from 'react';
import {ColumnCriteria, eColumnComparator } from './ColumnCriteria';
import {ColumnFilter} from './ColumnFilter';
import {ColumnFilters,  eSortDirection } from './ColumnFilters';
import {FilterManagementFormAddRow} from './FilterFormManagementAddRow';
import {FilterManagementFormRow} from './FilterManagementFormRow';
import {SearchFilterTable} from './SearchFilterTable';

export class FilterManagementForm extends React.Component<any, any> {
    parent: SearchFilterTable;
    columns: Map<string, FlowDisplayColumn>;
    newFilters: ColumnFilters;

    constructor(props: any) {
        super(props);
        this.parent = this.props.parent;
        this.columns = this.parent.colMap;
        this.addCriteria = this.addCriteria.bind(this);
        this.removeCriteria = this.removeCriteria.bind(this);
        this.newFilters = this.parent.filters.clone();
    }

    addCriteria(fieldName: string) {
        this.newFilters.items.set(fieldName, new ColumnFilter(fieldName, this.newFilters, eSortDirection.none, [new ColumnCriteria(eColumnComparator.equalTo, '', '')]));
        this.forceUpdate();
    }

    removeCriteria(key: string) {
        this.newFilters.items.delete(key);
        this.forceUpdate();
    }

    render() {

        const rows: any[] = [];

        this.newFilters.items.forEach((filter: ColumnFilter, key: string) => {
            filter.criteria.forEach((criteria: ColumnCriteria) => {
                rows.push(
                    <FilterManagementFormRow
                        parent={this}
                        filterId={key}
                        criteria={criteria}
                    />,
                );
            });
        });

        rows.push(
            <FilterManagementFormAddRow
                parent={this}
            />,
        );
        return (
            <div
                className="modal-dialog-content"
                style={{width: '910px'}}
            >
                {rows}
            </div>
        );
    }
}
