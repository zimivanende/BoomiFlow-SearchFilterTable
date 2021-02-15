
export enum eColumnComparator {
    equalTo,
    notEqualTo,
    startsWith,
    endsWith,
    contains,
    notContains,
    in,
    notIn
}

export default class ColumnCriteria {
    comparator: eColumnComparator;
    value: any;

    constructor(comparator: eColumnComparator, value: any) {
        this.comparator=comparator;
        switch(comparator) {
            case eColumnComparator.in:
            case eColumnComparator.notIn:
                let vals: Array<any> = JSON.parse(value);
                this.value=new Map();
                vals.forEach((val: any) => {
                    this.value.set(val,val);
                });
                //this.value.push(value);
                break;

            default:
                this.value=value;
        }
    }

    getForStorage() : string {
        let result: any = {};
        result.comparator = this.comparator;
        if(this.value instanceof Map) {
            let vals: Array<any> = [];
            this.value.forEach((val: any, key: any) => {
                vals.push(key);
            });
            result.value = JSON.stringify(vals);
        }
        else {
            result.value = this.value;
        }
        return JSON.stringify(result);
    }
}