
export enum eColumnComparator {
    equalTo,
    notEqualTo,
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
        this.value=value;
    }
}