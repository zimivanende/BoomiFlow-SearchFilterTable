import { FlowDisplayColumn, FlowOutcome } from 'flow-component-model';
import React from 'react';
import SearchFilterTable from './SearchFilterTable';

export default class SearchFilterTableRibbonSearch extends React.Component<any, any> {

    searchInput: HTMLInputElement;
    previousFilter: string = '';

    constructor(props: any) {
        super(props);
        this.clearSearch = this.clearSearch.bind(this);
        this.showSearch = this.showSearch.bind(this);
        this.filterKeyDown = this.filterKeyDown.bind(this);
        this.filterChanged = this.filterChanged.bind(this);
    }

    componentDidMount() {
        this.forceUpdate();
    }

    clearSearch(e: any) {
        this.searchInput.value = '';
        this.filterChanged();
    }

    filterChanged() {
        const newFilter: string = this.searchInput.value;
        if (newFilter !== this.previousFilter) {
            this.previousFilter = newFilter;
            const root: SearchFilterTable = this.props.root;
            root.globalFilterChanged(newFilter);
        }
    }

    filterKeyDown(e: any) {
        // e.preventDefault();

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                this.filterChanged();
                return false;
                break;

            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                this.searchInput.value = this.previousFilter;
                return false;
                break;

            case 'Tab':
                this.filterChanged();
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

    render() {

        const root: SearchFilterTable = this.props.root;

        const leftButtons: any[] = [];
        const rightButtons: any[] = [];

        const lastOrder: number = 0;
        const addedExpand: boolean = false;
        const addedContract: boolean = false;

        const canExport: boolean = (root.getAttribute('canExport', 'true').toLowerCase() === 'true');

        // ad export if allowed
        if (canExport === true) {
            rightButtons.push(
                <div
                    className="sft-ribbon-search-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.rowMap); }}
                >
                    <span
                        key={'exportAll'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-search-button-icon'}
                        title={'Export All'}

                    />
                </div>,
            );
        }

        if (root.rowMap.size > root.currentRowMap.size && canExport === true) {
            rightButtons.push(
                <div
                    className="sft-ribbon-search-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.currentRowMap); }}
                >
                    <span
                        key={'exportShown'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-search-button-icon'}
                        title={'Export Shown'}

                    />
                </div>,
            );
        }

        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];

            if (outcome.isBulkAction && outcome.developerName !== 'OnSelect' && outcome.developerName !== 'OnChange' && !outcome.developerName.toLowerCase().startsWith('cm')) {
                if (outcome.attributes['RequiresSelected']?.value === 'true') {
                    if (root.selectedRowMap.size > 0) {
                        leftButtons.push(
                            <div
                                className={'sft-ribbon-search-button-wrapper' + (outcome.attributes?.classes ? ' ' + outcome.attributes.classes.value : '')}
                                onClick={(e: any) => {root.doOutcome(key, undefined); }}
                            >
                                {outcome.attributes?.icon ?
                                    <span
                                        key={key}
                                        className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' sft-ribbon-search-button-icon'}
                                        title={outcome.label || key}

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
                } else {
                    rightButtons.push(
                        <div
                            className={'sft-ribbon-search-button-wrapper' + (outcome.attributes?.classes ? ' ' + outcome.attributes.classes.value : '')}
                            onClick={(e: any) => {root.doOutcome(key, undefined); }}
                        >
                            {outcome.attributes?.icon ?
                                <span
                                    key={key}
                                    className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' sft-ribbon-search-button-icon'}
                                    title={outcome.label || key}

                                /> :
                                null
                            }
                            {!outcome.attributes?.display || outcome.attributes.display.value.indexOf('text') >= 0 ?
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
        });

        // if (root.selectedRowMap.size > 0 && canExport === true) {
        leftButtons.push(
                <div
                    className="sft-ribbon-search-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.selectedRowMap); }}
                >
                    <span
                        key={'exportSelected'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-search-button-icon'}
                        title={'Export Selected'}

                    />
                </div>,
            );
        // }

        return (
            <div
                className="sft-ribbon-search"
            >
                <div
                    className="sft-ribbon-search-left-wrapper"
                >
                    <div
                        className="sft-ribbon-search-wrapper"
                    >
                        <span
                            className="glyphicon glyphicon-search sft-ribbon-search-icon"
                            onClick={this.filterChanged}
                        />
                        <input
                            className="sft-ribbon-search-input"
                            ref={(element: HTMLInputElement) => {this.searchInput = element; }}
                            onKeyDown={this.filterKeyDown}
                            onKeyUp={(e: any) => {e.stopPropagation(); e.preventDefault(); }}
                        />
                        <span
                            className="glyphicon glyphicon-remove sft-ribbon-search-icon"
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
                            className={'glyphicon glyphicon-menu-hamburger sft-ribbon-search-button-icon'}
                            title={'Advanced Search'}
                        />
                    </div>

                </div>
                <div
                    className="sft-ribbon-search-right-wrapper"
                >
                    <div
                        className="sft-ribbon-search-buttons-wrapper"
                    >
                        {leftButtons}
                        {rightButtons}
                    </div>
                </div>
            </div>
        );
    }
}
