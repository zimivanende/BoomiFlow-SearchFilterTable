import React from 'react';

export enum eColumnComparator {
    equalTo,
    notEqualTo,
    startsWith,
    endsWith,
    contains,
    notContains,
    in,
    notIn,
}

export default class ColumnCriteria {

    static getDisplayValue(criteria: eColumnComparator): string {
        let typedCriteria;
        switch (criteria) {
            case eColumnComparator.equalTo: return 'Equals';
            case eColumnComparator.notEqualTo: return 'Not Equal To';
            case eColumnComparator.startsWith: return 'Starts With';
            case eColumnComparator.endsWith: return 'Does Not Start With';
            case eColumnComparator.contains: return 'Contains';
            case eColumnComparator.notContains: return 'Does Not Contain';
            case eColumnComparator.in: return 'Is In';
            case eColumnComparator.notIn: return 'Is Not In';
        }
    }

    static getOptions(currentValue: eColumnComparator = -1, className: string = ''): any[] {
        const options: any[] = [];
        Object.keys(eColumnComparator).filter((key: any) => !isNaN(Number(eColumnComparator[key]))).forEach((item: any) => {
            options.push(
                <option
                    className={className}
                    value={eColumnComparator[item]}
                    selected={eColumnComparator[item as keyof typeof eColumnComparator ] === currentValue}
                >
                    {ColumnCriteria.getDisplayValue(eColumnComparator[item as keyof typeof eColumnComparator ])}
                </option>,
            );
        });

        return options;
    }
    comparator: eColumnComparator;
    value: any;

    constructor(comparator: eColumnComparator, value: any) {
        this.comparator = comparator;
        switch (comparator) {
            case eColumnComparator.in:
            case eColumnComparator.notIn:
                let vals: any[];
                if (typeof value === 'string') {
                    vals = value.split(',');
                } else {
                    vals = JSON.parse(value);
                }

                this.value = new Map();
                vals?.forEach((val: any) => {
                    this.value.set(val, val);
                });
                // this.value.push(value);
                break;

            default:
                this.value = value;
        }
    }

    getForStorage(): string {
        const result: any = {};
        result.comparator = this.comparator;
        if (this.value instanceof Map) {
            const vals: any[] = [];
            this.value.forEach((val: any, key: any) => {
                vals.push(key);
            });
            result.value = JSON.stringify(vals);
        } else {
            result.value = this.value;
        }
        return JSON.stringify(result);
    }
}
