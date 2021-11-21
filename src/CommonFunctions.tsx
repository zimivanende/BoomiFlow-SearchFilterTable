import { eContentType, FlowObjectData, FlowObjectDataProperty, FlowOutcome } from "flow-component-model";
import SearchFilterTable from "./SearchFilterTable";

export default class CommonFunctions {

    static assessGlobalOutcomeRule(outcome: FlowOutcome, root: SearchFilterTable) : boolean {
        let result: boolean = true;

        if (outcome.attributes['RequiresSelected']?.value === 'true' && root.selectedRowMap.size < 1) {
            result=false;
        }

        return result;
    }

    static assessRowOutcomeRule(outcome: FlowOutcome, row: FlowObjectData) :  boolean {
        let result: boolean = true;
        if(outcome.attributes.rule && outcome.attributes.rule.value.length>0){
            try{
                let rule = JSON.parse(outcome.attributes.rule.value);
                let property: FlowObjectDataProperty = row.properties[rule.field];
                let val: any;
                let value: any;
                switch(property.contentType){
                    case eContentType.ContentNumber:
                        value=parseInt(rule.value);
                        val=property.value;
                        break;
                    case eContentType.ContentDateTime:
                        value=new Date(rule.value);
                        val=property.value;
                        break;
                    case eContentType.ContentBoolean:
                        value=rule.value.toLowerCase() === "true";
                        val=property.value;
                        break;  
                    case eContentType.ContentString:
                    default:
                        value=rule.value.toLowerCase();
                        val=(property.value as string)?.toLowerCase();
                        break;  
                }
                
                switch(rule.comparator){
                    case "equals":
                        result=val===value;
                        break;
                    case "not equals":
                        result=val!==value;
                        break;
                    case "contains":
                        result=val.inStr(value) >= 0;
                        break;
                    case "not contains":
                        result=val.inStr(value) < 0;
                        break;
                    case "starts with":
                        result=("" + val).startsWith(value);
                        break;
                    case "ends with":
                        result=("" + val).endsWith(value);
                        break;
                    case "in":
                        result=value.inStr(val) >= 0;
                        break;
                    case "not in":
                        result=value.inStr(val) < 0;
                        break;
                    case "lt":
                        result=parseInt(""+val) < parseInt(""+val);
                        break;
                    case "lte":
                        result=parseInt(""+val) <= parseInt(""+val);
                        break;
                    case "gt":
                        result=parseInt(""+val) > parseInt(""+val);
                        break;
                    case "gte":
                        result=parseInt(""+val) >= parseInt(""+val);
                        break;

                }
            }
            catch(e){
                console.log("The rule on row level outcome " + outcome.developerName + " is invalid")
            }
        }
        return result;
    }
}