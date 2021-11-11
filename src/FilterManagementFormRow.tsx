import { eContentType, FlowDisplayColumn } from 'flow-component-model';
import React from 'react';
import ColumnCriteria, { eColumnComparator } from './ColumnCriteria';
import ColumnFilter from './ColumnFilter';
import FilterManagementForm from './FilterManagementForm';
import SearchFilterTable from './SearchFilterTable';

export default class FilterManagementFormRow extends React.Component<any, any> {

    comparatorElement: HTMLSelectElement;

    constructor(props: any) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
        this.comparatorChanged = this.comparatorChanged.bind(this);
        this.removeCriteria = this.removeCriteria.bind(this);
    }

    valueChanged(e: any) {
        this.props.criteria.value = e.target.value;
        this.forceUpdate();
    }

    comparatorChanged(e: any) {
        if (this.comparatorElement && this.comparatorElement.options[this.comparatorElement.selectedIndex].value) {
            const value = this.comparatorElement.options[this.comparatorElement.selectedIndex].value;
            const comparator: eColumnComparator = parseInt(value);
            this.props.criteria.comparator = comparator;
            if ((comparator !== eColumnComparator.in && comparator !== eColumnComparator.notIn) && typeof this.props.criteria.value !== 'string') {
                this.props.criteria.value = '';
            } else {
                if ((comparator === eColumnComparator.in || comparator === eColumnComparator.notIn) && typeof this.props.criteria.value === 'string') {
                    this.props.criteria.value = '';
                }
            }
            this.forceUpdate();
        }
    }

    removeCriteria() {
        this.props.parent.removeCriteria(this.props.filterId);
    }

    render() {
        const parent: FilterManagementForm = this.props.parent;
        const filter: ColumnFilter = parent.newFilters.get(this.props.filterId);
        const fieldDef: FlowDisplayColumn = parent.columns.get(filter.key);
        const criteria: ColumnCriteria = this.props.criteria;

        let fieldInput: any;
        if (fieldDef) {
            fieldInput = (
                <span>
                    {fieldDef.label}
                </span>
            );
        } else {
            const fieldOptions: any[] = [];
            parent.columns.forEach((field: FlowDisplayColumn) => {
            fieldOptions.push(
                <option
                    className="sft-fmf-row-criteria-select-option"
                    value={field.developerName}
                    selected={field.developerName === fieldDef.developerName}
                >
                    {field.label}
                </option>,
            );
        });
            fieldInput = (
                <select
                    className="sft-fmf-row-criteria-select"
                >
                    {fieldOptions}
                </select>
            );
        }

        const criteriaOptions: any[] = ColumnCriteria.getOptions(criteria.comparator, 'sft-fmf-row-criteria-select-option');

        let input: any;

        if (criteria.comparator === eColumnComparator.in || criteria.comparator === eColumnComparator.notIn) {
            input = (this.props.parent.props.parent as SearchFilterTable).getColumnUniques(fieldDef.developerName, criteria.value);
        } else {
            switch (fieldDef.contentType) {
                case eContentType.ContentDateTime:
                    input = (
                        <input
                            className="sft-fmf-row-criteria-date"
                            type="localDate"
                            value={this.props.criteria.value}
                            onChange={this.valueChanged}
                        />
                    );
                    break;

                case eContentType.ContentNumber:
                    input = (
                        <input
                            className="sft-fmf-row-criteria-number"
                            type="number"
                            value={this.props.criteria.value}
                            onChange={this.valueChanged}
                        />
                    );
                    break;
                case eContentType.ContentBoolean:
                    input = (
                        <input
                            className="sft-fmf-row-criteria-checkbox"
                            type="checkbox"
                            checked={this.props.criteria.value}
                            onChange={this.valueChanged}
                        />
                    );
                    break;
                default:
                    input = (
                        <input
                            className="sft-fmf-row-criteria-text"
                            type="text"
                            value={this.props.criteria.value}
                            onChange={this.valueChanged}
                        />
                    );
                    break;
            }
        }

        return (
            <div
                className="sft-fmf-row"
            >
                <div
                    className="sft-fmf-row-labels"
                >
                    <div
                        className="sft-fmf-row-caption"
                    >
                        Column Name
                    </div>
                    <div
                        className="sft-fmf-row-caption-criteria"
                    >
                        Comparator
                    </div>
                    <div
                        className="sft-fmf-row-caption"
                    >
                        Value
                    </div>
                </div>
                <div
                    className="sft-fmf-row-values"
                >
                    <div
                        className="sft-fmf-row-title"
                    >
                        {fieldInput}
                    </div>
                    <div
                        className="sft-fmf-row-criteria"
                    >
                        <select
                            className="sft-fmf-row-criteria-select"
                            onChange={this.comparatorChanged}
                            ref={(element: HTMLSelectElement) => {this.comparatorElement = element; }}
                        >
                            {criteriaOptions}
                        </select>
                    </div>
                    <div
                        className="sft-fmf-row-value"
                    >
                        {input}
                    </div>
                    <button
                        className="sft-ribbon-search-button-wrapper"
                        title="Remove criteria"
                        onClick={this.removeCriteria}
                    >
                        <span
                            className="sft-ribbon-search-button-icon glyphicon glyphicon-remove-sign"
                        />
                    </button>
                </div>
            </div>
        );
    }
}
