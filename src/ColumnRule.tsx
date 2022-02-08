import { eContentType, FlowObjectData, FlowObjectDataProperty } from 'flow-component-model';
import React from 'react';
import SearchFilterTable from './SearchFilterTable';

export class ColumnRules {
    static parse(ruleStr: string, parent: SearchFilterTable): Map<string, ColumnRule> {
        const rules: Map<string, ColumnRule> = new Map();
        if (ruleStr && ruleStr.length > 0) {
            let rObj: any;
            try {
                rObj = JSON.parse(ruleStr);
                Object.keys(rObj).forEach((key: string) => {
                    rules.set(key, ColumnRule.parse(key, rObj[key], parent));
                });
            } catch (e) {

            }
        }

        return rules;
    }
}

export class ColumnRule {

    static parse(key: string, rule: any, parent: SearchFilterTable): ColumnRule {
        const colRule: ColumnRule = new ColumnRule();
        colRule.columnName = key;
        colRule.mode = rule.mode?.toLowerCase();
        colRule.parent = parent;
        switch (colRule.mode) {
            case 'url':
                colRule.target = rule.target || '_blank';
                colRule.url = rule.url || '{{VALUE}}';
                colRule.label = rule.label || undefined;
                break;
            case 'dateformat':
                colRule.dateFormat = rule.dateFormat;
                break;
            default:
                break;
        }
        return colRule;
    }

    columnName: string;
    mode: string;
    target: string;
    url: string;
    label: string;
    className: string;
    parent: SearchFilterTable;
    dateFormat: string;

    getTextValue(property: FlowObjectDataProperty): string {
        let result: string = '';
        switch (property.contentType) {
            case eContentType.ContentBoolean:
                if (property.value === true) {
                    result = 'True';
                } else {
                    result = 'False';
                }
                break;
            case eContentType.ContentNumber:
                result = property.value.toString();
                break;
            default:
                result = property.value as string;
                break;
        }
        return result;
    }

    generateColumnContent(value: any, row: FlowObjectData): any {
        switch (this.mode) {
            case 'url':
                const href: string = this.url.replace('{{VALUE}}', value);
                let label: string = this.label || value;

                // use regex to find any {{}} tags in content and save them in matches
                let match: any;
                const matches: any[] = [];
                while (match = RegExp(/{{([^}]*)}}/).exec(label)) {
                    const prop: any = row.properties[match[1].replace('&amp;', '&')];
                    if (prop) {
                        const subs: string = this.getTextValue(prop);
                        label = label.replace(match[0], subs);
                    }
                }
                return(
                    <a
                        className="sft-table-cell-href"
                        href={href}
                        target={this.target}
                    >
                        {label}
                    </a>
                );
            case 'class':
                const props: any = {
                    parent: this.parent,
                    rule: this,
                    value,
                };
                return React.createElement(this.className, props);
            case 'dateformat':
                let result: string = '';
                if (value) {
                    const dt: Date = new Date(value);
                    if (!isNaN(dt.getTime())) {
                        switch (this.dateFormat.toLowerCase()) {
                            case 'datetime':
                                result = dt.toLocaleString();
                                break;
                            case 'date':
                                result = dt.toLocaleDateString();
                                break;
                            case 'time':
                                result = dt.toLocaleTimeString();
                                break;
                            case 'json':
                                result = dt.toJSON();
                                break;
                            case 'iso':
                                result = dt.toISOString();
                                break;
                            case 'utc':
                                result = dt.toUTCString();
                                break;
                            case 'year':
                                result = '' + dt.getFullYear();
                                break;
                        }
                    }
                }
                return (
                    <span className="sft-table-cell-text" >{result}</span>
                );

            default:
                return(
                    <span className="sft-table-cell-text">{value}</span>
                );
        }
    }
}
