import React, { CSSProperties } from 'react';

import { eContentType, eLoadingState, FlowComponent, FlowContextMenu, FlowDisplayColumn, FlowField,  FlowMessageBox, FlowObjectData, FlowObjectDataArray, FlowObjectDataProperty, FlowOutcome, modalDialogButton } from 'flow-component-model';
import CellItem from './CellItem';
import ColumnCriteria from './ColumnCriteria';
import ColumnFilters, { eFilterEvent, eSortDirection } from './ColumnFilters';
import ColumnPickerForm from './ColumnPickerForm';
import { ColumnRule, ColumnRules } from './ColumnRule';
import FilterManagementForm from './FilterManagementForm';
import ModelExporter from './ModelExporter';
import MultiSelect from './MultiSelect';
import RowItem from './RowItem';
import './SearchFilterTable.css';
import SearchFilterTableFooter from './SearchFilterTableFooter';
import SearchFilterTableHeader from './SearchFilterTableHeader';
import SearchFilterTableHeaderButtons from './SearchFilterTableHeaderButtons';
import SearchFilterTableHeaders from './SearchFilterTableHeaders';
import SearchFilterTableRibbon from './SearchFilterTableRibbon';
import SearchFilterTableRibbonSearch from './SearchFilterTableRibbonSearch';
import SearchFilterTableRow from './SearchFilterTableRow';

// declare const manywho: IManywho;
declare const manywho: any;

export default class SearchFilterTable extends FlowComponent {
    version: string = '1.0.0';
    context: any;

    contextMenu: FlowContextMenu;
    messageBox: FlowMessageBox;
    form: any;  // this is the form being shown by the message box

    // this contains the master copy of the model data, it doesn't change unless data reloaded
    rowMap: Map<string, any> = new Map();

    // this contains the display time subset of rowMap which is filtered & sorted, it changes with each query etc,  Used to build the actual rows
    currentRowMap: Map<string, any> = new Map();
    // currentRowMap: Array<string> = [];//Map<string,any> = new Map();

    // this holds the max items per page
    maxPageRows: number = 5;

    // this holds the items in pages
    currentRowPages: Array<Map<string, any>> = [];

    // this holds the current pagination page number
    currentRowPage: number = 0;

    // this contains the display time subset of currentRowMap which is selected, each query removes any items no longer in results
    selectedRowMap: Map<string, any> = new Map();

    // these are the child row React objects, they are re-populated with each filter, search etc
    rows: Map<string, SearchFilterTableRow> = new Map();

    // these are the html child elements used in render.  Built from currentRowMap
    rowElements: any[];

    // this is the column definition map, it doesn't change unless data reloaded
    colMap: Map<string, FlowDisplayColumn> = new Map();

    // this is the column value map, it conatins all possible values for each column, it doesn't change unless data reloaded
    colValMap: Map<string, Map<any, any>> = new Map();

    // this is the column value map, it conatins all possible values for each column, it doesn't change unless data reloaded
    userColumns: string[] = [];

    // this is the table headers React component
    headers: SearchFilterTableHeaders;

    // The title bar
    titleElement: any;

    // this is the table headers html element
    headersElement: any;

    // this is the footer React component
    ribbon: SearchFilterTableRibbon | SearchFilterTableRibbonSearch;

    // this is the ribbon html element
    ribbonElement: any;

    // this is the footer React component
    footer: SearchFilterTableFooter;

    // this is the footer html element
    footerElement: any;

    // these are the child column React objects, it doesn't change unless data reloaded
    cols: Map<string, any> = new Map();

    // these are the html column header child elements used in render.  Built from colMap
    colElements: any[];

    // content holder to avoid blank pages during moves
    lastContent: any = (<div/>);

    // these are the filter & sort controllers
    filters: ColumnFilters = new ColumnFilters(this);

    // the scrolling element
    scroller: HTMLDivElement;

    // dynamic columns flag
    dynamicColumns: boolean = false;

    // max col text size before converting to button
    maxColText: number = -1;

    // column formatting rules map - allows us to specify special actions on clicking a cell
    columnRules: Map<string, ColumnRule> = new Map();
    manywho: any;

    retries: number = 0;

    loaded: Boolean = false;

    supressedOutcomes: Map<string,boolean> = new Map();;

    constructor(props: any) {
        super(props);
        this.handleMessage = this.handleMessage.bind(this);
        this.flowMoved = this.flowMoved.bind(this);
        this.showContextMenu = this.showContextMenu.bind(this);
        this.hideContextMenu = this.hideContextMenu.bind(this);

        this.buildCoreTable = this.buildCoreTable.bind(this);
        this.buildRibbon = this.buildRibbon.bind(this);
        this.buildFooter = this.buildFooter.bind(this);

        this.filtersChanged = this.filtersChanged.bind(this);
        this.globalFilterChanged = this.globalFilterChanged.bind(this);
        this.manageFilters = this.manageFilters.bind(this);
        this.applyFilters = this.applyFilters.bind(this);
        this.cancelFilters = this.cancelFilters.bind(this);

        this.toggleSelect = this.toggleSelect.bind(this);
        this.toggleSelectAll = this.toggleSelectAll.bind(this);

        this.firstPage = this.firstPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.lastPage = this.lastPage.bind(this);

        this.maxPerPageChanged = this.maxPerPageChanged.bind(this);

        this.doExport = this.doExport.bind(this);

        this.playAudio = this.playAudio.bind(this);
        this.playVideo = this.playVideo.bind(this);

        this.showColumnPicker = this.showColumnPicker.bind(this);
        this.applyColumns = this.applyColumns.bind(this);
        this.cancelColumns = this.cancelColumns.bind(this);
        this.columnsReordered = this.columnsReordered.bind(this);

        this.cancelOutcomeForm = this.cancelOutcomeForm.bind(this);
        this.okOutcomeForm = this.okOutcomeForm.bind(this);

        this.maxPageRows = parseInt(localStorage.getItem('sft-max-' + this.componentId) || this.getAttribute('PaginationSize', undefined) || '10');
        localStorage.setItem('sft-max-' + this.componentId, this.maxPageRows.toString());

        this.columnRules = ColumnRules.parse(this.getAttribute('ColumnRules', '{}'), this);
    }

    showInfo() {
        const content = (
            <div
                dangerouslySetInnerHTML={{__html: this.model.content}}
            />
        );
        this.messageBox.showMessageBox('Information', content, [new modalDialogButton('Close', this.messageBox.hideMessageBox)]);
    }

    showColumnPicker() {
        const content = (
            <ColumnPickerForm
                root={this}
                ref={(element: ColumnPickerForm) => {this.form = element; }}
            />
        );
        this.messageBox.showMessageBox('Select Columns', content, [new modalDialogButton('Apply', this.applyColumns), new modalDialogButton('Cancel', this.cancelColumns)]);
    }

    cancelColumns() {
        this.messageBox.hideMessageBox();
        this.form = undefined;
    }

    async applyColumns() {
        this.userColumns = this.form.selectedColumns;
        this.saveUserColumns();
        this.messageBox.hideMessageBox();
        this.form = undefined;
        this.headers.forceUpdate();
        this.rows.forEach((row: SearchFilterTableRow) => {
            row.forceUpdate();
        });
        // this.forceUpdate();

    }

    async columnsReordered() {
        this.saveUserColumns();
        this.headers.forceUpdate();
        this.rows.forEach((row: SearchFilterTableRow) => {
            row.forceUpdate();
        });
        // this.forceUpdate();
    }

    getColumnUniques(name: string, criteria: ColumnCriteria): any {
        return (
           <MultiSelect
                id={name}
                allItems={this.colValMap.get(name)}
                selectedItems={criteria}
           />
        );
    }

    filtersChanged(key: string, event: eFilterEvent) {
        // get the column header for key column if exists
        let offset: any;
        let sortKey: String;
        // if (key) {
        //    const col: HTMLElement = this.headers.headers.get(key);
        //    offset = col.offsetLeft;
        // }

        this.headers?.forceUpdate();
        localStorage.setItem('sft-filters-' + this.componentId, this.filters.getForStorage());
        // this.buildRibbon();
        switch (event) {
            case eFilterEvent.sort:
                if (this.filters.get(key).sort !== eSortDirection.none) {
                    const col: SearchFilterTableHeader = this.headers.headers.get(key);
                    // offset = col.offsetLeft;
                    // sortKey = key;
                }

                break;

            case eFilterEvent.filter:
                this.filterRows();
                break;
        }
        this.sortRows();
        this.paginateRows();
        this.buildTableRows();
        this.forceUpdate(() => {
            if (offset && sortKey && sortKey === key) {
                // const col: HTMLElement = this.headers.headers.get(key);
                // offset = col.offsetLeft;
                // this.scroller.scrollLeft =  offset;
            }
        });

    }

    globalFilterChanged(value: string) {
        // do some other search
        this.filters.globalCriteria = value;
        this.filtersChanged('', eFilterEvent.filter);
    }

    manageFilters() {

        const content = (
            <FilterManagementForm
                parent={this}
                ref={(form: FilterManagementForm) => {this.form = form; }}
            />
        );
        this.messageBox.showMessageBox('Manage Filters', content, [new modalDialogButton('Apply', this.applyFilters), new modalDialogButton('Cancel', this.cancelFilters)]);
    }

    cancelFilters() {
        this.form = undefined;
        this.messageBox.hideMessageBox();
    }

    applyFilters() {
        this.filters = this.form.newFilters;
        this.form = undefined;
        this.messageBox.hideMessageBox();
        this.filtersChanged('', eFilterEvent.filter);
    }

    maxPerPageChanged(max: number) {
        this.maxPageRows = max || 10;
        localStorage.setItem('sft-max-' + this.componentId, this.maxPageRows.toString());
        this.paginateRows();
        this.buildTableRows();
        this.forceUpdate();
    }

    // stores / deletes a ref to a table row as it's created or destroyed
    setRow(key: string, element: SearchFilterTableRow) {
        if (element) {
            this.rows.set(key, element);
        } else {
            if (this.rows.has(key)) {
                this.rows.delete(key);
            }
        }
    }

    // stores / deletes a ref to the column headers
    setRibbon(element: SearchFilterTableRibbon | SearchFilterTableRibbonSearch) {
        this.ribbon = element;
    }

    // stores / deletes a ref to the column headers
    setHeaders(element: SearchFilterTableHeaders) {
        this.headers = element;
    }

    // stores / deletes a ref to the footer component
    setFooter(element: SearchFilterTableFooter) {
        this.footer = element;
    }
    async flowMoved(xhr: any, request: any) {
        const me: any = this;
        if (xhr.invokeType === 'FORWARD') {
            if (this.loadingState !== eLoadingState.ready && this.retries < 3) {
                this.loaded=false;
                this.retries ++;
                window.setTimeout(function() {me.flowMoved(xhr, request); }, 500);
            } else {
                this.retries = 0;
                await this.preLoad();
                this.loaded = true;
                this.maxPageRows = parseInt(localStorage.getItem('sft-max-' + this.componentId) || this.getAttribute('PaginationSize', undefined) || '10');
                this.filters.loadFromStorage(localStorage.getItem('sft-filters-' + this.componentId));
                await this.buildCoreTable();
                //this.filterRows();
                //this.sortRows();
                //this.buildTableRows();
                //this.forceUpdate();
            }
        }

    }

    async componentDidMount() {
        // will get this from a component attribute
        this.loaded=false;
        await super.componentDidMount();
        (manywho as any).eventManager.addDoneListener(this.flowMoved, this.componentId);
        // build tree
        this.maxPageRows = parseInt(localStorage.getItem('sft-max-' + this.componentId || this.getAttribute('PaginationSize', undefined) || '10'));
        this.filters.loadFromStorage(localStorage.getItem('sft-filters-' + this.componentId));

        // calculate if we are in dynamic column mode
        if (this.attributes.UserColumnsValue) {
            this.dynamicColumns = true;
        } // it will have defaulted to false

        if (this.attributes.MaxColumnTextLength) {
            this.maxColText = parseInt(this.attributes.MaxColumnTextLength.value);
        } // it defaults to -1 which means dont apply this

        await this.preLoad();
        this.loaded = true;

        await this.buildCoreTable();
        //this.filterRows();
        //this.sortRows();
        //this.buildTableRows();
        //this.forceUpdate();

    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }

    async loadUserColumns() {
        let userFieldsVal: string = '';

        if (this.attributes.UserColumnsValue.value !== 'LOCAL_STORAGE') {
            const userFields: FlowField = await this.loadValue(this.attributes.UserColumnsValue.value);
            if (userFields && (userFields.value as string).length > 0) {
                userFieldsVal = userFields.value as string;

            }
        } else {
            userFieldsVal = localStorage.getItem('sft_' + this.componentId + '_cols') || '';
        }
        let cols: string[] = [];
        if (userFieldsVal && userFieldsVal.length > 0) {
            cols = userFieldsVal.split(',');
        }
        this.userColumns = [];
        cols.forEach((col: string) => {
            this.userColumns.push(col.trim());
        });
    }

    async saveUserColumns() {
        let userCols = '';
        this.userColumns.forEach((col: string) => {
            if (userCols.length > 0) {
                userCols += ',';
            }
            if (col) {
                userCols += col.trim();
            } else {
                console.log('One of the columns in the table had a null name.  Check the table display columns settings in Flow');
            }
        });

        if (this.attributes.UserColumnsValue.value !== 'LOCAL_STORAGE') {
            const userFields: FlowField = await this.loadValue(this.attributes.UserColumnsValue.value);
            userFields.value = userCols;
            await this.updateValues(userFields);
        } else {
            localStorage.setItem('sft_' + this.componentId + '_cols', userCols);
        }
    }

    async preLoad() : Promise<any> {
        //preload any column rule values
        let alreadyDone: string[] = [];
        let outcomes: FlowOutcome[] = Array.from(Object.values(this.outcomes));
        for(let pos = 1 ; pos < outcomes.length ; pos++) {
            let outcome: FlowOutcome = outcomes[pos];
            if (outcome.attributes.rule && outcome.attributes.rule.value.length > 0) {
                try {
                    const rule = JSON.parse(outcome.attributes.rule.value);
                    // since this is a global then the value of the rule.field must be a flow field or the property of one
                    // split the rule.field on the separator
                    let match: any;
                    let fld: string = rule.field;
                    while (match = RegExp(/{{([^}]*)}}/).exec(fld)) {
                        switch (match[1]) {
                            case 'TENANT_ID':
                                break;
    
                            default:
                                const fldElements: string[] = match[1].split('->');
                                // element[0] is the flow field name
                                let val: FlowField;
                                if (alreadyDone.indexOf(fldElements[0]) < 0) {
                                    val = await this.loadValue(fldElements[0]);
                                    alreadyDone.push(fldElements[0]);
                                }
                                break;
                        }
                        fld = fld.replace(match[0], "done");
                    }
                }
                catch (e) {
                    console.log('The rule on outcome ' + outcome.developerName + ' is invalid');
                }
            }
        }
        //now parse all columnRules
        if (this.getAttribute("ColumnRules","").length > 0) {
            let rules: any[] = JSON.parse(this.getAttribute("ColumnRules"));
            let rulesArray: any[] = Array.from(Object.keys(rules));
            if(rulesArray && rulesArray.length > 0) {
                for(let rPos = 0 ; rPos < rulesArray.length ; rPos++) {
                    if(rules[rulesArray[rPos]].mode?.toLowerCase() === "outcome") {
                        this.supressedOutcomes.set(rules[rulesArray[rPos]].outcomeName,true);
                    }
                }
            }
        }
        return true;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////
    // reads the model
    // constructs the a flat a map of rows ready for searching, sorting and direct access
    // also builds the display column map
    ///////////////////////////////////////////////////////////////////////////////////////////
    async buildCoreTable() {
        // await this.loadSelected();
        this.rowMap = new Map();
        this.rows = new Map();

        // sort display cols on order
        this.colMap = new Map();
        // use the cols from the displayColumns if defined
        let cols: FlowDisplayColumn[];
        if (this.model.displayColumns && this.model.displayColumns.length > 0) {
            cols = this.model.displayColumns?.sort((a: any, b: any) => {
                switch (true) {
                    case a.DisplayOrder > b.DisplayOrder:
                        return 1;
                    case a.DisplayOrder === b.DisplayOrder:
                        return 0;
                    default:
                        return -1;
                }
            });
        } else {
            // use whole model
            // this.model.dataSource
        }

        if (this.dynamicColumns === true) {
            await this.loadUserColumns();
        }

        const populateDefaults: boolean = this.dynamicColumns === false || (this.dynamicColumns === true && (this.userColumns.length === 0 || (this.userColumns.length === 1 && this.userColumns.indexOf('#BUTTONS#') >= 0)));

        if (populateDefaults) {
            this.userColumns = [];
        }

        cols.forEach((col: FlowDisplayColumn) => {
            this.colMap.set(col.developerName, col);
            this.colValMap.set(col.developerName, new Map());
            if (populateDefaults) {
                this.userColumns.push(col.developerName);
            }
        });

        // now allow for button re-location if not already defined
        if (this.userColumns.indexOf('#BUTTONS#') < 0) {
            let outcomesPos: number = 0;
            switch (this.getAttribute('OutcomesPosition', '0').toLowerCase()) {
                case 'first':
                case 'start':
                case '0':
                    outcomesPos = 0;
                    break;
                case 'last':
                case 'end':
                    outcomesPos = this.userColumns.length;
                    break;
                default:
                    try {
                        outcomesPos = parseInt(this.getAttribute('OutcomesPosition', '0'));
                        if (outcomesPos > this.userColumns.length) {
                            outcomesPos = this.userColumns.length;
                        }
                    } catch (e) {
                        console.log('OutcomesPosition had an invalid value');
                        outcomesPos = 0;
                    }
                    break;
            }
            // insert buttons column
            this.userColumns.splice(outcomesPos, 0, '#BUTTONS#');
        }

        if (this.dynamicColumns === true && populateDefaults === true) {
            await this.saveUserColumns();
        }

        let inlineSearch: boolean = true;
        switch (this.getAttribute('RibbonStyle', 'ribbon')) {

            case 'search':
                this.ribbonElement = (
                    <SearchFilterTableRibbonSearch
                        root={this}
                        ref={(element: SearchFilterTableRibbonSearch) => {this.setRibbon(element); }}
                    />
                );
                inlineSearch = false;
                break;

            case 'ribbon':
            default:
                this.ribbonElement = (
                    <SearchFilterTableRibbon
                        root={this}
                        ref={(element: SearchFilterTableRibbon) => {this.setRibbon(element); }}
                    />
                );
                break;
        }

        if (this.model.label?.length > 0) {
            this.titleElement = (
                <div
                    className="sft-title"
                >
                    <span
                        className="sft-title-label"
                    >
                        {this.model.label}
                    </span>
                </div>
            );
        }

        this.headersElement = (
            <SearchFilterTableHeaders
                root={this}
                inlineSearch={inlineSearch}
                ref={(element: SearchFilterTableHeaders) => {this.setHeaders(element); }}
            />
        );

        this.footerElement = (
            <SearchFilterTableFooter
                root={this}
                ref={(element: SearchFilterTableFooter) => {this.setFooter(element); }}
            />
        );

        this.selectedRowMap.clear();
        const start: Date = new Date();
        const stateSelectedItems: Map<string, any> = await this.loadSelected();
        const isSelectedColumn: string = this.getAttribute('IsSelectedColumn');
        this.model.dataSource.items.forEach((item: FlowObjectData) => {
            // construct Item
            if (stateSelectedItems) {
                if (stateSelectedItems.has(item.internalId) && stateSelectedItems.get(item.internalId).isSelected === true) {
                    this.selectedRowMap.set(item.internalId, undefined);
                }
            } else {
                // if it's selected in the model or we have an IsSelectedField attribute then pre-select it
                if (
                    item.isSelected === true || (
                        isSelectedColumn && (
                            item.properties[isSelectedColumn].value as boolean === true ||
                            item.properties[isSelectedColumn].value as number > 0
                        )
                    )
                ) {
                    this.selectedRowMap.set(item.internalId, undefined);
                }
            }

            const node = new RowItem();
            node.id = item.internalId;

            this.colMap.forEach((col: FlowDisplayColumn) => {
                node.columns.set(col.developerName, new CellItem(col.developerName, item.properties[col.developerName]?.value as any));
                this.colValMap.get(col.developerName).set(item.properties[col.developerName]?.value, item.properties[col.developerName]?.value);
            });

            node.objectData = item;

            this.rowMap.set(node.id, node);
        });
        const end: Date = new Date();
    
        // we just loaded the core row data, trigger the filters to generate and sort the currentRowMap
        this.filterRows();
        //this.sortRows();
        //this.paginateRows();

        //await this.buildRibbon();
        //this.buildFooter();
    }

    // filters the currentRowMap
    filterRows() {
        const start: Date = new Date();
        this.currentRowMap = new Map();
        if (this.rowMap.size > 0) {
            this.currentRowMap = this.filters.filter(this.rowMap);
        }

        // remove any selected items not in the currentRowMap
        this.selectedRowMap.forEach((item: RowItem, internalId: string) => {
            if (!this.currentRowMap.has(internalId)) {
                this.selectedRowMap.delete(internalId);
            }
        });
        const end: Date = new Date();
        this.sortRows();
    }

    // sorts the currentRowMap by getting the current sort column from filters
    sortRows() {
        const start: Date = new Date();
        if (this.currentRowMap.size > 0) {
            this.currentRowMap = this.filters.sort(this.currentRowMap, this.rowMap);
        }
        const end: Date = new Date();
        this.paginateRows();
    }

    // this goes through currentRowMap and splits them into pages based on maxPageRows
    paginateRows() {
        const start: Date = new Date();
        this.currentRowPages = [];
        let currentPage: Map<string, RowItem> = new Map();
        this.currentRowMap.forEach((item: RowItem, key: string) => {
            if (currentPage.size < this.maxPageRows) {
                currentPage.set(key, item);
            } else {
                this.currentRowPages.push(currentPage);
                currentPage = new Map();
                currentPage.set(key, item);
            }
        });
        // add any stragglers
        this.currentRowPages.push(currentPage);
        this.currentRowPage = 0;
        const end: Date = new Date();
        this.buildTableRows();
    }

    async firstPage() {
        this.currentRowPage = 0;
        this.buildTableRows();
        this.forceUpdate();
    }

    previousPage() {
        if (this.currentRowPage > 1) { this.currentRowPage -= 1; } else { this.currentRowPage = 0; }
        this.buildTableRows();
        this.forceUpdate();
    }

    nextPage() {
        if (this.currentRowPage < (this.currentRowPages.length - 1)) { this.currentRowPage += 1; } else { this.currentRowPage = this.currentRowPages.length - 1; }
        this.buildTableRows();
        this.forceUpdate();
    }

    lastPage() {
        this.currentRowPage = this.currentRowPages.length - 1 ;
        this.buildTableRows();
        this.forceUpdate();
    }

    /////////////////////
    // toggles all rows selected status
    /////////////////////
    toggleSelectAll(event: any) {
        if (event.target.checked) {
            this.currentRowMap.forEach((item: RowItem, key: string) => {
                this.selectedRowMap.set(key, '');
            });
        } else {
            this.selectedRowMap.clear();
        }

        this.rows.forEach((row: SearchFilterTableRow) => {
            row.forceUpdate();
        });
        this.buildRibbon();
        this.buildFooter();
        this.saveSelected();
    }

    toggleSelect(event: any, key: string) {
        if (event.target.checked) {
            this.selectedRowMap.set(key, '');
        } else {
            this.selectedRowMap.delete(key);
        }
        this.rows.get(key).forceUpdate();
        this.buildRibbon();
        this.buildFooter();
        this.saveSelected();
    }

    // store the selected items to state
    async saveSelected() {
        const selectedItems: FlowObjectDataArray = new FlowObjectDataArray();
        this.selectedRowMap.forEach((item: FlowObjectData, key: string) => {
            const tItem: FlowObjectData = this.rowMap.get(key).objectData;
            tItem.isSelected = true;
            selectedItems.addItem(tItem);
        });
        await this.setStateValue(selectedItems);
    }

    // load selected items from state
    async loadSelected(): Promise<Map<string, any>> {
        let stateSelected: Map<string, any>;
        const selectedItems: FlowObjectDataArray = this.getStateValue() as FlowObjectDataArray;
        if (selectedItems && selectedItems.items) {
            stateSelected = new Map();
            for (let pos = 0 ; pos < selectedItems.items.length ; pos++) {
                stateSelected.set(selectedItems.items[pos].internalId, selectedItems.items[pos]);
            }
        }
        return stateSelected;
    }
    /////////////////////////////////////////////////////////////////////
    // Builds the rowElements from the currentRowMap and forces a redraw
    ////////////////////////////////////////////////////////////////////
    async buildTableRows() {
        this.rowElements = [];
        // loop over rowmap if defined
        if (this.currentRowPages && this.currentRowPages.length > 0 && this.currentRowPages[this.currentRowPage]) {
            this.currentRowPages[this.currentRowPage].forEach((node: RowItem, key: string) => {
                this.rowElements.push(
                    <SearchFilterTableRow
                        key={key}
                        root={this}
                        id={key}
                        ref={(element: SearchFilterTableRow) => {this.setRow(key , element); }}
                    />,
                );
            });
        }
        await this.buildRibbon();
        this.buildFooter();
        this.forceUpdate();
    }

    //////////////////////////////////////////////////////
    // builds title bar buttons based on attached outcomes
    //////////////////////////////////////////////////////
    async buildRibbon() {
        let res: Boolean = await this.ribbon?.generateButtons();
        if ( res === true){
            this.forceUpdate();
        };
        
    }

    //////////////////////////////////////////////////////
    // forces the footer to update
    //////////////////////////////////////////////////////
    buildFooter() {
        this.footer?.forceUpdate();
    }

    //////////////////////////
    // constructs and shows context menu
    //////////////////////////
    showContextMenu(e: any) {
        e.preventDefault();
        e.stopPropagation();
        const listItems: Map<string , any> = new Map();
        if (this.contextMenu) {
            Object.keys(this.outcomes).forEach((key: string) => {
                const outcome: FlowOutcome = this.outcomes[key];
                if (outcome.isBulkAction === true && outcome.developerName !== 'OnSelect' && outcome.developerName.toLowerCase().startsWith('cm')) {
                    if (! (outcome.attributes['RequiresSelected']?.value === 'true' && this.selectedRowMap.size < 1)) {
                        listItems.set(outcome.developerName, (
                            <li
                                className="sft-cm-item"
                                title={outcome.label || key}
                                onClick={(e: any) => {e.stopPropagation(); this.cmClick(key); }}
                            >
                                <span
                                    className={'glyphicon glyphicon-' + (outcome.attributes['icon']?.value || 'plus') + ' sft-cm-item-icon'} />
                                <span
                                    className={'sft-cm-item-label'}
                                >
                                    {outcome.label || key}
                                </span>
                            </li>
                        ));
                    }
                }
            });

            listItems.set('exportall', (
                <li
                    className="sft-cm-item"
                    title={'Export All'}
                    onClick={(e: any) => {e.stopPropagation(); this.doExport(this.rowMap); }}
                >
                    <span
                        className={'glyphicon glyphicon-floppy-save sft-cm-item-icon'} />
                    <span
                        className={'sft-cm-item-label'}
                    >
                        Export All
                    </span>
                </li>
            ));
            listItems.set('exportshown', (
                <li
                    className="sft-cm-item"
                    title={'Export Search Results'}
                    onClick={(e: any) => {e.stopPropagation(); this.doExport(this.currentRowMap); }}
                >
                    <span
                        className={'glyphicon glyphicon-floppy-save sft-cm-item-icon'} />
                    <span
                        className={'sft-cm-item-label'}
                    >
                        Export Search Results
                    </span>
                </li>
            ));
            if (this.selectedRowMap.size > 0) {
                listItems.set('exportselected', (
                    <li
                        className="sft-cm-item"
                        title={'Export Selected Items'}
                        onClick={(e: any) => {e.stopPropagation(); this.doExport(this.selectedRowMap); }}
                    >
                        <span
                            className={'glyphicon glyphicon-floppy-save sft-cm-item-icon'} />
                        <span
                            className={'sft-cm-item-label'}
                        >
                            Export Selected
                        </span>
                    </li>
                ));
            }
            this.contextMenu.showContextMenu(e.clientX, e.clientY, listItems);
            this.forceUpdate();
        }
    }

    async hideContextMenu() {
        this.contextMenu.hideContextMenu();
    }

    // a context menu item was clicked - the key will be the item's name
    cmClick(key: string) {
        this.doOutcome(key);
    }

    getTextValue(property: FlowObjectDataProperty): string {
        switch (property.contentType) {
            case eContentType.ContentBoolean:
                if (property.value === true) {
                    return 'True';
                } else {
                    return 'False';
                }
            case eContentType.ContentNumber:
                return property.value.toString();

            default:
                return property.value as string;
        }
    }

    async doOutcome(outcomeName: string, selectedItem?: string, ignoreRules?: boolean) {
        let objData: FlowObjectData;
        // if there's a row level state then set it
        if (selectedItem && this.getAttribute('RowLevelState', '').length > 0) {
            objData = this.rowMap.get(selectedItem)?.objectData;
            const val: FlowField = await this.loadValue(this.getAttribute('RowLevelState'));
            if (val) {
                val.value = objData;
                await this.updateValues(val);
            }
        }
        if (this.outcomes[outcomeName]) {
            const outcome: FlowOutcome = this.outcomes[outcomeName];
            switch (true) {
                // does it have a uri attribute ?
                case outcome.attributes['uri']?.value.length > 0 :
                    let href: string = outcome.attributes['uri'].value;
                    let match: any;
                    while (match = RegExp(/{{([^}]*)}}/).exec(href)) {
                        // could be a property of the selected item or a global variable or a static value - depends also on isBulkAction
                        // if it's not bulk then grab selected row objdata
                        if (outcome.isBulkAction === false) {
                            objData = this.rowMap.get(selectedItem)?.objectData;
                        }

                        if (objData && objData.properties[match[1]]) {
                            // objdata had this prop
                            href = href.replace(match[0], (objData.properties[match[1]] ? this.getTextValue(objData.properties[match[1]]) : ''));
                        } else {
                            // is it a known static
                            switch (match[1]) {
                                case 'TENANT_ID':
                                    href = href.replace(match[0], this.tenantId);
                                    break;

                                default:
                                    const fldElements: string[] = match[1].split('->');
                                    // element[0] is the flow field name
                                    const val: FlowField = await this.loadValue(fldElements[0]);
                                    let value: any;
                                    if (val) {
                                        if (fldElements.length > 1) {
                                            let od: FlowObjectData = val.value as FlowObjectData;
                                            for (let epos = 1 ; epos < fldElements.length ; epos ++) {
                                                od = (od as FlowObjectData).properties[fldElements[epos]].value as FlowObjectData;
                                            }
                                            value = od;
                                        } else {
                                            value = val.value;
                                        }
                                    }
                                    href = href.replace(match[0], value);

                            }
                        }
                    }

                    if (this.outcomes[outcomeName].attributes['target']?.value === '_self') {
                        window.location.href = href;
                    } else {
                        const tab = window.open('');
                        if (tab) {
                            tab.location.href = href;
                        } else {
                            console.log('Couldn\'t open a new tab');
                        }
                    }
                    break;

                case outcome.attributes?.form?.value.length > 0 && ignoreRules !== true:
                    const form: any = JSON.parse(outcome.attributes.form.value);
                    objData = this.rowMap.get(selectedItem)?.objectData;
                    const formProps = {
                        id: this.componentId,
                        flowKey: this.flowKey,
                        okOutcome: this.okOutcomeForm,
                        cancelOutcome: this.cancelOutcomeForm,
                        objData,
                        outcome,
                        form,
                        sft: this,
                    };
                    const comp: any = manywho.component.getByName(form.class);
                    const content: any = React.createElement(comp, formProps);
                    this.messageBox.showMessageBox(
                        form.title, content, [new modalDialogButton('Ok', this.okOutcomeForm), new modalDialogButton('Cancel', this.cancelOutcomeForm)],
                    );
                    this.forceUpdate();
                    break;

                default:
                    await this.triggerOutcome(outcomeName);
                    break;
            }
        } else {
            manywho.component.handleEvent(
                this,
                manywho.model.getComponent(
                    this.componentId,
                    this.flowKey,
                ),
                this.flowKey,
                null,
            );
        }
        this.forceUpdate();
    }

    cancelOutcomeForm() {
        this.messageBox.hideMessageBox();
        this.form = null;
        this.forceUpdate();
    }

    async okOutcomeForm() {
        if (this.form.validate() === true) {
            const objData: FlowObjectData = await this.form?.makeObjectData();
            const objDataId: string = this.form.props.objData?.internalId;
            const outcome: FlowOutcome = this.form.props.outcome;
            const form: any = this.form.props.form;
            if (form.state && objData) {
                const state: FlowField = await this.loadValue(form.state);
                if (state) {
                    state.value = objData;
                    await this.updateValues(state);
                }
            }
            this.messageBox.hideMessageBox();
            this.form = null;
            this.doOutcome(outcome.developerName, objDataId, true);
            this.forceUpdate();
        }
    }

    async doExport(data: Map<string, RowItem>) {
        const opdata: Map<string, RowItem> = new Map();
        data.forEach((item, key) => {
            opdata.set(key, this.rowMap.get(key));
        });
        ModelExporter.export(this.colMap, opdata, 'export.csv');
        if (this.outcomes['OnExport']) {
            this.triggerOutcome('OnExport');
        }
    }

    playVideo(title: string, dataUri: string, mimetype: string) {
        this.messageBox.showMessageBox(
            title,
            (
                <video
                    style={{width: '100%', minWidth: '10rem', height: '97%'}}
                    autoPlay={true}
                    controls={true}
                >
                    <source src={dataUri} type={mimetype}/>
                    Your browser does not support the video tag.
                </video>
            ), [new modalDialogButton('Close', this.messageBox.hideMessageBox)],
        );
    }

    playAudio(title: string, dataUri: string, mimetype: string) {
        this.messageBox.showMessageBox(
            title,
            (
                <audio
                    controls={true}
                    autoPlay={true}
                    style={{width: '100%', minWidth: '10rem', height: '97%'}}
                >
                    <source src={dataUri} type={mimetype}/>
                    Your browser does not support the audio tag.
                </audio>
            ), [new modalDialogButton('Close', this.messageBox.hideMessageBox)],
        );
    }

    render() {

        // handle classes attribute and hidden and size
        const classes: string = 'sft ' + this.getAttribute('classes', '');
        const style: CSSProperties = {};
        style.width = '-webkit-fill-available';
        style.height = '-webkit-fill-available';

        if (this.model.visible === false) {
            style.display = 'none';
        }
        if (this.model.width) {
            style.width = this.model.width + 'px';
        }
        if (this.model.height) {
            style.height = this.model.height + 'px';
        } else {
            style.height = '600px';
        }

        const title: string = this.model.label || '';

        let top: number = 6;
        switch (this.getAttribute('RibbonStyle', 'ribbon')) {

            case 'search':
                top = 4;
                break;

            case 'ribbon':
            default:
                top = 6;
                break;
        }

        if (this.titleElement) {
            top += 2.5;
        }

        let body: any;
        if (this.loaded===false  && this.loadingState !== eLoadingState.ready) {
            body = (
                <div
                    className="sft-loading"
                >
                    <div
                        className="sft-loading-inner"
                        style={{margin: 'auto', display: 'flex', flexDirection: 'column'}}
                    >
                        {this.attributes.LoadingIcon ? <img className="sft-loading-image" src={this.attributes.LoadingIcon.value}/> : undefined}
                        <span
                            className="sft-loading-label"
                        >
                            Loading
                        </span>
                    </div>

                </div>
            );
        } else {
            body = (
                <div
                    className="sft-scroller-body"
                >
                    <table
                        style={{minWidth: '100%'}}
                    >
                        <thead>
                            {this.headersElement}
                        </thead>
                        <tbody>
                            {this.rowElements}
                        </tbody>
                        <tfoot/>
                    </table>
                </div>
            );
        }
        this.lastContent = (
            <div
                className={classes}
                style={style}
                onContextMenu={this.showContextMenu}
            >
                <FlowMessageBox
                    parent={this}
                    ref={(element: FlowMessageBox) => {this.messageBox = element; }}
                />
                <FlowContextMenu
                    parent={this}
                    ref={(element: FlowContextMenu) => {this.contextMenu = element; }}
                />
                {this.titleElement}
                {this.ribbonElement}
                <div
                    className="sft-body"
                    style={{top: top + 'rem'}}
                >
                    <div
                        className="sft-scroller"
                        ref={(element: HTMLDivElement) => {this.scroller = element; }}
                    >
                        {body}
                    </div>
                </div>
                {this.footerElement}
            </div>
        );
        return this.lastContent;
    }

}

manywho.component.register('SearchFilterTable', SearchFilterTable);
