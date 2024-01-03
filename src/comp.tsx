import React, { CSSProperties } from 'react';
import { eLoadingState, FlowComponent,  FlowObjectData,  FlowOutcome, FlowMessageBox, FlowContextMenu } from 'flow-component-model';import './comp.css';

declare const manywho: any;

export default class cust extends FlowComponent {

version: string='1.0.0';
context: any;

   messageBox: FlowMessageBox;
   contextMenu: FlowContextMenu;
   lastContent: any = (<div></div>);


constructor(props: any) {
   super(props);
   this.flowMoved = this.flowMoved.bind(this);
}


async flowMoved(xhr: any, request: any) {
   let me: any = this;
    if(xhr.invokeType==='FORWARD') {
      if(this.loadingState !== eLoadingState.ready){
          window.setImmediate(function() {me.flowMoved(xhr, request)});
      }
      else {
         this.forceUpdate();
      }
    }
}

async componentDidMount() {
   await super.componentDidMount();
   (manywho as any).eventManager.addDoneListener(this.flowMoved, this.componentId);
   this.forceUpdate();
}

async componentWillUnmount() {
    await super.componentWillUnmount();
    (manywho as any).eventManager.removeDoneListener(this.componentId);
}

render() {
   if(this.loadingState !== eLoadingState.ready) {
      return this.lastContent;
   }
   //handle classes attribute and hidden and size
   let classes: string = 'cust ' + this.getAttribute('classes','');
   let style: CSSProperties = {};
   style.width='-webkit-fill-available';
   style.height='-webkit-fill-available';

   if(this.model.visible === false) {
      style.display = 'none';
   }
   if(this.model.width) {
      style.width=this.model.width + 'px'
   }
   if(this.model.height) {
      style.height=this.model.height + 'px'
   }
   this.lastContent = (
      <div
         className={classes}
         style={style}
      >
      <FlowContextMenu
         parent={this}
         ref={(element: FlowContextMenu) => {this.contextMenu = element}}
      />
      <FlowMessageBox
         parent={this}
         ref={(element: FlowMessageBox) => {this.messageBox = element}}
      />
      <div
         className='cust-body'
      >
         {}
      </div>
   </div>
   );
   return this.lastContent;
}
}

manywho.component.register('cust', cust);
