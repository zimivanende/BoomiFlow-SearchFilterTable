import { FlowDisplayColumn } from "flow-component-model";
import React from "react";
import SearchFilterTable from "./SearchFilterTable";

export default class SearchFilterTableFooter extends React.Component<any,any> {

    componentDidMount() {
        this.forceUpdate();
    }

    render() {
        const root: SearchFilterTable = this.props.root;

        let summary: string = "Selected " + root.selectedRowMap.size + " of " + root.currentRowMap.size + " items from a total dataset of " + root.rowMap.size;
        let pag: string = "page " + (root.currentRowPage + 1) + " of " + root.currentRowPages.length;

        
        let firstPage: any;
        let prevPage: any;
        let nextPage: any;
        let lastPage: any;

        if(root.currentRowPage > 0){
            firstPage = (
                <span
                    className="glyphicon glyphicon-fast-backward sft-footer-pagination-button"
                    title="First page"
                    onClick={root.firstPage}
                />
            );
            prevPage = (
                <span
                    className="glyphicon glyphicon-step-backward sft-footer-pagination-button"
                    title="Previous page"
                    onClick={root.previousPage}
                />
            );
        }
        else {
            firstPage = (
                <span
                    className="glyphicon glyphicon-fast-backward sft-footer-pagination-button sft-footer-pagination-button-disabled"
                />
            );
            prevPage = (
                <span
                    className="glyphicon glyphicon-step-backward sft-footer-pagination-button sft-footer-pagination-button-disabled"
                />
            );
        }

        if(root.currentRowPage < (root.currentRowPages.length -1)){
            lastPage = (
                <span
                    className="glyphicon glyphicon-fast-forward sft-footer-pagination-button"
                    title="Last page"
                    onClick={root.lastPage}
                />
            );
            nextPage = (
                <span
                    className="glyphicon glyphicon-step-forward sft-footer-pagination-button"
                    title="Next page"
                    onClick={root.nextPage}
                />
            );
        }
        else {
            lastPage = (
                <span
                    className="glyphicon glyphicon-fast-forward sft-footer-pagination-button sft-footer-pagination-button-disabled"
                />
            );
            nextPage = (
                <span
                    className="glyphicon glyphicon-step-forward sft-footer-pagination-button sft-footer-pagination-button-disabled"
                />
            );
        }

        return (
            <div
                className="sft-footer"
            >
                <div
                    className="sft-footer-summary"
                >
                    <span
                        className="sft-footer-summary-label"
                    >
                        {summary}
                    </span>
                </div>
                <div
                    className="sft-footer-pagination"
                >
                    {firstPage}
                    {prevPage}
                    <span className="sft-footer-pagination-label">{pag}</span> 
                    {nextPage}
                    {lastPage}
                </div>              
            </div>
        );
    }
}