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
        
        const blob = new Blob([file], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        if (link.download !== undefined) { // feature detection
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
        let isFirst = true; // Track the first column to avoid leading semicolon
        cols.forEach((col: FlowDisplayColumn) => {
            if (!isFirst) {
                headers += ';'; // Use semicolon as delimiter
            } else {
                isFirst = false;
            }
            switch (col.contentType) {
                case eContentType.ContentList:
                    const children: FlowObjectDataArray = values.properties[col.developerName].value as FlowObjectDataArray;
                    children.items.forEach((item: FlowObjectData, index) => {
                        if (index > 0) {
                            headers += ';'; // Use semicolon for subsequent items
                        }
                        headers += item.properties['ATTRIBUTE_DISPLAY_NAME'].value;
                    });
                    break;
                default:
                    headers += col.label;
                    break;
            }
        });
        headers += '\r\n';
        return headers;
    }

    static buildRow(cols: Map<string, FlowDisplayColumn>, values: FlowObjectData): string {
        let row: string = '';
        let isFirst = true; // Track the first column to avoid leading semicolon
        cols.forEach((col: FlowDisplayColumn) => {
            if (!isFirst) {
                row += ';'; // Use semicolon as delimiter
            } else {
                isFirst = false;
            }
            switch (col.contentType) {
                case eContentType.ContentList:
                    const children: FlowObjectDataArray = values.properties[col.developerName].value as FlowObjectDataArray;
                    children.items.forEach((item: FlowObjectData, index) => {
                        if (index > 0) {
                            row += ';'; // Use semicolon for subsequent items
                        }
                        row += item.properties['ATTRIBUTE_VALUE'].value;
                    });
                    break;
                default:
                    row += values.properties[col.developerName].value;
                    break;
            }
        });
        row += '\r\n';
        return row;
    }
}
