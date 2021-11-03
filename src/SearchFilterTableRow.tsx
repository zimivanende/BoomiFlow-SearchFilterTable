import { eContentType, FlowDisplayColumn, FlowObjectData, FlowObjectDataProperty, FlowOutcome } from 'flow-component-model';
import React from 'react';
import SearchFilterTable from './SearchFilterTable';

export default class SearchFilterTableRow extends React.Component<any, any> {

    render() {

        const root: SearchFilterTable = this.props.root;
        const objData: FlowObjectData = root.rowMap.get(this.props.id)?.objectData;

        const buttons: any[] = [];
        Object.keys(root.outcomes).forEach((key: string) => {
            if (root.outcomes[key].isBulkAction === false) {
                let icon: any;
                let label: any;

                if ((!root.outcomes[key].attributes['display']) || root.outcomes[key].attributes['display'].value.indexOf('text') >= 0) {
                    label = (
                        <span
                            className="sft-table-cell-button-element sft-table-cell-button-label"
                        >
                            {root.outcomes[key].label}
                        </span>
                    );
                }
                if ((root.outcomes[key].attributes['display']) && root.outcomes[key].attributes['display'].value.indexOf('icon') >= 0) {
                    icon = (
                        <span
                            className={'sft-table-cell-button-element sft-table-cell-button-icon glyphicon glyphicon-' + (root.outcomes[key].attributes['icon'].value || 'plus')}
                        />
                    );
                }

                buttons.push(
                    <div
                        className="sft-table-cell-button"
                        title={root.outcomes[key].label}
                        onClick={(event: any) => {
                            root.doOutcome(key, objData.internalId);
                        }}
                    >
                        {icon}
                        {label}

                    </div>,
                );
            }
        });

        const cols: any[] = [];

        cols.push(
            <td
                className="sft-table-cell"
            >
                <input
                    className="sft-checkbox"
                    type="checkbox"
                    onClick={(event: any) => {root.toggleSelect(event, this.props.id); }}
                    checked={root.selectedRowMap.has(this.props.id)}
                />
            </td>,
        );

        if (buttons.length > 0) {
            cols.push(
                <td
                    className="sft-table-cell"
                >
                    <div
                        className="sft-table-cell-buttons"
                    >
                        {buttons}
                    </div>
                </td>,
            );
        }

        root.colMap.forEach((col: FlowDisplayColumn) => {
            let val: any;
            switch (col.contentType) {
                case eContentType.ContentDateTime:
                    const dt: Date = new Date(objData?.properties[col.developerName]?.value as string);
                    if ((dt instanceof Date && !isNaN(dt.getTime())) === true) {
                        val = dt.toLocaleString();
                    }
                    break;

                default:
                    val = objData?.properties[col.developerName]?.value;
                    val = this.formatValue(val);
                    break;
            }
            cols.push(
                <td
                    className="sft-table-cell"
                >
                    <span
                        className="sft-table-cell-text"
                    >
                        {val}
                    </span>
                </td>,
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

    // handles special contents like uris & dataUri
    formatValue(value: any): any {
        let result: any;
        if (typeof value === 'string') {
            switch (true) {
                case value.startsWith('http:'):
                case value.startsWith('http:'):
                    result = (
                        <a href={value} target="_blank">Open Link</a>
                    );
                    break;

                case value.startsWith('data:'):
                    const mime = value.split(';')[0].split(':')[1];
                    switch (true) {
                        case mime.startsWith('audio/'):
                            result = (
                                <audio
                                    controls={true}
                                    style={{width: '100%', minWidth: '10rem'}}>
                                    <source src={value} type={mime}/>
                            </audio>
                            );
                            break;

                        default:
                            const dnld: string = this.makeFileName('file', mime);
                            result = (
                                <a href={value} target="_blank" download={dnld}>Download File</a>
                            );
                            break;
                    }

                    break;

                default:
                    result = value;
                    break;
            }

        }
        return result;
    }

    makeFileName(name: string, mimeType: string): string {
        const fileName: string = name;
        switch (mimeType) {
            case 'audio/webm': return fileName + '.webm';

            default: return fileName;
        }
    }
}
