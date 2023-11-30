import { eContentType } from 'flow-component-model';

export class CellItem {
    id: string;
    name: string;
    label: string;
    type: eContentType;
    originalValue: any;
    newValue: any;

    constructor(name: string, value: string) {
        this.name = name;
        this.originalValue = value;
        this.newValue = value;
    }
}
