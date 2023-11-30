import { FlowComponent } from 'flow-component-model';
import * as React from 'react';
import { SFT } from './SearchFilterTable';
declare const manywho: any;

class SearchFilterTable extends FlowComponent {

    constructor(props: any) {
        super(props);
    }

    async componentDidMount() {
        await super.componentDidMount();
        this.forceUpdate();
    }

    async componentWillUnmount() {
        await super.componentWillUnmount();
    }

    render() {
        return(
            <SFT
                parent={this}
            />
        );
    }
}
manywho.component.register('SearchFilterTable', SearchFilterTable);