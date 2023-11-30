import * as React from 'react';
import './MultiSelect.css';

export class MultiSelect extends React.Component <any, any> {

    expanded: boolean = false;

    constructor(props: any) {
        super(props);
        this.showCheckboxes = this.showCheckboxes.bind(this);
    }

    showCheckboxes() {
        const checkboxes = document.getElementById('checkboxes_' + this.props.id);
        if (!this.expanded) {
            checkboxes.style.display = 'flex';
            this.expanded = true;
        } else {
            checkboxes.style.display = 'none';
            this.expanded = false;
        }
    }

    render() {
        const checkBoxes: any[] = [];
        const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        const sorted: any[] = Array.from(this.props.allItems.keys()).sort((a: any, b: any) => collator.compare(a, b));

        sorted.forEach((item: string) => {
            checkBoxes.push(
                <div
                    className="checkbox-row"
                >
                    <div
                        className="checkbox-checkbox-wrapper"
                    >
                        <input
                            type="checkbox"
                            id={item}
                            key={item}
                            className="sft-checkbox"
                            checked={
                                this.props.selectedItems?.has(item)
                            }
                            onClick={(e: any) => {
                                if (this.props.selectedItems?.has(item)) {
                                    this.props.selectedItems.delete(item);
                                } else {
                                    this.props.selectedItems.set(item, item);
                                }
                                this.forceUpdate();
                            }}
                        />
                    </div>
                    <div
                        className="checkbox-label-wrapper"
                    >
                        <span
                            className="checkbox-row-label"
                        >
                            {item}
                        </span>
                    </div>

                </div>,
            );

        });

        return (
            <div className="multiselect">
                <div
                    className="selectBox"
                    onClick={this.showCheckboxes}
                >
                    <select>
                        <option>Select an option</option>
                    </select>
                    <div
                        className="overSelect"
                    />
                </div>
                <div
                    className="checkboxScroller"
                >
                    <div
                        className="checkboxes"
                        id={'checkboxes_' + this.props.id}
                    >
                        {checkBoxes}
                    </div>
                </div>
            </div>
        );
    }

}
