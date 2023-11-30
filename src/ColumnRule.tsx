import { eContentType, FlowField, FlowObjectData, FlowObjectDataProperty } from 'flow-component-model';
import * as React from 'react';
import { eColumnComparator } from './ColumnCriteria';
import {CommonFunctions} from './CommonFunctions';
import {SFT} from './SearchFilterTable';
declare var manywho: any;

export class ColumnRules {
    static async parse(ruleStr: string, parent: SFT): Promise<Map<string, ColumnRule>> {
        let match: any;
        while (match = RegExp(/^{{([^}]*)}}/).exec(ruleStr)) {
            
            const fldElements: string[] = match[1].split('->');
            // element[0] is the flow field name
            let val: FlowField = await parent.parent.loadValue(fldElements[0]);            
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
                console.log("Column rules attribute badly formatted");
            }
        }

        return rules;
    }
}

export class ColumnRule {

    static parse(key: string, rule: any, parent: SFT): ColumnRule {
        const colRule: ColumnRule = new ColumnRule();
        colRule.columnName = key;
        colRule.mode = rule.mode?.toLowerCase();
        colRule.parent = parent;
        colRule.whiteSpace = rule.whitespace || '';
        colRule.cssClass = rule.classes || '';
        colRule.condition = rule.condition;
        colRule.cellClass = rule.cellClass;
        colRule.rowClass = rule.rowClass;

        switch (colRule.mode) {
            case 'url':
                colRule.target = rule.target || '_blank';
                colRule.url = rule.url || '{{VALUE}}';
                colRule.label = rule.label || undefined;
                break;
            case 'dateformat':
                colRule.dateFormat = rule.dateFormat;
                colRule.timeZone = !((""+rule.timeZone).toLowerCase()==="false");
                break;
            case 'class':
                colRule.componentClass = rule.componentClass || rule.className;
            case 'style':
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
            case 'icon':
                colRule.icon = rule.icon;
                colRule.iconClass = rule.iconClass
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
    cellClass: string;
    parent: SFT;
    dateFormat: string;
    whiteSpace: string;
    cssClass: string;
    outcomeName: string;
    lookupTable: Map<any,any>;
    format: string;
    currency: string;
    condition: ColumnRuleCondition;
    rowClass: string;
    icon: string;
    iconClass: string;
    componentClass: string;
    timeZone: boolean = true;

    getTextValue(property: FlowObjectDataProperty): string {
        let result: string = '';
        const style: React.CSSProperties = {};
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

    generateColumnContent(value: FlowObjectDataProperty, row: FlowObjectData, sft?: SFT): any {
        const style: React.CSSProperties = {};
        let classes: string = 'sft-table-cell-text';
        if (this.whiteSpace) {
            style.whiteSpace =  this.whiteSpace as 'normal';
        }
        if (this.cssClass) {
            classes += ' ' + this.cssClass;
        }

        let applyRule: boolean = true;
        if(this.condition) {
            switch(this.condition.comparator.toLowerCase()){
                case "equals":
                    applyRule = value.value===this.condition.value;
                    break;
                case "not equals":
                    applyRule = value.value!==this.condition.value;
                    break;
                case "gt":
                    applyRule = value.value>this.condition.value;
                    break;
            }
        }
        let label: string;
        let match: any;
        let content: any;

        //if there's a rule then we always apply the base cell & row classes
        let rowClass: string =this.rowClass || "";
        let cellClass: string=this.cellClass || "";

        const matches: any[] = [];
        if(applyRule === true || this.mode==="icon") {
            rowClass=this.rowClass;
            switch (this.mode) {
                case 'outcome':
                    label = this.label || value.value as string;
                    let show: boolean = CommonFunctions.assessRowOutcomeRule(sft.parent.outcomes[this.outcomeName],row,sft);
                    

                    // use regex to find any {{}} tags in content and save them in matches
                    
                    
                    while (match = RegExp(/{{([^}]*)}}/).exec(label)) {
                        const prop: any = row.properties[match[1].replace('&amp;', '&')];
                        if (prop) {
                            const subs: string = this.getTextValue(prop);
                            label = label.replace(match[0], subs);
                        }
                    }
                    if(show) {
                        let toolTip: string = sft.parent.outcomes[this.outcomeName].label;
                        content = (
                            <span
                                className="sft-table-cell-href"
                                onClick={(e: any) => {sft.doOutcome(this.outcomeName,row)}}
                                title={toolTip}
                            >
                                {label}
                            </span>
                        );
                    }
                    else {
                        content = (
                            <span className={classes} style={style}>{label}</span>
                        );
                    }
                    break;
                case 'url':
                    const href: string = this.url.replace('{{VALUE}}', value.value as string);
                    label = this.label || value.value as string;

                    // use regex to find any {{}} tags in content and save them in matches
                    while (match = RegExp(/{{([^}]*)}}/).exec(label)) {
                        const prop: any = row.properties[match[1].replace('&amp;', '&')];
                        if (prop) {
                            const subs: string = this.getTextValue(prop);
                            label = label.replace(match[0], subs);
                        }
                    }
                    content = (
                        <a
                            className="sft-table-cell-href"
                            href={href}
                            target={this.target}
                        >
                            {label}
                        </a>
                    );
                    break;
                case 'class':
                    const columnProps = {
                        id: row.internalId,
                        propertyId: value.typeElementPropertyId,
                        contentValue: value.value,
                        objectData: value.value,
                        flowKey: this.parent.parent.flowKey,
                        contentType: value.contentType,
                        contentFormat: value.contentFormat,
                        row,
                        sft: this.parent,
                    };
                    content = React.createElement(manywho.component.getByName(this.componentClass), columnProps);
                    break;
                case 'dateformat':
                    let result: string = '';
                    if (value) {
                        const dt: Date = new Date(value.value as string);
                        if (!isNaN(dt.getTime()) && dt.getTime() > 0) {
                            if(this.timeZone===false){
                                dt.setMinutes(dt.getMinutes() + dt.getTimezoneOffset());
                            }
                            switch (this.dateFormat.toLowerCase()) {
                                case 'datetime':
                                    result = dt.toLocaleString("en-GB",{day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit"});
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
                    content = (
                        <span className={classes} style={style}>{result}</span>
                    );
                    break;
                case "lookup":
                    let enval: any = value;
                    if(this.lookupTable.has(value)){
                        enval = this.lookupTable.get(value)
                    }
                    content = (
                        <span className={classes} style={style}>{enval}</span>
                    );
                    break;
                case "percent":
                    let pc: string = parseInt((""+value?.value) || "0") + "%";
                    content = (
                        <span className={classes} style={style}>{pc}</span>
                    );
                    break;
                case "format":
                    let res: string = this.format.replaceAll("{{value}}",value.value as string);
                    content = (
                        <span className={classes} style={style}>{res}</span>
                    );
                    break;
                case "currency":
                    var formatter = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: this.currency,
                    
                        // These options are needed to round to whole numbers if that's what you want.
                        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
                        maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
                    });
                    let amt: string = formatter.format(value.value as number);
                    content = (
                        <span className={classes} style={style}>{amt}</span>
                    );
                    break;
                case "style":
                    content = (
                        <span className={classes + " " + cellClass} style={style}>{value.value as string}</span>
                    );
                    break;
                case "icon":
                    let iconClass: string = this.iconClass + " glyphicon glyphicon-";
                    if(applyRule) {
                        iconClass += (this.condition.icon || this.icon) + " " + this.condition.iconClass;
                        rowClass += " " + this.condition.rowClass;
                        cellClass += " " + this.condition.cellClass 
                    }
                    else {
                        iconClass += this.icon;
                    }
                    content = (
                        <span
                            title={""+ value.value}
                            className={classes + " " + iconClass } 
                            style={style}
                        />
                    );
                    break;
                default:
                    content = (
                        <span className={classes} style={style}>{value.value as string}</span>
                    );
                    break;
            }
        }
        else {
            content = (
                <span className={classes} style={style}>{value.value as string}</span>
            );
        }

        return {content: content, cellClass: cellClass, rowClass: rowClass}
    }
}

class ColumnRuleCondition{
    comparator: string;
    value: any;
    icon: any;
    cellClass: any;
    rowClass: any;
    iconClass: any;
}
