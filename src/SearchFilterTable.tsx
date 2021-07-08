import React, { CSSProperties } from 'react';

import { eLoadingState, FlowComponent, FlowObjectDataArray, FlowObjectData, FlowOutcome,  FlowDisplayColumn, FlowMessageBox, modalDialogButton, eContentType, FlowObjectDataProperty, FlowField } from 'flow-component-model';
import FlowContextMenu from 'flow-component-model/lib/Dialogs/FlowContextMenu';
import RowItem from './RowItem';
import CellItem from './CellItem';
import SearchFilterTableRow from './SearchFilterTableRow';
import './SearchFilterTable.css';
import SearchFilterTableHeaders from './SearchFilterTableHeaders';
import ColumnFilters, { eFilterEvent, eSortDirection } from './ColumnFilters';
import SearchFilterTableFooter from './SearchFilterTableFooter';
import ModelExporter from './ModelExporter';
import SearchFilterTableHeaderButtons from './SearchFilterTableHeaderButtons';
import SearchFilterTableRibbon from './SearchFilterTableRibbon';


//declare const manywho: IManywho;
declare const manywho: any;

export default class SearchFilterTable extends FlowComponent {
    version: string="1.0.0";
    context: any;
   
    contextMenu: FlowContextMenu;
    messageBox: FlowMessageBox;
   
    // this contains the master copy of the model data, it doesn't change unless data reloaded
    rowMap: Map<string,any> = new Map();

    // this contains the display time subset of rowMap which is filtered & sorted, it changes with each query etc,  Used to build the actual rows
    currentRowMap: Map<string,any> = new Map();
    //currentRowMap: Array<string> = [];//Map<string,any> = new Map();

    // this holds the max items per page
    maxPageRows: number = 5;

    // this holds the items in pages
    currentRowPages: Array<Map<string,any>> = [];
    
    // this holds the current pagination page number
    currentRowPage: number = 0;

    // this contains the display time subset of currentRowMap which is selected, each query removes any items no longer in results
    selectedRowMap: Map<string,any> = new Map();

    // these are the child row React objects, they are re-populated with each filter, search etc
    rows: Map<string,SearchFilterTableRow> = new Map();

    // these are the html child elements used in render.  Built from currentRowMap
    rowElements: any[];

    // this is the column definition map, it doesn't change unless data reloaded
    colMap: Map<string,FlowDisplayColumn> = new Map();

    // this is the column value map, it conatins all possible values for each column, it doesn't change unless data reloaded
    colValMap: Map<string,Map<any,any>> = new Map();

    // this is the table headers React component
    headers: SearchFilterTableHeaders;

    // this is the table headers html element
    headersElement: any;

    // this is the footer React component
    ribbon: SearchFilterTableRibbon;

    // this is the footer html element
    ribbonElement: any;

    // this is the footer React component
    footer: SearchFilterTableHeaders;

    // this is the footer html element
    footerElement: any;

    // these are the child column React objects, it doesn't change unless data reloaded
    cols: Map<string,any> = new Map();

    // these are the html column header child elements used in render.  Built from colMap
    colElements: any[];

    // content holder to avoid blank pages during moves 
    lastContent: any = (<div></div>);

    // these are the filter & sort controllers
    filters: ColumnFilters = new ColumnFilters(this);


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
        this.toggleSelect = this.toggleSelect.bind(this);

        this.firstPage = this.firstPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.lastPage = this.lastPage.bind(this);

        this.maxPerPageChanged = this.maxPerPageChanged.bind(this);

        this.doExport = this.doExport.bind(this);

        this.maxPageRows = parseInt(sessionStorage.getItem("sft-max-" + this.componentId) || this.getAttribute("PaginationSize",undefined) || "10" );
        sessionStorage.setItem("sft-max-" + this.componentId,this.maxPageRows.toString());
    }

    
    filtersChanged(key: string, event: eFilterEvent) {
        this.headers.forceUpdate();
        sessionStorage.setItem("sft-filters-" + this.componentId,this.filters.getForStorage());
        switch(event) {
            case eFilterEvent.sort:
                this.sortRows();
                this.paginateRows();
                this.buildTableRows();
                this.forceUpdate();
                break;

            case eFilterEvent.filter:
                this.filterRows();
                this.sortRows();
                this.paginateRows();
                this.buildTableRows();
                this.forceUpdate();
                break;
        }
    }

    maxPerPageChanged(max: number) {
        this.maxPageRows = max || 10;
        sessionStorage.setItem("sft-max-" + this.componentId,this.maxPageRows.toString());
        this.paginateRows();
        this.buildTableRows();
        this.forceUpdate();
    }

    // stores / deletes a ref to a table row as it's created or destroyed
    setRow(key: string, element: SearchFilterTableRow) {
        if(element){
            this.rows.set(key, element);
        }
        else {
            if(this.rows.has(key)) {
                this.rows.delete(key);
            }
        }
    }

    // stores / deletes a ref to the column headers
    setRibbon(element: SearchFilterTableRibbon) {
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
        let me: any = this;
        if(xhr.invokeType==="FORWARD") {
            if(this.loadingState !== eLoadingState.ready){
                window.setTimeout(function() {me.flowMoved(xhr, request)},500);
            }
            else {
                this.maxPageRows = parseInt(sessionStorage.getItem("sft-max-" + this.componentId) || this.getAttribute("PaginationSize",undefined) || "10");
                this.filters.loadFromStorage(sessionStorage.getItem("sft-filters-" + this.componentId));
                this.buildCoreTable();
                this.filterRows();
                this.sortRows();
                this.buildTableRows();
                this.forceUpdate();
            }
        }
        
    }

    async componentDidMount() {
        //will get this from a component attribute
        await super.componentDidMount();
        (manywho as any).eventManager.addDoneListener(this.flowMoved, this.componentId);
        // build tree
        this.maxPageRows = parseInt(sessionStorage.getItem("sft-max-" + this.componentId || this.getAttribute("PaginationSize",undefined) || "10"));
        this.filters.loadFromStorage(sessionStorage.getItem("sft-filters-" + this.componentId));
        this.buildCoreTable();
        this.filterRows();
        this.sortRows();
        this.buildTableRows();
        this.forceUpdate();
    }

    
    async componentWillUnmount() {
        await super.componentWillUnmount();
        (manywho as any).eventManager.removeDoneListener(this.componentId);
    }


    ///////////////////////////////////////////////////////////////////////////////////////////
    // reads the model
    // constructs the a flat a map of rows ready for searching, sorting and direct access
    // also builds the display column map
    ///////////////////////////////////////////////////////////////////////////////////////////
    buildCoreTable(){
        this.rowMap = new Map();
        this.rows = new Map();

        //sort display cols on order
        
        let cols: Array<FlowDisplayColumn> = this.model.displayColumns.sort((a: any,b: any) => {
            switch(true) {
                case a.DisplayOrder > b.DisplayOrder:
                    return 1;
                case a.DisplayOrder === b.DisplayOrder:
                    return 0;
                default: 
                    return -1;
            }
        });

        this.colMap = new Map();
        cols.forEach((col: FlowDisplayColumn) => {
            this.colMap.set(col.developerName, col);
            this.colValMap.set(col.developerName, new Map());
        })
        
        this.ribbonElement = (
            <SearchFilterTableRibbon 
                root={this}
                ref={(element: SearchFilterTableRibbon) => {this.setRibbon(element)}}
            />
        );

        this.headersElement = (
            <SearchFilterTableHeaders 
                root={this}
                ref={(element: SearchFilterTableHeaders) => {this.setHeaders(element)}}
            />
        );

        this.footerElement = (
            <SearchFilterTableFooter 
                root={this}
                ref={(element: SearchFilterTableFooter) => {this.setFooter(element)}}
            />
        );
        
        let start: Date = new Date();
        this.model.dataSource.items.forEach((item: FlowObjectData) => {
            //construct Item
            if(item.isSelected === true) {
                this.selectedRowMap.set(item.internalId,undefined);
            }
            let node = new RowItem();
            node.id = item.internalId;

            this.colMap.forEach((col:FlowDisplayColumn) => {
                node.columns.set(col.developerName, new CellItem(col.developerName, item.properties[col.developerName]?.value as any));
                this.colValMap.get(col.developerName).set(item.properties[col.developerName]?.value,item.properties[col.developerName]?.value);
            });
                        
            node.objectData = item;

            this.rowMap.set(node.id,node);
        });
        let end: Date = new Date();
        console.log("build rowmap: " + (end.getTime() - start.getTime()));

        // we just loaded the core row data, trigger the filters to generate and sort the currentRowMap
        this.filterRows();
        this.sortRows();
        this.paginateRows();

        this.buildRibbon();
        this.buildFooter();

    }

    // filters the currentRowMap
    filterRows() {
        let start: Date = new Date();
        this.currentRowMap = new Map();
        if (this.rowMap.size > 0) {
            this.currentRowMap = this.filters.filter(this.rowMap);
        }

        // remove any selected items not in the currentRowMap
        this.selectedRowMap.forEach((item: RowItem, internalId: string) => {
            if(!this.currentRowMap.has(internalId)) {
                this.selectedRowMap.delete(internalId);
            }
        });
        let end: Date = new Date();
        console.log("filter: " + (end.getTime() - start.getTime()));
    }

    // sorts the currentRowMap by getting the current sort column from filters
    sortRows() {
        let start: Date = new Date();
        if (this.currentRowMap.size > 0) {
            this.currentRowMap = this.filters.sort(this.currentRowMap, this.rowMap);
        }
        let end: Date = new Date();
        console.log("sort: " + (end.getTime() - start.getTime()));
    }

    // this goes through currentRowMap and splits them into pages based on maxPageRows
    paginateRows() {
        let start: Date = new Date();
        this.currentRowPages = [];
        let currentPage: Map<string,RowItem> = new Map();
        this.currentRowMap.forEach((item: RowItem,key: string) => {
            if(currentPage.size < this.maxPageRows) {
                currentPage.set(key,undefined);
            }
            else {
                this.currentRowPages.push(currentPage);
                currentPage = new Map();
                currentPage.set(key,undefined);
            }
        });
        // add any stragglers
        this.currentRowPages.push(currentPage);
        this.currentRowPage = 0;
        let end: Date = new Date();
        console.log("paginate: " + (end.getTime() - start.getTime()));
    }

    firstPage() {
        this.currentRowPage = 0;
        this.buildTableRows();
        this.buildRibbon();
        this.buildFooter();
        this.forceUpdate();
    }

    previousPage() {
        if(this.currentRowPage > 1) { this.currentRowPage -= 1 } else { this.currentRowPage = 0 };
        this.buildTableRows();
        this.buildRibbon();
        this.buildFooter();
        this.forceUpdate();
    }

    nextPage() {
        if(this.currentRowPage < (this.currentRowPages.length - 1)) { this.currentRowPage += 1 } else { this.currentRowPage = this.currentRowPages.length - 1 };
        this.buildTableRows();
        this.buildRibbon();
        this.buildFooter();
        this.forceUpdate();
    }

    lastPage() {
        this.currentRowPage = this.currentRowPages.length - 1 ;
        this.buildTableRows();
        this.buildRibbon();
        this.buildFooter();
        this.forceUpdate();
    }

    /////////////////////
    // toggles all rows selected status
    /////////////////////
    toggleSelectAll(event: any) {
        if(event.target.checked) {
            this.currentRowMap.forEach((item: RowItem, key: string) => {
                this.selectedRowMap.set(key,"");
            });
        }
        else {
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
        if(event.target.checked) {
            this.selectedRowMap.set(key,"");
        }
        else {
            this.selectedRowMap.delete(key);
        }
        this.rows.get(key).forceUpdate();
        this.buildRibbon();
        this.buildFooter();
        this.saveSelected();
    }
   
    // store the selected items to state
    async saveSelected() {
        let selectedItems : FlowObjectDataArray = new FlowObjectDataArray();
        this.selectedRowMap.forEach((item: FlowObjectData, key: string) => {
            let tItem: FlowObjectData = this.rowMap.get(key).objectData;
            tItem.isSelected = true;
            selectedItems.addItem(tItem);
        });
        await this.setStateValue(selectedItems);
    }

    // store the selected items to state
    async loadSelected() {
        let selectedItems : FlowObjectDataArray = this.getStateValue() as FlowObjectDataArray;
        this.selectedRowMap.forEach((item: FlowObjectData, key: string) => {
            let tItem: FlowObjectData = this.rowMap.get(key).objectData;
            tItem.isSelected = true;
            selectedItems.addItem(tItem);
        });
        await this.setStateValue(selectedItems);
    }
    /////////////////////////////////////////////////////////////////////
    // Builds the rowElements from the currentRowMap and forces a redraw
    ////////////////////////////////////////////////////////////////////
    buildTableRows() {
        this.rowElements = [];
        // loop over rowmap if defined
        if(this.currentRowPages && this.currentRowPages.length > 0 && this.currentRowPages[this.currentRowPage]) {
            this.currentRowPages[this.currentRowPage].forEach((node: RowItem, key: string) => {
                this.rowElements.push(
                    <SearchFilterTableRow  
                        key={key}
                        root={this}
                        id={key}
                        ref={(element: SearchFilterTableRow) => {this.setRow(key ,element)}}
                    />
                );
            });
        }
        this.buildRibbon();
        this.buildFooter();
    }

    //////////////////////////////////////////////////////
    // builds title bar buttons based on attached outcomes
    //////////////////////////////////////////////////////
    buildRibbon() {
        this.ribbon?.forceUpdate();
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
        let listItems: Map<string , any> = new Map();
        if(this.contextMenu) {
            Object.keys(this.outcomes).forEach((key: string) => {
                const outcome: FlowOutcome = this.outcomes[key];
                if (outcome.isBulkAction === true && outcome.developerName !== "OnSelect" && outcome.developerName.toLowerCase().startsWith("cm")) {
                    if(! (outcome.attributes["RequiresSelected"]?.value === "true" && this.selectedRowMap.size < 1)) {
                        listItems.set(outcome.developerName,(
                            <li 
                                className="sft-cm-item"
                                title={outcome.label || key}
                                onClick={(e: any) => {e.stopPropagation(); this.cmClick(key)}}
                            >
                                <span
                                    className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " sft-cm-item-icon"} />
                                <span
                                    className={"sft-cm-item-label"}
                                >
                                    {outcome.label || key}
                                </span>
                            </li>
                        ));
                    }
                }
            });

            listItems.set("exportall",(
                <li 
                    className="sft-cm-item"
                    title={"Export All"}
                    onClick={(e: any) => {e.stopPropagation(); this.doExport(this.rowMap)}}
                >
                    <span
                        className={"glyphicon glyphicon-floppy-save sft-cm-item-icon"} />
                    <span
                        className={"sft-cm-item-label"}
                    >
                        Export All
                    </span>
                </li>
            ));
            listItems.set("exportshown",(
                <li 
                    className="sft-cm-item"
                    title={"Export Search Results"}
                    onClick={(e: any) => {e.stopPropagation(); this.doExport(this.currentRowMap)}}
                >
                    <span
                        className={"glyphicon glyphicon-floppy-save sft-cm-item-icon"} />
                    <span
                        className={"sft-cm-item-label"}
                    >
                        Export Search Results
                    </span>
                </li>
            ));
            if(this.selectedRowMap.size > 0) {
                listItems.set("exportselected",(
                    <li 
                        className="sft-cm-item"
                        title={"Export Selected Items"}
                        onClick={(e: any) => {e.stopPropagation(); this.doExport(this.selectedRowMap)}}
                    >
                        <span
                            className={"glyphicon glyphicon-floppy-save sft-cm-item-icon"} />
                        <span
                            className={"sft-cm-item-label"}
                        >
                            Export Selected
                        </span>
                    </li>
                ));
            }
            this.contextMenu.showContextMenu(e.clientX, e.clientY,listItems);   
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

    getTextValue(property: FlowObjectDataProperty) : string {
        switch(property.contentType) {
            case eContentType.ContentBoolean:
                if(property.value === true) {
                    return "True";
                }
                else {
                    return "False";
                }
            case eContentType.ContentNumber:
                return property.value.toString();

            default:
                return property.value as string;
        }
    }
    
    async doOutcome(outcomeName: string, selectedItem? : string) {
        
        // if there's a row level state then set it
        if(selectedItem && this.getAttribute("RowLevelState","").length>0) {
            let objData: FlowObjectData = this.rowMap.get(selectedItem)?.objectData;
            let val: FlowField = await this.loadValue(this.getAttribute("RowLevelState"));
            if (val) {
                val.value = objData;
                await this.updateValues(val);
            }
        }
        if(this.outcomes[outcomeName]) {
            let outcome: FlowOutcome = this.outcomes[outcomeName];
            // does it have a uri attribute ?
            if(outcome.attributes["uri"]) {
                let href: string = outcome.attributes["uri"].value;
                let match: any;
                let objData: FlowObjectData;
                while( match = RegExp(/{{([^}]*)}}/).exec(href)) {
                    //could be a property of the selected item or a global variable - depends also on isBulkAction
                     // if it's not bulk then grab selected row objdata
                    if(outcome.isBulkAction === false) {
                        objData = this.rowMap.get(selectedItem)?.objectData;
                    }
               
                    if(objData && objData.properties[match[1]]){
                        //objdata had this prop
                        href=href.replace(match[0],(objData.properties[match[1]] ? this.getTextValue(objData.properties[match[1]]) : ""));
                    }
                    else {
                        //no prop found, try to get the value
                        let val: FlowField = await this.loadValue(match[1]);
                        if(val){
                            href=href.replace(match[0],val.value as string);
                        }
                    }
                }
                
                if(this.outcomes[outcomeName].attributes["target"]?.value==="_self") {
                    window.location.href = href;
                }
                else {
                    var tab = window.open();
                    tab.location.href = href;
                }
            }
            else {
                await this.triggerOutcome(outcomeName);
            }
        }
        else {
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
    
    async doExport(data: Map<string,RowItem>) {
        let opdata: Map<string,RowItem> = new Map();
        data.forEach((item,key) => {
            opdata.set(key,this.rowMap.get(key));
        });
        ModelExporter.export(this.colMap, opdata,"export.csv");
        if(this.outcomes["OnExport"]) {
            this.triggerOutcome("OnExport");
        }
    }

    render() {
        
        if(this.loadingState !== eLoadingState.ready) {
            return this.lastContent;
        }
        
        
        

        //handle classes attribute and hidden and size
        let classes: string = "sft " + this.getAttribute("classes","");
        let style: CSSProperties = {};
        style.width = "-webkit-fill-available";
        style.height = "-webkit-fill-available";

        if(this.model.visible === false) {
            style.display = "none";
        }
        if(this.model.width) {
            style.width=this.model.width + "px"
        }
        if(this.model.height) {
            style.height=this.model.height + "px"
        }
             
        let title:  string = this.model.label || "";
        
        this.lastContent = (
            <div
                className={classes}
                style={style}
                onContextMenu={this.showContextMenu}
            >
                <FlowMessageBox
                    parent={this}
                    ref={(element: FlowMessageBox) => {this.messageBox = element}}
                />
                <FlowContextMenu
                    parent={this}
                    ref={(element: FlowContextMenu) => {this.contextMenu = element}}
                />
                {this.ribbonElement}
                <div
                    className="sft-body"
                >
                    <div 
                        className="sft-scroller" 
                    >
                        <div
                            className="sft-scroller-body"
                        >
                            <table>
                                <thead>
                                    {this.headersElement}
                                </thead>
                                <tbody>
                                    {this.rowElements}
                                </tbody>
                                <tfoot>
                                </tfoot>
                            </table>
                            
                        </div>
                    </div>
                </div>
                {this.footerElement}
            </div>
        );
        return this.lastContent;
    }

}

manywho.component.register('SearchFilterTable', SearchFilterTable);