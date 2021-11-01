import { FlowDisplayColumn, FlowObjectData } from 'flow-component-model';
import CellItem from './CellItem';

export default class RowItem {
    id: string;
    columns: Map<string, CellItem> = new Map();
    objectData: FlowObjectData;
}
