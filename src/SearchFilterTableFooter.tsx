import { FlowDisplayColumn } from 'flow-component-model';
import React from 'react';
import SearchFilterTable, { ePaginationMode } from './SearchFilterTable';

export default class SearchFilterTableFooter extends React.Component<any, any> {

    maxPerPage: any;

    componentDidMount() {
        this.forceUpdate();
        this.maxPerPageChanged = this.maxPerPageChanged.bind(this);
    }

    maxPerPageChanged(e: any) {
        const root: SearchFilterTable = this.props.root;
        root.maxPerPageChanged(parseInt(this.maxPerPage.options[this.maxPerPage.selectedIndex].value));
    }

    render() {
        const root: SearchFilterTable = this.props.root;

        const summary: string = 'Selected ' + root.selectedRowMap.size + ' of ' + root.currentRowMap.size + ' items from a total dataset of ' + root.rowMap.size;
        const pag: string = 'page ' + (root.currentRowPage + 1) + ' of ' + root.currentRowPages.length;

        let firstPage: any;
        let prevPage: any;
        let nextPage: any;
        let lastPage: any;

        if (root.currentRowPage > 0) {
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
        } else {
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

        if (root.currentRowPage < (root.currentRowPages.length - 1)) {
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
        } else {
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

        let options: number[] = [];
        options.push(10, 20, 50, 100);
        if (options.indexOf(root.maxPageRows) < 0) {
            options.push(root.maxPageRows);
        }
        options = options.sort((a, b) => {
            return a - b;
        });

        const opts: any[] = [];
        options.forEach((a: number) => {
            opts.push(
                <option
                    value={a}
                    selected={root.maxPageRows === a}
                >
                    {a}
                </option>,
            );
        });

        const perPage: any = (
            <select
                className={'sft-footer-select'}
                onChange={this.maxPerPageChanged}
                ref={(element: any) => {this.maxPerPage = element; }}
            >
               {opts}
            </select>
        );

        let pagination: any;
        let perPageBlock: any;
        if(root.paginationMode===ePaginationMode.local) {
            pagination = (
                <div
                    className="sft-footer-pagination"
                >
                    {firstPage}
                    {prevPage}
                    <span className="sft-footer-pagination-label">{pag}</span>
                    {nextPage}
                    {lastPage}
                </div>
            );
            perPageBlock=(
                <div
                    className="sft-footer-perpage"
                >
                    <div
                        className="sft-footer-perpage-label"
                    >
                        {'Items per page'}
                    </div>
                    <div
                        className="sft-footer-perpage-dropdown"
                    >
                        {perPage}
                    </div>
                </div>
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
                    className="sft-footer-spacer"
                />
                {perPageBlock}
                {pagination}
            </div>
        );
    }
}
