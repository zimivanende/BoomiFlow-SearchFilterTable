import { FlowComponent } from 'flow-component-model';
import * as React from 'react';
import { SFT } from './SearchFilterTable';
declare const manywho: any;

class SearchFilterTable extends FlowComponent {

    sft: SFT;

    constructor(props: any) {
        super(props);
        this.setcomponent = this.setcomponent.bind(this);
    }

    setcomponent(element: any, key: string) {
        this.sft = element;
    }

    async componentDidMount() {
        await super.componentDidMount();
        this.forceUpdate();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
    }

    redraw(): void {
        this.sft?.componentDidMount();
    }

    render() {
        return(
            <SFT
                id={this.componentId}
                key={this.componentId}
                parent={this}
                ref={(element: SFT) => {this.setcomponent(element, this.componentId)}}
            />
        );
    }
}
manywho.component.register('SearchFilterTable', SearchFilterTable);