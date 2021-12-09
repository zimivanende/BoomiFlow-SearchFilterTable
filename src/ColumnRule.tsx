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

    generateColumnContent(value: any): any {
        switch (this.mode) {
            case 'url':
                const href: string = this.url.replace('{{VALUE}}', value);
                return(
                    <a
                        className="sft-table-cell-href"
                        href={href}
                        target={this.target}
                    >
                        {this.label || value}
                    </a>
                );
            case 'class':
                const props: any = {
                    parent: this.parent,
                    rule: this,
                    value,
                };
                return React.createElement(this.className, props);
            default:
                return(
                    <span>{value}</span>
                );
        }
    }
}
