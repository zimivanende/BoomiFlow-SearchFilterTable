import { FlowDisplayColumn, FlowOutcome } from 'flow-component-model';
import * as React from 'react';
import {CommonFunctions} from './CommonFunctions';
import {SFT} from './SearchFilterTable';

export class SearchFilterTableRibbon extends React.Component<any, any> {

    leftButtons: any[];
    rightButtons: any[];

    constructor(props: any) {
        super(props);
        this.generateButtons = this.generateButtons.bind(this);
    }

    async componentDidMount() {
        await this.generateButtons();
    }

    async generateButtons() : Promise<boolean>{
        this.leftButtons = [];
        this.rightButtons = [];

        const root: SFT = this.props.root;
        const canExport: boolean = (root.parent.getAttribute('canExport', 'false').toLowerCase() === 'true');

        // ad export if allowed
        if (canExport === true) {
            this.rightButtons.push(
                <div
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.rowMap); }}
                >
                    {!root.parent.attributes?.RibbonDisplay || root.parent.attributes?.RibbonDisplay?.value.indexOf('icon') >= 0 ?
                    <span
                        key={'exportAll'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-button-icon'}
                        title={'Export All'}

                    /> :
                    null
                    }
                    {!root.parent.attributes?.RibbonDisplay || root.parent.attributes?.RibbonDisplay?.value.indexOf('text') >= 0 ?
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
            this.rightButtons.push(
                <div
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.currentRowMap); }}
                >
                    {!root.parent.attributes?.RibbonDisplay || root.parent.attributes?.RibbonDisplay?.value.indexOf('icon') >= 0 ?
                    <span
                        key={'exportShown'}
                        className={'glyphicon glyphicon-floppy-save sft-ribbon-button-icon'}
                        title={'Export Shown'}

                    /> :
                    null
                    }
                    {!root.parent.attributes?.RibbonDisplay || root.parent.attributes?.RibbonDisplay?.value.indexOf('text') >= 0 ?
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

        const arrOutcomes: FlowOutcome[] = Array.from(Object.values(root.parent.outcomes));

        for (let pos = 0 ; pos < arrOutcomes.length ; pos++) {
            const outcome: FlowOutcome = arrOutcomes[pos];

            if (outcome.isBulkAction && outcome.developerName !== 'OnSelect' && outcome.developerName !== 'OnChange' && !outcome.developerName.toLowerCase().startsWith('cm')) {

                const showOutcome: boolean = await CommonFunctions.assessGlobalOutcomeRule(outcome, root);

                if (showOutcome === true) {
                    this.rightButtons.push(
                        <div
                            className="sft-ribbon-button-wrapper"
                            onClick={(e: any) => {root.doOutcome(outcome.developerName, undefined); }}
                        >
                            {outcome.attributes?.icon ?
                                <span
                                    key={outcome.developerName}
                                    className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' sft-ribbon-button-icon'}
                                    title={outcome.label || outcome.developerName}

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
        }

        if (root.parent.model.content?.length > 0) {
            this.rightButtons.push(
                <div
                    className="sft-ribbon-search-button-wrapper"
                    onClick={(e: any) => {root.showInfo(); }}
                >

                    <span
                        key={'colpick'}
                        className={'glyphicon sft-ribbon-search-button-icon glyphicon-' + (root.parent.attributes?.InfoIcon ? root.parent.attributes.InfoIcon.value : 'question-sign')}
                        title={'Infornation'}
                    />
                    {!root.parent.attributes?.RibbonDisplay || root.parent.attributes.RibbonDisplay?.value.indexOf('text') >= 0 ?
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
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {root.showColumnPicker(); }}
                >

                    <span
                        key={'colpick'}
                        className={'glyphicon sft-ribbon-button-icon glyphicon-' + (root.parent.attributes?.ColumnsIcon ? root.parent.attributes.ColumnsIcon.value : 'option-vertical')}
                        title={'Select columns'}
                    />
                    {!root.parent.attributes?.RibbonDisplay || root.parent.attributes.RibbonDisplay?.value.indexOf('text') >= 0 ?
                        <span
                            className="sft-ribbon-button-label"
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
                    className="sft-ribbon-button-wrapper"
                    onClick={(e: any) => {e.stopPropagation(); root.doExport(root.selectedRowMap); }}
                >
                    {!root.parent.attributes?.RibbonDisplay || root.parent.attributes?.RibbonDisplay?.value.indexOf('icon') >= 0 ?
                        <span
                            key={'exportSelected'}
                            className={'glyphicon glyphicon-floppy-save sft-ribbon-button-icon'}
                            title={'Export Selected'}

                        /> :
                        null
                    }
                    {!root.parent.attributes?.RibbonDisplay || root.parent.attributes?.RibbonDisplay?.value.indexOf('text') >= 0 ?
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
        this.forceUpdate();
        return true;
    }

    render() {

        const root: SFT = this.props.root;

        const style: React.CSSProperties = {};
        if (root.titleElement) {
            style.top = '2.5rem';
        }

        return (
            <div
                className="sft-ribbon"
                style={style}
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
                        {this.leftButtons}
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
                        {this.rightButtons}
                    </div>
                </div>
            </div>
        );
    }
}
