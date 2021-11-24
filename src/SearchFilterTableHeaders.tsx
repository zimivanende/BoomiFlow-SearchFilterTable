import { FlowDisplayColumn, FlowOutcome } from 'flow-component-model';
import React from 'react';
import SearchFilterTable from './SearchFilterTable';

export default class SearchFilterTableHeaders extends React.Component<any, any> {
    headers: Map<string, any> = new Map();

    constructor(props: any) {
        super(props);

        this.setHeader = this.setHeader.bind(this);
    }

    componentDidMount() {
        this.forceUpdate();
    }

    setHeader(key: string, header: any) {
        if (header) {
            this.headers.set(key, header);
        } else {
            this.headers.delete(key);
        }
    }

    render() {
        this.headers = new Map();
        const headers: any[] = [];

        const root: SearchFilterTable = this.props.root;

        const buttons: any[] = [];
        Object.keys(root.outcomes).forEach((key: string) => {
            if (root.outcomes[key].isBulkAction === false) {
                buttons.push(key);
            }
        });

        if (root.colMap.size > 0) {
            headers.push(
                <th
                    key="checks"
                    className="sft-check-header"
                    ref={(element: any) => {this.setHeader('checks', element); }}
                >
                    <input
                        className="sft-checkbox"
                        type="checkbox"
                        onClick={(event: any) => {root.toggleSelectAll(event); }}
                    />
                </th>,
            );

            if (buttons.length > 0) {
                headers.push(
                    <th
                        key="actions"
                        className="sft-column-header"
                        ref={(element: any) => {this.setHeader('actions', element); }}
                    >
                        <div
                            className="sft-column-header-title"
                        >
                            <span
                                className="sft-column-header-title-label"
                            >
                                {'Actions'}
                            </span>
                        </div>
                    </th>,
                );
            }

            root.colMap.forEach((col: FlowDisplayColumn) => {

                const sortIcon: any = root.filters.getSortIcon(col.developerName);
                let filterIcon: any;
                if (this.props.inlineSearch === true) {
                    filterIcon = root.filters.getFilterIcon(col.developerName);
                }

                headers.push(
                    <th
                        key={col.developerName}
                        className="sft-column-header"
                        ref={(element: any) => {this.setHeader(col.developerName, element); }}
                    >
                        <div
                            className="sft-column-header-wrapper"
                        >
                            <div
                                className="sft-column-header-top"
                            >
                                <div
                                    className="sft-column-header-flags"
                                >
                                    {sortIcon}
                                </div>
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
                                    className="sft-column-header-buttons"
                                >
                                    {filterIcon}
                                </div>
                            </div>
                            <div
                                className="sft-column-header-bottom"
                            />
                        </div>
                    </th>,
                );
            });
        }

        return (
            <tr
                className="sft-column-headers"
            >
                {headers}
            </tr>
        );
    }
}
