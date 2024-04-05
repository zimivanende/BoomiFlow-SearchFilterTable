import { eContentType, FlowDisplayColumn, FlowObjectData, FlowObjectDataArray } from 'flow-component-model';
import { RowItem } from './RowItem';

export class ModelExporter {

    static export(columns: Map<string, FlowDisplayColumn>, data: Map<string, RowItem>, fileName: string) {
        let file: string = '';
        let body: string = '';
        let headers: string = '';
        let row: string = '';

        data.forEach((item: RowItem) => {

            if (headers.length === 0) {
                headers = this.buildHeaders(columns, item.objectData);
            }
            row = this.buildRow(columns, item.objectData);
            body += row;
        });

        let BOM = "\uFEFF";
        file = BOM + headers + body;
        // Remove double quotes from the CSV content
        file = file.replace(/"/g, "");
        
        const blob = new Blob([file], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    static buildHeaders(cols: Map<string, FlowDisplayColumn>, values: FlowObjectData): string {
        let headers: string = '';
        cols.forEach((col: FlowDisplayColumn) => {
            if (headers.length > 0) {
                headers += ';'; // Change delimiter to semicolon
            }
            headers += col.label;
        });
        headers += '\r\n';
        return headers;
    }

    static buildRow(cols: Map<string, FlowDisplayColumn>, values: FlowObjectData): string {
        let row: string = '';
        cols.forEach((col: FlowDisplayColumn) => {
            if (row.length > 0) {
                row += ';'; // Change delimiter to semicolon
            }
            row += values.properties[col.developerName].value;
        });
        row += '\r\n';
        return row;
    }
}
