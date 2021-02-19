import { FlowDisplayColumn, FlowOutcome } from "flow-component-model";
import React from "react";
import SearchFilterTable from "./SearchFilterTable";

export default class SearchFilterTableRibbon extends React.Component<any,any> {

    componentDidMount() {
        this.forceUpdate();
    }

    render() {

        const root: SearchFilterTable = this.props.root;

        let leftButtons: any[] = [];
        let rightButtons: any[] = [];

        let lastOrder: number = 0;
        let addedExpand: boolean = false;
        let addedContract: boolean = false;

        let canExport: boolean = (root.getAttribute("canExport","true").toLowerCase() === "true");

        // ad export if allowed
        if(canExport === true) {
            rightButtons.push(
                <div 
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.rowMap)}}
                >
                    <span 
                        key={"exportAll"}
                        className={"glyphicon glyphicon-floppy-save sft-ribbon-button-icon"} 
                        title={"Export All"}
                        
                    />
                    <span
                        className="sft-ribbon-button-label"
                    >
                        {"Export All"}
                    </span>
                </div>
            );
        }
        
        if(root.rowMap.size > root.currentRowMap.size && canExport === true) {
            rightButtons.push(
                <div 
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.currentRowMap)}}
                >
                    <span 
                        key={"exportShown"}
                        className={"glyphicon glyphicon-floppy-save sft-ribbon-button-icon"} 
                        title={"Export Shown"}
                        
                    />
                    <span
                        className="sft-ribbon-button-label"
                    >
                        {"Export Shown"}
                    </span>
                </div>
            );
        }

        
        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];
            
            if (outcome.isBulkAction && outcome.developerName !== "OnSelect" && outcome.developerName !== "OnChange" && !outcome.developerName.toLowerCase().startsWith("cm")) {
                if(outcome.attributes["RequiresSelected"]?.value === "true") {
                    if(root.selectedRowMap.size > 0) {
                        leftButtons.push(
                            <div 
                                className="sft-ribbon-button-wrapper"
                                onClick={(e: any) => {root.doOutcome(key, undefined)}}
                            >
                                <span 
                                    key={key}
                                    className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " sft-ribbon-button-icon"} 
                                    title={outcome.label || key}
                                    
                                />
                                <span
                                    className="sft-ribbon-button-label"
                                >
                                    {outcome.label || key}
                                </span>
                            </div>
                            
                        );
                    }
                }
                else {
                    rightButtons.push(
                        <div 
                            className="sft-ribbon-button-wrapper"
                            onClick={(e: any) => {root.doOutcome(key, undefined)}}
                        >
                            <span 
                                key={key}
                                className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " sft-ribbon-button-icon"} 
                                title={outcome.label || key}
                                
                            />
                            <span
                                className="sft-ribbon-button-label"
                            >
                                {outcome.label || key}
                            </span>
                        </div>
                    );
                }
            }
        });

        if(root.selectedRowMap.size > 0 && canExport === true) {
            leftButtons.push(
                <div 
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.selectedRowMap)}}
                >
                    <span 
                        key={"exportSelected"}
                        className={"glyphicon glyphicon-floppy-save sft-ribbon-button-icon"} 
                        title={"Export Selected"}
                        
                    />
                    <span
                        className="sft-ribbon-button-label"
                    >
                        {"Export Selected"}
                    </span>
                </div>
            );
        }
        
        
        return (
            <div
                className="sft-ribbon"
            >
                <div
                    className="sft-ribbon-left-wrapper"
                >
                    <div
                        className="sft-ribbon-title-wrapper"
                    >
                        <span
                            className="sft-ribbon-title"
                        >
                            {"Available actions:"}
                        </span>
                        
                    </div>
                    <div
                        className="sft-ribbon-hbuttons-wrapper"
                    >
                        {leftButtons} 
                    </div>
                </div>
                <div
                    className="sft-ribbon-right-wrapper"
                >
                   <div
                        className="sft-ribbon-title-wrapper"
                    >
                        <span
                            className="sft-ribbon-title"
                        >
                            
                        </span>
                        
                    </div>
                    <div
                        className="sft-ribbon-hbuttons-wrapper"
                    >
                        {rightButtons} 
                    </div> 
                </div>
            </div>
        );
    }
}