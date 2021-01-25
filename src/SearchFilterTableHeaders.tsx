import { FlowDisplayColumn } from "flow-component-model";
import React from "react";
import SearchFilterTable from "./SearchFilterTable";

export default class SearchFilterTableHeaders extends React.Component<any,any> {

    componentDidMount() {
        this.forceUpdate();
    }

    render() {
        let headers: any[] = [];

        const root: SearchFilterTable = this.props.root;

        headers.push(
            <th
                className="sft-check-header"
            >
                <input 
                    className="sft-checkbox"
                    type="checkbox"
                    onClick={(event: any) => {root.toggleSelectAll(event)}}
                />
            </th>
        );

        root.colMap.forEach((col: FlowDisplayColumn) => {

            let sortIcon: any = root.filters.getSortIcon(col.developerName);
            let filterIcon: any = root.filters.getFilterIcon(col.developerName);

            headers.push(
                <th
                    className="sft-column-header"
                >
                    <div
                        className="sft-column-header-wrapper"
                    >
                        <div
                            className="sft-column-header-title"
                        >
                            <span
                                className="sft-column-header-title-label"
                            >
                                {col.label}
                            </span>
                        </div>
                        <div
                            className="sft-column-header-flags"
                        >
                            {sortIcon}
                        </div>
                        <div
                            className="sft-column-header-buttons"
                        >
                            {filterIcon}
                        </div>
                    </div>
                </th>
            );
        });

        return (
            <tr
                className="sft-column-headers"
            >
                {headers}                
            </tr>
        );
    }
}