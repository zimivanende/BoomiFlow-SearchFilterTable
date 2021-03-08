import { FlowDisplayColumn, FlowObjectData, FlowObjectDataProperty, FlowOutcome } from "flow-component-model";
import React from "react";
import SearchFilterTable from "./SearchFilterTable";

export default class SearchFilterTableRow extends React.Component<any,any> {
    

    render() {


        const root: SearchFilterTable = this.props.root;
        const objData:  FlowObjectData = root.rowMap.get(this.props.id)?.objectData;

        let buttons: any[] = [];
        Object.keys(root.outcomes).forEach((key: string) => {
            if(root.outcomes[key].isBulkAction === false) {
                let icon: any;
                let label: any;

                if((!root.outcomes[key].attributes["display"]) || root.outcomes[key].attributes["display"].value.indexOf("text")>=0) {
                    label=(
                        <span
                            className="sft-table-cell-button-label"
                        >
                            {root.outcomes[key].label}
                        </span>
                    );
                }
                if((root.outcomes[key].attributes["display"]) && root.outcomes[key].attributes["display"].value.indexOf("icon")>=0) {
                    icon=(
                        <span
                            className={"sft-table-cell-button-icon glyphicon glyphicon-" + (root.outcomes[key].attributes["icon"].value || "plus")}
                        />
                    );
                }
                
                buttons.push(
                    <div
                        className="sft-table-cell-button"
                        onClick={(event: any) => {
                            root.doOutcome(key,objData.internalId)
                        }}
                    >
                        {icon}
                        {label}
                        
                    </div>
                );
            }
        });

        let cols: any[] = [];

        
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

        if(buttons.length > 0){
            cols.push(
                <td
                    className="sft-table-cell"
                >
                    <div
                        className="sft-table-cell-buttons"
                    >
                        {buttons}
                    </div>
                </td>
            );
        }

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