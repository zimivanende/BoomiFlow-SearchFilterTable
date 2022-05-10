import { FlowDisplayColumn, FlowOutcome } from 'flow-component-model';
import React from 'react';
import SearchFilterTable from './SearchFilterTable';
import SearchFilterTableHeader from './SearchFilterTableHeader';

export default class SearchFilterTableHeaders extends React.Component<any, any> {
    headers: Map<string, SearchFilterTableHeader> = new Map();
    draggedFieldName: string;

    constructor(props: any) {
        super(props);

        this.setHeader = this.setHeader.bind(this);
        this.dragColumn = this.dragColumn.bind(this);
        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.moveColumn = this.moveColumn.bind(this);
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

    dragColumn(e: any, fieldName: string) {
        // e.preventDefault();
        // e.stopPropagation();
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('column', fieldName);
        this.draggedFieldName = fieldName;
    }

    onDragEnter(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const tgtFieldName = e.currentTarget.getAttribute('data-fieldName');
        const srcFieldName = this.draggedFieldName ;
        if (!srcFieldName || this.draggedFieldName === tgtFieldName) {
            e.dataTransfer.dropEffect = 'none';
        } else {
            this.headers.get(tgtFieldName).dragEnter();
            e.dataTransfer.dropEffect = 'move';
            // e.currentTarget.parentElement.classList.add('sft-column-header-wrapper-droppable');
        }

    }

    onDragLeave(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const tgtFieldName = e.currentTarget.getAttribute('data-fieldName');
        this.headers.get(tgtFieldName).dragLeave();
        // e.currentTarget.parentElement.classList.remove('sft-column-header-wrapper-droppable');
    }

    onDragOver(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const srcFieldName = e.dataTransfer.getData('column');
        const tgtFieldName = e.currentTarget.getAttribute('data-fieldName');

        // e.dataTransfer.dropEffect="move";
    }

    async onDrop(e: any) {
        const root: SearchFilterTable = this.props.root;
        e.preventDefault();
        e.stopPropagation();
        const srcFieldName = e.dataTransfer.getData('column');
        const tgtFieldName = e.currentTarget.getAttribute('data-fieldName');
        this.draggedFieldName = undefined;
        e.dataTransfer.clearData();
        e.currentTarget.parentElement.classList.remove('sft-column-header-wrapper-droppable');

        if (srcFieldName && srcFieldName !== tgtFieldName) {
            await this.moveColumn(srcFieldName, tgtFieldName);
            this.forceUpdate();
        }

    }

    async moveColumn(srcFieldName: string, tgtFieldName: string) {
        const root: SearchFilterTable = this.props.root;
        console.log('move ' + srcFieldName + ' before ' + tgtFieldName);

        root.userColumns.splice(root.userColumns.indexOf(tgtFieldName), 0, root.userColumns.splice(root.userColumns.indexOf(srcFieldName), 1)[0]);
        root.columnsReordered();
    }

    render() {
        this.headers = new Map();
        const headers: any[] = [];

        const root: SearchFilterTable = this.props.root;

        const buttons: any[] = [];
        let anyoutcomes: boolean = false;
        Object.keys(root.outcomes).forEach((key: string) => {
            if (root.outcomes[key].isBulkAction === false) {
                if(!root.supressedOutcomes.has(key)) {
                    anyoutcomes=true;
                }
                buttons.push(key);
            }
        });

        if (root.colMap.size > 0) {
            if(root.model.multiSelect) {
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
            }

            root.userColumns.forEach((collName: string) => {

                if (collName === '#BUTTONS#') {
                    if (anyoutcomes) {
                        headers.push(
                            <SearchFilterTableHeader
                                root={this.props.root}
                                parent={this}
                                column={{developerName: '#BUTTONS#', label: root.getAttribute('OutcomesLabel', 'Action')}}
                                static={true}
                                inlineSearch={this.props.inlineSearch}
                                ref={(element: SearchFilterTableHeader) => {this.setHeader('#BUTTONS#', element); }}
                            />,
                        );
                    }
                } else {
                    const col: FlowDisplayColumn = root.colMap.get(collName);
                    if (col) {
                        headers.push(
                            <SearchFilterTableHeader
                                root={this.props.root}
                                parent={this}
                                column={col}
                                inlineSearch={this.props.inlineSearch}
                                ref={(element: SearchFilterTableHeader) => {this.setHeader(col.developerName, element); }}
                            />,
                        );
                    } else {
                        root.userColumns.splice(root.userColumns.indexOf(collName), 1);
                        root.saveUserColumns();
                    }
                }
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
