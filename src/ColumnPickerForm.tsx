import { FlowDisplayColumn } from 'flow-component-model';
import * as React from 'react';
import {SFT} from './SearchFilterTable';

export class ColumnPickerForm extends React.Component<any, any> {

    selectedColumns: string[] = [];
    constructor(props: any) {
        super(props);
        this.toggleSelection = this.toggleSelection.bind(this);
        const root: SFT = this.props.root;
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
        const root: SFT = this.props.root;
        const cols: any[] = [];
        let rows: any[] = [];
        let colArray: FlowDisplayColumn[] = Array.from(root.colMap.values());
        colArray.sort((a: FlowDisplayColumn,b: FlowDisplayColumn) =>{
            if(a.label > b.label){return 1}
            if(a.label < b.label){return -1} 
            return 0
        });
        colArray.forEach((column: FlowDisplayColumn) => {
            if (rows.length > 11) {
                cols.push(
                    <div
                        className="sft-column-picker-column"
                    >
                        {rows}
                    </div>,
                );
                rows = [];
            }
            rows.push(
            <div
                className="sft-column-picker-row"
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
        if (rows.length > 0) {
            cols.push(
                <div>
                    {rows}
                </div>,
            );
        }

        return (
            <div
                className="modal-dialog-content"
                style={{maxHeight: '80vh', maxWidth: '80vw', display: 'flex', flexDirection: 'column', margin: 'auto', padding: '0rem'}}
            >
                <div
                    className="sft-scroller"
                    style={{maxHeight: '80vh', maxWidth: '80vw'}}
                >
                    <div
                        className="sft-column-picker-body"
                    >
                        {cols}
                    </div>
                </div>
            </div>
        );
    }
}
