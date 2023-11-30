import { FlowDisplayColumn, FlowOutcome } from "flow-component-model";
import * as React from "react";
import {SearchFilterTable} from "./SearchFilterTable";

export class SearchFilterTableHeaderButtons extends React.Component<any,any> {

    componentDidMount() {
        this.forceUpdate();
    }

    render() {
        const root: SearchFilterTable = this.props.root;

        let headerButtons: any[] = [];

        let lastOrder: number = 0;
        let addedExpand: boolean = false;
        let addedContract: boolean = false;
        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];
            
            if (outcome.isBulkAction && outcome.developerName !== "OnSelect" && outcome.developerName !== "OnChange" && !outcome.developerName.toLowerCase().startsWith("cm")) {
                if(! (outcome.attributes["RequiresSelected"]?.value === "true" && root.selectedRowMap.size < 1)) {
                    headerButtons.push(
                        <span 
                            key={key}
                            className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " sft-header-button"} 
                            title={outcome.label || key}
                            onClick={(e: any) => {root.doOutcome(key, undefined)}}
                        />
                    );
                }
            }
        });

        return (
            <div
                className="sft-header-buttons"
            >
                {headerButtons}
            </div>
        );
    }
}