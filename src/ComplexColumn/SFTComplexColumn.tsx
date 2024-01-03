import { FlowObjectData } from "flow-component-model";
import * as React from "react";
import "./SFTComplexColumn.css";
import { SFT } from "../SearchFilterTable";
declare var manywho: any;

export class SFTComplexColumn extends React.Component<any,any> {
    
    content: any = (
        <img
            src="https://files-manywho-com.s3.amazonaws.com/8f6d2e19-efc9-4ebc-b70e-616396f7184e/loading-icon-transparent-background-12.jpg"
        />
    );

    /*
const columnProps = {
                        id: row.internalId,
                        propertyId: value.typeElementPropertyId,
                        contentValue: value.value,
                        objectData: value.value,
                        flowKey: this.parent.flowKey,
                        contentType: value.contentType,
                        contentFormat: value.contentFormat,
                        row,
                        sft: this.parent,
                    };
    */
    constructor(props: any) {
        super(props);
    }

    async componentDidMount(): Promise<void> {
        let sft: any = this.props.sft;
        this.forceUpdate();
    }

    render() {
        let sft: SFT = this.props.sft;
        let valName: string = sft.parent.getAttribute("ComplexColumnValue","Value");
        let objData: FlowObjectData = this.props.objectData;
        let style: React.CSSProperties = {};
        let res: number = objData.properties?.Result?.value as number;
        let msg: string = objData.properties?.Message?.value as string;
        let info: any;
        switch(res) {
            case 200:
                style.backgroundColor = "transparent";
                break;
            case 300:
                style.backgroundColor = "rgb(199 199 237)";
                info = (
                    <span   
                        className="sftcc-info glyphicon glyphicon-info-sign"
                        title={msg}
                    />
                );
                break;
            case 400:
                style.backgroundColor = "rgb(245 187 187)";
                info = (
                    <span   
                        className="sftcc-error glyphicon glyphicon-exclamation-sign"
                        title={msg}
                    />
                );
                
                break;
        }
        this.content = (
            <div
                style={style}
            >
                <span
                    className="sft-table-cell-text"
                    
                >
                    {objData.properties[valName]?.value as string}
                    {info}
                </span>
            </div>
        )

        return this.content;
    }
}

manywho.component.register('SFTComplexColumn', SFTComplexColumn);