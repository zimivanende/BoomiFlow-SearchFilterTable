import { FlowDisplayColumn, FlowOutcome } from 'flow-component-model';
import React, { CSSProperties } from 'react';
import CommonFunctions from './CommonFunctions';
import SearchFilterTable from './SearchFilterTable';

export default class SearchFilterTableRibbonSearch extends React.Component<any, any> {

    searchInput: HTMLInputElement;
    previousFilter: string = '';
    currentFilter: string;
    leftButtons: any[];
    rightButtons: any[];
    clearFiltersButton: any;
    deBounce: boolean = false;

    constructor(props: any) {
        super(props);
        this.generateButtons = this.generateButtons.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.showSearch = this.showSearch.bind(this);
        this.clearFilters = this.clearFilters.bind(this);
        this.filterKeyDown = this.filterKeyDown.bind(this);
        this.filterChanged = this.filterChanged.bind(this);
        this.filterCommitted = this.filterCommitted.bind(this);
        const root: SearchFilterTable = this.props.root;
        this.currentFilter = root.filters.globalCriteria;
    }

    async componentDidMount() {
        await this.generateButtons();
    }

    async generateButtons(): Promise<Boolean> {
        if(this.deBounce === true) {
            return false;
        }
        else {
            this.deBounce = true;
        }
        const root: SearchFilterTable = this.props.root;
        this.leftButtons = [];
        this.rightButtons = [];
        const canExport: boolean = (root.getAttribute('canExport', 'true').toLowerCase() === 'true');

        // ad export if allowed
        if (canExport === true) {
            this.rightButtons.push(
                <div
                    className="sft-ribbon-search-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.rowMap); }}
                >
                    <span
                        key={'exportAll'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-search-button-icon'}
                        title={'Export All'}

                    />
                    {!root.attributes?.RibbonDisplay || root.attributes.RibbonDisplay?.value.indexOf('text') >= 0 ?
                        <span
                            className="sft-ribbon-search-button-label"
                        >
                            {'Export All'}
                        </span> :
                        null
                    }
                </div>,
            );
        }

        if (root.rowMap.size > root.currentRowMap.size && canExport === true) {
            this.rightButtons.push(
                <div
                    className="sft-ribbon-search-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.currentRowMap); }}
                >
                    <span
                        key={'exportShown'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-search-button-icon'}
                        title={'Export Shown'}
                    />
                    {!root.attributes?.RibbonDisplay || root.attributes.RibbonDisplay?.value.indexOf('text') >= 0 ?
                        <span
                            className="sft-ribbon-search-button-label"
                        >
                            {'Export Shown'}
                        </span> :
                        null
                    }
                </div>,
            );
        }

        const arrOutcomes: FlowOutcome[] = Array.from(Object.values(root.outcomes));

        for (let pos = 0 ; pos < arrOutcomes.length ; pos++) {

            const outcome: FlowOutcome = arrOutcomes[pos];

            if (outcome.isBulkAction && outcome.developerName !== 'OnSelect' && outcome.developerName !== 'OnChange' && !outcome.developerName.toLowerCase().startsWith('cm')) {

                const showOutcome: boolean = await CommonFunctions.assessGlobalOutcomeRule(outcome, root);

                if (showOutcome === true) {
                    this.rightButtons.push(
                        <div
                            className={'sft-ribbon-search-button-wrapper ' + (outcome.attributes?.classes?.value)}
                            onClick={(e: any) => {root.doOutcome(outcome.developerName, undefined); }}
                        >
                            {outcome.attributes?.icon ?
                                <span
                                    key={outcome.developerName}
                                    className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' sft-ribbon-search-button-icon'}
                                    title={outcome.label || outcome.developerName}

                                /> :
                                null
                            }
                            {!outcome.attributes?.display || outcome.attributes.display?.value.indexOf('text') >= 0 ?
                                <span
                                    className="sft-ribbon-search-button-label"
                                >
                                    {outcome.label}
                                </span> :
                                null
                            }
                        </div>,
                    );
                }
            }
        }

        if (root.model.content?.length > 0) {
            this.rightButtons.push(
                <div
                    className="sft-ribbon-search-button-wrapper"
                    onClick={(e: any) => {root.showInfo(); }}
                >

                    <span
                        key={'colpick'}
                        className={'glyphicon sft-ribbon-search-button-icon glyphicon-' + (root.attributes?.InfoIcon ? root.attributes.InfoIcon.value : 'question-sign')}
                        title={'Infornation'}
                    />
                    {!root.attributes?.RibbonDisplay || root.attributes.RibbonDisplay?.value.indexOf('text') >= 0 ?
                        <span
                            className="sft-ribbon-search-button-label"
                        >
                            {'Column Picker'}
                        </span> :
                        null
                    }
                </div>,
            );
        }

        if (root.dynamicColumns === true) {
            this.rightButtons.push(
                <div
                    className="sft-ribbon-search-button-wrapper"
                    onClick={(e: any) => {root.showColumnPicker(); }}
                >

                    <span
                        key={'colpick'}
                        className={'glyphicon sft-ribbon-search-button-icon glyphicon-' + (root.attributes?.ColumnsIcon ? root.attributes.ColumnsIcon.value : 'option-vertical')}
                        title={'Select columns'}
                    />
                    {!root.attributes?.RibbonDisplay || root.attributes.RibbonDisplay?.value.indexOf('text') >= 0 ?
                        <span
                            className="sft-ribbon-search-button-label"
                        >
                            {'Column Picker'}
                        </span> :
                        null
                    }
                </div>,
            );
        }

        if (root.selectedRowMap.size > 0 && canExport === true) {
            this.leftButtons.push(
                <div
                    className="sft-ribbon-search-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.selectedRowMap); }}
                >
                    <span
                        key={'exportSelected'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-search-button-icon'}
                        title={'Export Selected'}
                    />
                    {!root.attributes?.RibbonDisplay || root.attributes.RibbonDisplay?.value.indexOf('text') >= 0 ?
                        <span
                            className="sft-ribbon-search-button-label"
                        >
                            {'Export Selected'}
                        </span> :
                        null
                    }
                </div>,
            );
        }

        if (root.filters.isFiltered()) {
            this.clearFiltersButton = (
                <div
                    className="sft-ribbon-search-button-wrapper sft-ribbon-search-button-clear"
                    onClick={this.clearFilters}
                >
                    <span
                        key={'clearFilters'}
                        className={'glyphicon glyphicon-trash sft-ribbon-search-button-icon sft-ribbon-search-button-icon-clear'}
                        title={'Clear Filters'}
                    />
                </div>
            );
        }
        else {
            this.clearFiltersButton = undefined;
        }
        this.deBounce = false;
        this.forceUpdate();
        return true;
    }

    clearSearch(e: any) {
        this.currentFilter = '';
        this.filterCommitted();
    }

    filterChanged() {
        this.currentFilter = this.searchInput.value;
        this.forceUpdate();
    }

    filterCommitted() {
        if (this.currentFilter !== this.previousFilter) {
            this.previousFilter = this.currentFilter;
            const root: SearchFilterTable = this.props.root;
            root.globalFilterChanged(this.currentFilter);
        }
    }

    filterKeyDown(e: any) {
        // e.preventDefault();

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                this.filterCommitted();
                return false;
                break;

            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                this.searchInput.value = this.previousFilter;
                return false;
                break;

            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                this.searchInput.value = '';
                return false;
                break;

            case 'Tab':
                this.filterCommitted();
                return false;
                break;

            default:
                break;
        }
    }

    showSearch(e: any) {
        const root: SearchFilterTable = this.props.root;
        root.manageFilters();
    }

    async clearFilters(e: any) {
        const root: SearchFilterTable = this.props.root;
        root.filters.clearAll();
        await root.buildRibbon();
    }

    render() {

        const root: SearchFilterTable = this.props.root;

        const style: CSSProperties = {};
        if (root.titleElement) {
            style.top = '2.5rem';
        }

        return (
            <div
                className="sft-ribbon-search"
                style={style}
            >
                <div
                    className="sft-ribbon-search-left-wrapper"
                >
                    <div
                        className="sft-ribbon-search-wrapper"
                    >
                        <span
                            className="glyphicon glyphicon-search sft-ribbon-search-icon sft-ribbon-search-icon-search"
                            onClick={this.filterCommitted}
                        />
                        <input
                            className="sft-ribbon-search-input"
                            ref={(element: HTMLInputElement) => {this.searchInput = element; }}
                            onKeyDown={this.filterKeyDown}
                            onKeyUp={(e: any) => {e.stopPropagation(); e.preventDefault(); }}
                            onChange={this.filterChanged}
                            value={this.currentFilter}
                        />
                        <span
                            className="glyphicon glyphicon-remove sft-ribbon-search-icon sft-ribbon-search-icon-clear"
                            role="button"
                            onClick={this.clearSearch}
                        />
                    </div>
                    <div
                        className="sft-ribbon-search-button-wrapper"
                        onClick={this.showSearch}
                    >
                        <span
                            key={'showSearch'}
                            className={'glyphicon glyphicon-filter sft-ribbon-search-button-icon sft-ribbon-search-icon-advanced'}
                            title={'Advanced Search'}
                        />
                    </div>
                    {this.clearFiltersButton}
                </div>
                <div
                    className="sft-ribbon-search-right-wrapper"
                >
                    <div
                        className="sft-ribbon-search-buttons-wrapper"
                    >
                        {this.leftButtons}
                        {this.rightButtons}
                    </div>
                </div>
            </div>
        );
    }
}
