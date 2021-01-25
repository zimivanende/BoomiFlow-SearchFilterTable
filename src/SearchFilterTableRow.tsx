import { FlowDisplayColumn, FlowObjectData, FlowObjectDataProperty } from "flow-component-model";
import React from "react";
import SearchFilterTable from "./SearchFilterTable";

export default class SearchFilterTableRow extends React.Component<any,any> {
    

    render() {

        let cols: any[] = [];

        const root: SearchFilterTable = this.props.root;
        const objData:  FlowObjectData = root.rowMap.get(this.props.id).objectData;
        cols.push(
            <td
                className="sft-table-cell"
            >
                <input 
                    className="sft-checkbox"
                    type="checkbox"
                    onClick={(event: any) => {root.toggleSelect(event, this.props.id )}}
                    checked={root.selectedRowMap.has(this.props.id)}
                />
            </td>
        );

        root.colMap.forEach((col: FlowDisplayColumn) => {
            cols.push(
                <td
                    className="sft-table-cell"
                >
                    <span
                        className="sft-table-cell-text"
                    >
                        {objData.properties[col.developerName].value}
                    </span>
                </td>
            );
        });
        return (
            <tr
                className="sft-table-row"
            >
                {cols}                
            </tr>
        );
    }
}