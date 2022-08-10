import { eContentType, FlowField, FlowObjectData, FlowObjectDataProperty } from 'flow-component-model';
import React, { CSSProperties } from 'react';
import CommonFunctions from './CommonFunctions';
import SearchFilterTable from './SearchFilterTable';

export class ColumnRules {
    static async parse(ruleStr: string, parent: SearchFilterTable): Promise<Map<string, ColumnRule>> {
        let match: any;
        while (match = RegExp(/^{{([^}]*)}}/).exec(ruleStr)) {
            
            const fldElements: string[] = match[1].split('->');
            // element[0] is the flow field name
            let val: FlowField = await parent.loadValue(fldElements[0]);            
            ruleStr = ruleStr.replace(match[0], val.value as string);
        }

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
        colRule.whiteSpace = rule.whitespace || '';
        colRule.cssClass = rule.classes || '';
        switch (colRule.mode) {
            case 'url':
                colRule.target = rule.target || '_blank';
                colRule.url = rule.url || '{{VALUE}}';
                colRule.label = rule.label || undefined;
                break;
            case 'dateformat':
                colRule.dateFormat = rule.dateFormat;
                break;
            case 'class':
                colRule.className = rule.className;
                break;
            case 'outcome':
                colRule.outcomeName = rule.outcomeName;
                break;
            case 'lookup':
                colRule.lookupTable = new Map();
                if(rule.options) {
                    Object.keys(rule.options).forEach((key: any) => {
                        colRule.lookupTable.set(key,rule.options[key]);
                    });
                }
                break;
            case 'format':
                colRule.format = rule.format;
                break;
            case 'currency':
                colRule.currency = rule.currency;
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
    whiteSpace: string;
    cssClass: string;
    outcomeName: string;
    lookupTable: Map<any,any>;
    format: string;
    currency: string;

    getTextValue(property: FlowObjectDataProperty): string {
        let result: string = '';
        const style: CSSProperties = {};
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

    generateColumnContent(value: any, row: FlowObjectData, sft?: SearchFilterTable): any {
        const style: CSSProperties = {};
        let classes: string = 'sft-table-cell-text';
        if (this.whiteSpace) {
            style.whiteSpace =  this.whiteSpace as 'normal';
        }
        if (this.cssClass) {
            classes += ' ' + this.cssClass;
        }
        let label: string;
        let match: any;
        const matches: any[] = [];
        switch (this.mode) {
            case 'outcome':
                label = this.label || value;
                let show: boolean = CommonFunctions.assessRowOutcomeRule(sft.outcomes[this.outcomeName],row,sft);
                

                // use regex to find any {{}} tags in content and save them in matches
                
                
                while (match = RegExp(/{{([^}]*)}}/).exec(label)) {
                    const prop: any = row.properties[match[1].replace('&amp;', '&')];
                    if (prop) {
                        const subs: string = this.getTextValue(prop);
                        label = label.replace(match[0], subs);
                    }
                }
                if(show) {
                    let toolTip: string = sft.outcomes[this.outcomeName].label;
                    return(
                        <span
                            className="sft-table-cell-href"
                            onClick={(e: any) => {sft.doOutcome(this.outcomeName,row.internalId)}}
                            title={toolTip}
                        >
                            {label}
                        </span>
                    );
                }
                else {
                    return(
                        <span className={classes} style={style}>{value}</span>
                    );
                }
                

            case 'url':
                const href: string = this.url.replace('{{VALUE}}', value);
                label = this.label || value;

                // use regex to find any {{}} tags in content and save them in matches
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
                const columnProps = {
                    id: row.internalId,
                    propertyId: value.typeElementPropertyId,
                    contentValue: value.value,
                    objectData: value.value,
                    flowKey: this.parent.flowKey,
                    contentType: value.contentType,
                    contentFormat: value.contentFormat,
                    row,
                    sft: this.parent,
                };
                return React.createElement(this.className, columnProps);
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
                                result = dt.toLocaleDateString("en-GB",{day:"2-digit", month:"short", year:"numeric"});
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
                    <span className={classes} style={style}>{result}</span>
                );
            case "lookup":
                let enval: any = value;
                if(this.lookupTable.has(value)){
                    enval = this.lookupTable.get(value)
                }
                return(
                    <span className={classes} style={style}>{enval}</span>
                );
            case "percent":
                let pc: string = parseInt(""+value) + "%";
                return(
                    <span className={classes} style={style}>{pc}</span>
                );
            case "format":
                let res: string = this.format.replaceAll("{{value}}",value);
                return(
                    <span className={classes} style={style}>{res}</span>
                );
            case "currency":
                var formatter = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: this.currency,
                  
                    // These options are needed to round to whole numbers if that's what you want.
                    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
                    maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
                  });
                let amt: string = formatter.format(value);
                return(
                    <span className={classes} style={style}>{amt}</span>
                );
            default:
                return(
                    <span className={classes} style={style}>{value}</span>
                );
        }
    }
}
