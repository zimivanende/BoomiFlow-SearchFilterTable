import React from 'react';
import ColumnCriteria, { eColumnComparator } from './ColumnCriteria';
import ColumnFilter from './ColumnFilter';
import MultiSelect from './MultiSelect';
import SearchFilterTable from './SearchFilterTable';

export default class FilterConfigForm extends React.Component<any, any> {

    filter: ColumnFilter;
    newCriteria: ColumnCriteria[];

    constructor(props: any) {
        super(props);
        this.filter = this.props.filter;
        this.newCriteria = [];
        this.filter.criteria.forEach((criteria: ColumnCriteria) => {
            this.newCriteria.push(criteria);
        });
        this.addCriteria = this.addCriteria.bind(this);
    }

    addCriteria() {
        this.newCriteria.push(new ColumnCriteria(eColumnComparator.equalTo, ''));
        this.forceUpdate();
    }

    getOptions(criteria: ColumnCriteria): any {
        const options: any[] = [];
        options.push(
            <option
                value={eColumnComparator.equalTo}
                selected={criteria.comparator === eColumnComparator.equalTo}
            >
                Equals
            </option>,
            <option
                value={eColumnComparator.notEqualTo}
                selected={criteria.comparator === eColumnComparator.notEqualTo}
            >
                Not Equal To
            </option>,
            <option
                value={eColumnComparator.contains}
                selected={criteria.comparator === eColumnComparator.contains}
            >
                Contains
            </option>,
            <option
                value={eColumnComparator.notContains}
                selected={criteria.comparator === eColumnComparator.notContains}
            >
                Does Not Contain
            </option>,
            <option
                value={eColumnComparator.startsWith}
                selected={criteria.comparator === eColumnComparator.startsWith}
            >
                Starts With
            </option>,
            <option
                value={eColumnComparator.endsWith}
                selected={criteria.comparator === eColumnComparator.endsWith}
            >
                Ends With
            </option>,
            <option
                value={eColumnComparator.in}
                selected={criteria.comparator === eColumnComparator.in}
            >
                Is one of
            </option>,
            <option
                value={eColumnComparator.notIn}
                selected={criteria.comparator === eColumnComparator.notIn}
            >
                Is Not One Of
            </option>,
        );
        return options;
    }

    getColumnUniques(name: string, criteria: ColumnCriteria): any {
        const options: any[] = [];
        const root: SearchFilterTable = this.props.root;

        /*
        root.colValMap.get(name).forEach((val,key) => {
            options.push(
                <option
                    value={key}
                    selected={criteria.value.set(key,key)}
                >
                    {key}
                </option>
            )
        });
*/
        return (
            /*
            <select
                className="sft-fcf-select"
                onChange={(e: any) => {

                }}
            >
                {options}
            </select>
            */
           <MultiSelect
                allItems={root.colValMap.get(name)}
                selectedItems={criteria.value}
           />
        );
    }

    prepCriteriaValue(criteria: ColumnCriteria) {
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
            this.newCriteria.forEach((criteria: ColumnCriteria) => {
                const options: any[] = this.getOptions(criteria);
                let critBox: any;
                switch (criteria.comparator) {
                    case eColumnComparator.in:
                    case eColumnComparator.notIn:
                        critBox = this.getColumnUniques(this.props.developerName, criteria);
                        break;

                    default:
                        critBox = (
                            <input
                                type="text"
                                className="sft-fcf-input"
                                defaultValue={criteria.value}
                                onChange={(e: any) => {criteria.value = e.target.value; }}
                            />
                        );
                        break;
                }

                rows.push(
                    <div
                        className="sft-fcf-row"
                    >
                        <select
                            className="sft-fcf-select"
                            onChange={(e: any) => {
                                criteria.comparator = parseInt(e.target.options[e.target.selectedIndex].value);
                                this.prepCriteriaValue(criteria);
                                this.forceUpdate();
                            }}
                        >
                            {options}
                        </select>
                        {critBox}
                        <span
                            className="sft-fcf-button glyphicon glyphicon-remove-sign"
                            title="Remove criteria"
                            onClick={(e: any) => {
                                this.newCriteria = this.newCriteria.filter(
                                    (item) => item !== criteria,
                                );
                                this.forceUpdate();
                            }}
                        />
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
            >
                {rows}
            </div>
        );
    }
}
