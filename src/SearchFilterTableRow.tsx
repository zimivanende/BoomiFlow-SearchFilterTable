import { eContentType, FlowDisplayColumn, FlowObjectData, FlowObjectDataArray, FlowObjectDataProperty } from 'flow-component-model';
import * as React from 'react';
import {CommonFunctions} from './CommonFunctions';
import {SFT} from './SearchFilterTable';
import { FCMModalButton } from 'fcmkit/lib/ModalDialog/FCMModalButton';
// declare const manywho: IManywho;
declare const manywho: any;

export class SearchFilterTableRow extends React.Component<any, any> {

    rowElement: any;
    constructor(props: any) {
        super(props);
        this.state = {enabledOutcomes: []};
        this.selectRow = this.selectRow.bind(this);
    }

    async componentDidMount(): Promise<void> {
        const enabledOutcomes: string[] = [];
        const root: SFT = this.props.root;
        const objData: FlowObjectData = root.rowMap.get(this.props.id)?.objectData;
        const keys: string[] = Object.keys(root.parent.outcomes);
        for (let pos = 0 ; pos < keys.length ; pos++) {
            if (root.parent.outcomes[keys[pos]].isBulkAction === false) {
                if(!root.supressedOutcomes.has(root.parent.outcomes[keys[pos]].developerName)) {
                    if (await CommonFunctions.assessRowOutcomeRule(root.parent.outcomes[keys[pos]], objData, root) === true) {
                        enabledOutcomes.push(keys[pos]);
                    }
                }
            }
        }
        if(root.lastRememberedRow){
            if(objData.properties[root.rowRememberColumn]?.value === root.lastRememberedRow){
                this.rowElement.scrollIntoView({inline: "center", block: "center", behavior: "auto"});
            }
        }
        this.setState({enabledOutcomes});
        root.forceUpdate();
    }

    selectRow(e: any) {
        const root: SFT = this.props.root;
        const objData: FlowObjectData = root.rowMap.get(this.props.id)?.objectData;
        root.selectRow(objData);
    }

    render() {

        const root: SFT = this.props.root;
        const objData: FlowObjectData = root.rowMap.get(this.props.id)?.objectData;
        let rowClass: string="";
        if(root.selectedRow === objData.externalId) {
            rowClass += " sft-table-row-selected "
        }
        const buttons: any[] = [];
        let anyoutcomes: boolean = false;
        for(let key of Object.keys(root.parent.outcomes)){
        //Object.keys(root.outcomes).forEach(async (key: string) => {
            if (root.parent.outcomes[key].isBulkAction === false) {
                
                let showOutcome: boolean = this.state.enabledOutcomes.indexOf(key) >= 0;
                if(!root.supressedOutcomes.has(key)) {
                    anyoutcomes=true;
                    if(root.parent.getAttribute("greyDissabled","false").toLowerCase()==="true"){
                        let btn: any = CommonFunctions.makeOutcomeButton(root,root.parent.outcomes[key],root.iconSuffix,objData,!showOutcome);
                        buttons.push(btn);
                    }
                    else {
                        if (showOutcome === true) {
                            let btn: any = CommonFunctions.makeOutcomeButton(root,root.parent.outcomes[key],root.iconSuffix,objData,false);
                            buttons.push(btn);
                        }
                    }
                }
            }
        };

        const cols: any[] = [];

        if (root.parent.model.multiSelect){
            cols.push(
                <td
                    className="sft-table-cell sft-table-cell-check"
                >
                    <input
                        className="sft-checkbox"
                        type="checkbox"
                        onClick={(event: any) => {root.toggleSelect(event, this.props.id); }}
                        checked={root.selectedRowMap.has(this.props.id)}
                    />
                </td>,
            );
        } else {
            if (root.parent.getAttribute("showRadio","false").toLowerCase()==="true"){
                cols.push(
                    <td
                        className="sft-table-cell"
                    >
                        <input
                            className="sft-radio"
                            type="radio"
                            checked={root.selectedRow===objData.externalId}
                        />
                    </td>,
                );
            }
        }

        root.userColumns.forEach((collName: string) => {
            if (collName === '#BUTTONS#') {
                if (anyoutcomes) {
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
            } else {
                const col: FlowDisplayColumn = root.colMap.get(collName);
                // root.colMap.forEach((col: FlowDisplayColumn) => {
                if (col) {
                    let cellResult: any = this.formatValue(col.componentType, col.contentType, root, col.developerName, objData);
                    const val: any = cellResult.result;
                    if(rowClass.length > 0 && cellResult.rowClass.length>0) {
                        rowClass+= " ";
                    }
                    rowClass+= cellResult.rowClass;

                cols.push(
                        <td
                            className={"sft-table-cell " + cellResult.cellClass}
                        >
                            {val}
                        </td>,
                    );
                } else {
                    console.log('Failed to get a definition for col ' + collName);
                }
            }

        });
        return (
            <tr
                className={"sft-table-row " + rowClass}
                ref={(element: any) => {this.rowElement = element}}
                onClick={this.selectRow}
            >
                {cols}
            </tr>
        );
    }

    // handles special contents like uris & dataUri
    formatValue(componentType: string, contentType: eContentType,  root: SFT, columnName: string, row: FlowObjectData): any {
        let result: any;
        let rowClass: string = "";
        let cellClass: string = "";
        let col: FlowObjectDataProperty;
        if(root.parent.getAttribute("ComplexColumns","false").toLowerCase() === "true"){
            let colsName: string = root.parent.getAttribute("ComplexColumnsChildren","Columns");
            let colName: string = root.parent.getAttribute("ComplexColumnName","Name");
            let colValue: string = root.parent.getAttribute("ComplexColumnValue","Value");
            
            (row.properties[colsName].value as FlowObjectDataArray).items.forEach((c: FlowObjectData) => {
                let cname: string = c.properties[colName].value as string;
                if(cname===columnName) {
                    let val: any = c.properties[colValue].value;
                    let colType: eContentType = root.colMap.get(columnName).contentType;
                    col=FlowObjectDataProperty.newInstance(cname,colType,c);
                }
            });
        }
        else {
            col = row?.properties[columnName]
        }
        if (col && col.developerName) {
            if (root.columnRules.has(col.developerName)) {
                let ruleResult: any = root.columnRules.get(col.developerName).generateColumnContent(col, row, root);
                result = ruleResult.content;
                rowClass = (ruleResult.rowClass? ruleResult.rowClass : "");
                cellClass = (ruleResult.cellClass? ruleResult.cellClass : "");
            } else {
                if (componentType?.length > 0) {
                    const columnProps = {
                        id: row.internalId,
                        propertyId: col.typeElementPropertyId,
                        contentValue: col.value,
                        objectData: col.value,
                        flowKey: root.parent.flowKey,
                        contentType: col.contentType,
                        contentFormat: col.contentFormat,
                        row,
                        sft: root,
                    };
                    result = React.createElement(manywho.component.getByName(componentType), columnProps);
                } else {
                    switch (contentType) {
                        case eContentType.ContentDateTime:
                            let dt: Date = new Date(col.value as string);
                            if ((dt instanceof Date && !isNaN(dt.getTime())) === true) {
                                let str: string = '';
                                switch (root.parent.getAttribute('DateFormat', 'LOCALE')) {
                                    case 'UTC':
                                        str = dt.toUTCString();
                                        break;
                                    case 'JSON':
                                        str = dt.toJSON();
                                        break;
                                    default:
                                        str = dt.toLocaleString();
                                        break;
                                }
                                result = (
                                    <span
                                        className="sft-table-cell-text"
                                    >
                                        {str}
                                    </span>
                                );
                            } else {
                                <span className="sft-table-cell-text" />;
                            }
                            break;

                        case eContentType.ContentString:
                            switch (true) {
                                case this.isXML(col.value as string) === true:
                                    result = (
                                        <button
                                            onClick={(e: any) => {this.showXML(col.developerName, col.value as string); }}
                                        >
                                            {'View XML'}
                                        </button>
                                    );
                                    break;

                                case this.isJSON(col.value as string) === true:
                                    result = (
                                        <button
                                            onClick={(e: any) => {this.showJSON(col.developerName, col.value as string); }}
                                        >
                                            {'View JSON'}
                                        </button>
                                    );
                                    break;

                                case this.isContent(col.value as string) === true:
                                    result = (
                                        <button
                                            onClick={(e: any) => {this.showContent(col.developerName, col.value as string); }}
                                        >
                                            {'View Content'}
                                        </button>
                                    );
                                    break;

                                case (col.value as string).startsWith('http:'):
                                case (col.value as string).startsWith('https:'):
                                    let inner: any;
                                    if (this.isUrlImage(col.value as string)) {
                                        inner = (
                                            <img
                                                src={col.value as string}
                                                style={{height: '2rem', width: 'auto'}}
                                                alt={col.value as string}
                                                title={col.value as string}
                                            />
                                        );
                                    } else {
                                        inner = col.value;
                                    }
                                    result = (
                                        <a
                                            href={(col.value as string)}
                                            target="_blank"
                                        >
                                            {inner}
                                        </a>
                                    );
                                    break;

                                case (col.value as string).startsWith('data:'):
                                    const mime = (col.value as string).split(';')[0].split(':')[1];
                                    switch (true) {
                                        case mime.startsWith('audio/'):
                                            result = (
                                                <audio
                                                    controls={true}
                                                    style={{width: '100%', minWidth: '9rem'}}>
                                                    <source src={(col.value as string)} type={mime}/>
                                                </audio>
                                            );
                                            break;

                                        case mime.startsWith('video/'):
                                            result = (
                                                <button
                                                    className="sft-table-cell-button"
                                                    onClick={(e: any) => {root.playVideo('Video', (col.value as string), mime); }}
                                                >
                                                    Play Video
                                                </button>
                                            );
                                            break;

                                        default:
                                            const dnld: string = this.makeFileName('file', mime);
                                            result = (
                                                <a href={(col.value as string)} target="_blank" download={dnld}>Download File</a>
                                            );
                                            break;
                                    }

                                    break;

                                case root.maxColText > 0 && (col.value as string).length > root.maxColText:
                                    result = (
                                        <button
                                            onClick={(e: any) => {this.showContent(col.developerName, col.value as string); }}
                                        >
                                            {'View Content'}
                                        </button>
                                    );
                                    break;

                                default:
                                    result = (
                                        <span
                                            className="sft-table-cell-text"
                                        >
                                            {(col.value as string)}
                                        </span>
                                    );
                                    break;
                            }

                            break;
                        case eContentType.ContentNumber:
                            if (((col as any).value as string) === '') {
                                result = (
                                    <span
                                        className="sft-table-cell-text"
                                    />
                                );
                            } else {
                                result = (
                                    <span
                                        className="sft-table-cell-text"
                                    >
                                        {(col.value as string)}
                                    </span>
                                );
                            }
                            break;
                        case eContentType.ContentBoolean:
                            if ((((col as any).value as string)+"")?.toLowerCase() === 'true') {
                                result = (
                                    <span
                                        className="sft-table-cell-text sft-table-cell-boolean sft-table-cell-boolean-true glyphicon glyphicon-ok"
                                    />
                                );
                            } else {
                                result = (
                                    <span
                                        className="sft-table-cell-text sft-table-cell-boolean sft-table-cell-boolean-false glyphicon glyphicon-remove"
                                    />
                                );
                            }
                            break;

                        default:
                            result = (
                                <span
                                    className="sft-table-cell-text"
                                >
                                    ???
                                </span>
                            );
                            break;
                    }
                }
            }
        } else {
            console.log('One of the columns in the table had a null name.  Check the table display columns settings in Flow');
        }
        return {result,rowClass, cellClass};
    }

    isUrlImage(url: string): boolean {
        url+="";
        if (
            url.endsWith('jpg') ||
            url.endsWith('jpeg') ||
            url.endsWith('jfif') ||
            url.endsWith('png') ||
            url.endsWith('bmp') ||
            url.endsWith('ico') ||
            url.endsWith('gif')
        ) { return true; } else {
            return false;
        }
    }

    isJSON(value: string): boolean {
        value+="";
        if (value === 'null') { value = ''; }
        try{
            if (value.indexOf('{') < 0) { return false; }
        }
        catch(e){
            console.log("bang")
        }
        try {
            value = value.replaceAll('\\n ', '');
            value = value.replaceAll('\\n}', '}');
            value = value.replaceAll('\\', '"');
            value = value.replaceAll('\"', '"');
            const obj = JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    showJSON(title: string, value: string) {
        const root: SFT = this.props.root;
        value = value.replaceAll('\\n ', '');
        value = value.replaceAll('\\n}', '}');
        value = value.replaceAll('\\', '"');
        value = value.replaceAll('\"', '"');
        const jj: string = JSON.stringify(JSON.parse(value), undefined, 4);
        // jj = jj.replaceAll('/&', '&amp;').replaceAll('/<', '&lt;').replaceAll('/>', '&gt;');

        const content = (
            <div
                style={{
                    overflow: 'visible'
                }}
            >
                <div
                    style={{
                        overflow: 'visible',
                        whiteSpace: 'pre',
                        textAlign: 'left',
                        fontSize: '1rem',
                    }}
                >
                    {jj}
                </div>
            </div>

        );
        root.messageBox.showDialog(
            null,
            title, 
            content, 
            [new FCMModalButton('Ok', root.messageBox.hideDialog)]);
    }

    isContent(value: string): boolean {
        value+="";
        if (value === 'null') { value = ''; }
        if (value.indexOf('\\n') > 0 || /<\/?[a-z][\s\S]*>/i.test(value)) {
            return true;
        } else {
            return false;
        }
    }

    showContent(title: string, value: string) {
        value = value.replaceAll('\\n', '<br>');
        value = value.replaceAll('<br><br>', '<br>');
        const content = (
            <div
                style={{
                    overflow: 'visible',
                }}
            >
                <pre>
                <code
                    style={{
                        overflow: 'visible',
                        whiteSpace: 'pre',
                        fontSize: '1rem',
                    }}
                    dangerouslySetInnerHTML={{__html: value}}
                />
                </pre>
            </div>

        );
        const root: SFT = this.props.root;
        root.messageBox.showDialog(
            null,
            title, 
            content, 
            [new FCMModalButton('Ok', root.messageBox.hideDialog)]);
    }

    isXML(value: string): boolean {
        value+="";
        if (value === 'null') { value = ''; }
        if (value.startsWith("<?xml")) {
            return true;
        } else {
            return false;
        }
    }

    showXML(title: string, value: string) {
        value = value.replaceAll('\\n', '<br>');
        value = value.replaceAll('<br><br>', '<br>');
        const content = (
            <div
                style={{
                    overflow: 'visible',
                }}
            >
                <pre>
                <code>
                    {value}
                </code>
                </pre>
            </div>

        );
        const root: SFT = this.props.root;
        root.messageBox.showDialog(
            null,
            title, 
            content, 
            [new FCMModalButton('Ok', root.messageBox.hideDialog)]);
    }

    makeFileName(name: string, mimeType: string): string {
        const fileName: string = name;
        switch (mimeType) {
            case 'audio/webm': return fileName + '.webm';

            default: return fileName;
        }
    }
}
