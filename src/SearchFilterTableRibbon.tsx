import { FlowDisplayColumn, FlowOutcome } from 'flow-component-model';
import React from 'react';
import CommonFunctions from './CommonFunctions';
import SearchFilterTable from './SearchFilterTable';

export default class SearchFilterTableRibbon extends React.Component<any, any> {

    componentDidMount() {
        this.forceUpdate();
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
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.rowMap); }}
                >
                    {!root.attributes?.RibbonDisplay || root.attributes?.RibbonDisplay?.value.indexOf('icon') >= 0 ?
                    <span
                        key={'exportAll'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-button-icon'}
                        title={'Export All'}

                    /> :
                    null
                    }
                    {!root.attributes?.RibbonDisplay || root.attributes?.RibbonDisplay?.value.indexOf('text') >= 0 ?
                        <span
                        className="sft-ribbon-button-label"
                    >
                        {'Export All'}
                    </span> :
                        null
                    }
                </div>,
            );
        }

        if (root.rowMap.size > root.currentRowMap.size && canExport === true) {
            rightButtons.push(
                <div
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.currentRowMap); }}
                >
                    {!root.attributes?.RibbonDisplay || root.attributes?.RibbonDisplay?.value.indexOf('icon') >= 0 ?
                    <span
                        key={'exportShown'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-button-icon'}
                        title={'Export Shown'}

                    /> :
                    null
                    }
                    {!root.attributes?.RibbonDisplay || root.attributes?.RibbonDisplay?.value.indexOf('text') >= 0 ?
                        <span
                            className="sft-ribbon-button-label"
                        >
                            {'Export Shown'}
                        </span> :
                        null
                    }
                </div>,
            );
        }

        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];

            if (outcome.isBulkAction && outcome.developerName !== 'OnSelect' && outcome.developerName !== 'OnChange' && !outcome.developerName.toLowerCase().startsWith('cm')) {

                const showOutcome: boolean = CommonFunctions.assessGlobalOutcomeRule(outcome, root);

                if (showOutcome === true) {
                    rightButtons.push(
                        <div
                            className="sft-ribbon-button-wrapper"
                            onClick={(e: any) => {root.doOutcome(key, undefined); }}
                        >
                            {outcome.attributes?.icon ?
                                <span
                                    key={key}
                                    className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' sft-ribbon-button-icon'}
                                    title={outcome.label || key}

                                /> :
                                null
                            }
                            {!outcome.attributes?.display || outcome.attributes.display?.value.indexOf('text') >= 0 ?
                                <span
                                    className="sft-ribbon-button-label"
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

        if (root.model.content?.length > 0) {
            rightButtons.push(
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
            rightButtons.push(
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
        leftButtons.push(
                <div
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.selectedRowMap); }}
                >
                    {!root.attributes?.RibbonDisplay || root.attributes?.RibbonDisplay?.value.indexOf('icon') >= 0 ?
                        <span
                            key={'exportSelected'}
                            className={'glyphicon glyphicon-floppy-save sft-ribbon-button-icon'}
                            title={'Export Selected'}

                        /> :
                        null
                    }
                    {!root.attributes?.RibbonDisplay || root.attributes?.RibbonDisplay?.value.indexOf('text') >= 0 ?
                        <span
                            className="sft-ribbon-button-label"
                        >
                            {'Export Selected'}
                        </span> :
                        null
                    }
                </div>,
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
                            {'Available actions:'}
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
                        />

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
