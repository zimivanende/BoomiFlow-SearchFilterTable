import { FlowDisplayColumn } from 'flow-component-model';
import React from 'react';
import ColumnCriteria, { eColumnComparator } from './ColumnCriteria';
import ColumnFilter from './ColumnFilter';
import ColumnFilters from './ColumnFilters';
import MultiSelect from './MultiSelect';
import SearchFilterTable from './SearchFilterTable';

export default class FilterManagementForm extends React.Component<any, any> {

    filters: ColumnFilters;
    columns: FlowDisplayColumn;

    constructor(props: any) {
        super(props);
        this.filters = this.props.filters;
        this.addCriteria = this.addCriteria.bind(this);
        this.removeCriteria = this.removeCriteria.bind(this);
    }

    addCriteria() {
        // this.newCriteria.push(new ColumnCriteria(eColumnComparator.equalTo, ''));
        this.forceUpdate();
    }

    removeCriteria() {
        // this.newCriteria.push(new ColumnCriteria(eColumnComparator.equalTo, ''));
        this.forceUpdate();
    }

    render() {

        const rows: any[] = [];

        rows.push(
            <div
                className="sft-fcf-buttons"
            >
                <span
                    className="sft-fcf-button glyphicon glyphicon-plus-sign"
                    title="Add criteria"
                    onClick={this.addCriteria}
                />
            </div>,
        );
        return (
            <div
                className="modal-dialog-content"
            >
                {rows}
            </div>
        );
    }
}
