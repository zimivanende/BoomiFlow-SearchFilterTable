import { FlowDisplayColumn } from 'flow-component-model';
import * as React from 'react';
import {SFTColumnCriteria, eColumnComparator } from './ColumnCriteria';
import {SFTColumnFilter} from './ColumnFilter';
import {SFTColumnFilters,  eSortDirection } from './ColumnFilters';
import {FilterManagementFormAddRow} from './FilterFormManagementAddRow';
import {FilterManagementFormRow} from './FilterManagementFormRow';
import {SFT} from './SearchFilterTable';

export class FilterManagementForm extends React.Component<any, any> {
    parent: SFT;
    columns: Map<string, FlowDisplayColumn>;
    newFilters: SFTColumnFilters;

    constructor(props: any) {
        super(props);
        this.parent = this.props.parent;
        this.columns = this.parent.colMap;
        this.addCriteria = this.addCriteria.bind(this);
        this.removeCriteria = this.removeCriteria.bind(this);
        this.newFilters = this.parent.filters.clone();
    }

    addCriteria(fieldName: string) {
        this.newFilters.items.set(fieldName, new SFTColumnFilter(fieldName, this.newFilters, eSortDirection.none, [new SFTColumnCriteria(eColumnComparator.equalTo, '', '')]));
        this.forceUpdate();
    }

    removeCriteria(key: string) {
        this.newFilters.items.delete(key);
        this.forceUpdate();
    }

    render() {

        const rows: any[] = [];

        this.newFilters.items.forEach((filter: SFTColumnFilter, key: string) => {
            filter.criteria.forEach((criteria: SFTColumnCriteria) => {
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
