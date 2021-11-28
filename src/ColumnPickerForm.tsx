import { FlowDisplayColumn } from 'flow-component-model';
import React from 'react';
import ColumnCriteria, { eColumnComparator } from './ColumnCriteria';
import ColumnFilter from './ColumnFilter';
import MultiSelect from './MultiSelect';
import SearchFilterTable from './SearchFilterTable';

export default class ColumnPickerForm extends React.Component<any, any> {

    selectedColumns: string[] = [];
    constructor(props: any) {
        super(props);
        this.toggleSelection = this.toggleSelection.bind(this);
        const root: SearchFilterTable = this.props.root;
        root.userColumns.forEach((columnName: string) => {
            this.selectedColumns.push(columnName);
        });
    }

    toggleSelection(key: string, e: any) {
        if (e.target.checked) {
            if (this.selectedColumns.indexOf(key) < 0) {
                this.selectedColumns.push(key);
            }
        } else {
            this.selectedColumns.splice(this.selectedColumns.indexOf(key), 1);
        }
        this.forceUpdate();
    }

    render() {
        const root: SearchFilterTable = this.props.root;

        const rows: any[] = [];
        root.colMap.forEach((column: FlowDisplayColumn) => {
            rows.push(
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <div
                        className="checkbox-checkbox-wrapper"
                    >
                        <input
                            id={column.developerName}
                            type="checkbox"
                            className="sft-checkbox"
                            checked={this.selectedColumns.indexOf(column.developerName) >= 0}
                            onChange={(e: any) => {this.toggleSelection(column.developerName, e); }}
                        />
                    </div>
                    <div
                        className="checkbox-label-wrapper"
                    >
                        <label
                            className="checkbox-row-label"
                            htmlFor={column.developerName}
                        >
                            {column.label}
                        </label>
                    </div>

                </div>,
            );
        });

        return (
            <div
                className="modal-dialog-content"
                style={{maxHeight: '50%', display: 'flex', flexDirection: 'column', margin: 'auto', padding: '0rem'}}
            >
                <div
                    className="sft-scroller"
                    style={{maxHeight: '50%'}}
                >
                    <div
                        className="sft-scroller-body"
                    >
                        {rows}
                    </div>
                </div>
            </div>
        );
    }
}