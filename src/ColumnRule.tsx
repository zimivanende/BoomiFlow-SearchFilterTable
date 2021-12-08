import React from 'react';

export class ColumnRules {
    static parse(ruleStr: string): Map<string, ColumnRule> {
        const rules: Map<string, ColumnRule> = new Map();
        if (ruleStr && ruleStr.length > 0) {
            let rObj: any;
            try {
                rObj = JSON.parse(ruleStr);
                Object.keys(rObj).forEach((key: string) => {
                    rules.set(key, ColumnRule.parse(key, rObj[key]));
                });
            } catch (e) {

            }
        }

        return rules;
    }
}

export class ColumnRule {

    static parse(key: string, rule: any): ColumnRule {
        const colRule: ColumnRule = new ColumnRule();
        colRule.columnName = key;
        colRule.mode = rule.mode?.toLowerCase();
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

            default:
                return(
                    <span>{value}</span>
                );
        }
    }
}
