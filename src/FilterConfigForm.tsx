import * as React from 'react';
import {SFTColumnCriteria, eColumnComparator } from './ColumnCriteria';
import {SFTColumnFilter} from './ColumnFilter';

export class FilterConfigForm extends React.Component<any, any> {

    filter: SFTColumnFilter;
    newCriteria: SFTColumnCriteria[];

    constructor(props: any) {
        super(props);
        this.filter = this.props.filter;
        this.newCriteria = [];
        this.filter.criteria.forEach((criteria: SFTColumnCriteria) => {
            this.newCriteria.push(criteria);
        });
        this.addCriteria = this.addCriteria.bind(this);
    }

    addCriteria() {
        this.newCriteria.push(new SFTColumnCriteria(eColumnComparator.equalTo, ''));
        this.forceUpdate();
    }

    prepCriteriaValue(criteria: SFTColumnCriteria) {
        switch (criteria.comparator) {
            case eColumnComparator.in:
            case eColumnComparator.notIn:
                criteria.value = new Map();
                break;

            default:
                if (typeof criteria.value !== 'string') {
                    criteria.value = '';
                }
                break;
        }
    }

    render() {

        const rows: any[] = [];
        if (this.newCriteria.length === 0) {
            rows.push(
                <div
                    className="sft-fcf-row"
                >
                    <span
                        className="sft-fcf-label">
                            No Criteria defined
                    </span>
                </div>,
            );
        } else {
            this.newCriteria.forEach((criteria: SFTColumnCriteria) => {
                const options: any[] = SFTColumnCriteria.getOptions(criteria.comparator, 'sft-fmf-row-criteria-select-option', this.props.contentType);
                let critBox: any;
                let critBox2: any;
                switch (criteria.comparator) {
                    case eColumnComparator.in:
                    case eColumnComparator.notIn:
                        critBox = this.props.root.getColumnUniques(this.props.developerName, criteria);
                        break;
                    case eColumnComparator.between:
                        critBox = (
                            <input
                                type="text"
                                className="sft-fmf-row-criteria-text"
                                defaultValue={criteria.value}
                                onChange={(e: any) => {criteria.value = e.target.value; }}
                            />
                        );
                        critBox2 = (
                            <input
                                type="text"
                                className="sft-fmf-row-criteria-text"
                                defaultValue={criteria.value2}
                                onChange={(e: any) => {criteria.value2 = e.target.value; }}
                            />
                        );
                        break;
                    default:
                        critBox = (
                            <input
                                type="text"
                                className="sft-fmf-row-criteria-text"
                                defaultValue={criteria.value}
                                onChange={(e: any) => {criteria.value = e.target.value; }}
                            />
                        );
                        break;
                }

                rows.push(
                    <div
                        className="sft-fmf-row"
                    >
                        <div
                            className="sft-fmf-row-labels"
                        >
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
                                className="sft-fmf-row-criteria"
                            >
                                <select
                                    className="sft-fmf-row-criteria-select"
                                    onChange={(e: any) => {
                                        criteria.comparator = parseInt(e.target.options[e.target.selectedIndex].value);
                                        this.prepCriteriaValue(criteria);
                                        this.forceUpdate();
                                    }}
                                >
                                {options}
                                </select>
                            </div>
                            <div
                                className="sft-fmf-row-value"
                            >
                                {critBox}
                                {critBox2}
                            </div>
                            <button
                                className="sft-ribbon-search-button-wrapper"
                                title="Remove criteria"
                                onClick={(e: any) => {
                                    this.newCriteria = this.newCriteria.filter(
                                        (item) => item !== criteria,
                                    );
                                    this.forceUpdate();
                                }}
                            >
                                <span
                                    className="sft-ribbon-search-button-icon glyphicon glyphicon-remove-sign"
                                />
                            </button>
                        </div>

                    </div>,
                );
            });
        }
        rows.push(
            <div
                className="sft-fcf-buttons"
            >
                <span
                    className="sft-fcf-button glyphicon glyphicon-plus-sign"
                    title="Add criteria"
                    onClick={this.addCriteria}
                />
            </div>,
        );
        return (
            <div
                className="modal-dialog-content"
                style={{width: '910px', display: 'flex', flexDirection: 'column', margin: 'auto', padding: '2rem'}}
            >
                {rows}
            </div>
        );
    }
}
