import { eContentType } from 'flow-component-model';
import React from 'react';

export enum eColumnComparator {
    equalTo,
    notEqualTo,
    greaterThan,
    lessThan,
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
            case eColumnComparator.greaterThan: return 'Greater Than';
            case eColumnComparator.lessThan: return 'Less Than';
        }
    }

    static isOptionApplicable(comparator: eColumnComparator, fieldType: eContentType): boolean {
        switch (comparator) {
            // Generic comparators
            case eColumnComparator.equalTo:
            case eColumnComparator.notEqualTo:
                return true;

            // String only comparators
            case eColumnComparator.startsWith:
            case eColumnComparator.endsWith:
            case eColumnComparator.contains:
            case eColumnComparator.notContains:
            case eColumnComparator.in:
            case eColumnComparator.notIn:
                if ([eContentType.ContentString, eContentType.ContentPassword, eContentType.ContentNumber, eContentType.ContentContent].indexOf(fieldType) >= 0) {
                    return true;
                } else {
                    return false;
                }

            // numeric & date
            case eColumnComparator.lessThan:
            case eColumnComparator.greaterThan:
                if ([eContentType.ContentDateTime, eContentType.ContentNumber].indexOf(fieldType) >= 0) {
                    return true;
                } else {
                    return false;
                }
            default: return false;
        }
    }

    static getOptions(currentValue: eColumnComparator = -1, className: string = '', fieldType: eContentType): any[] {
        const options: any[] = [];
        Object.keys(eColumnComparator).filter((key: any) => !isNaN(Number(eColumnComparator[key]))).forEach((item: any) => {
            if (ColumnCriteria.isOptionApplicable(eColumnComparator[item as keyof typeof eColumnComparator ], fieldType)) {
                options.push(
                    <option
                        className={className}
                        value={eColumnComparator[item]}
                        selected={eColumnComparator[item as keyof typeof eColumnComparator ] === currentValue}
                    >
                        {ColumnCriteria.getDisplayValue(eColumnComparator[item as keyof typeof eColumnComparator ])}
                    </option>,
                );
            }
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
                // let vals: any[];
                // if (typeof value === 'string') {
                //    vals = value.split(',');
                // } else {
                //    vals = JSON.parse(value);
                // }

                // this.value = new Map();
                // vals?.forEach((val: any) => {
                //    this.value.set(val, val);
                // });
                // this.value.push(value);
                this.value = value;
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
