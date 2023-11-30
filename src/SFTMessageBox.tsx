import { FlowObjectData, FlowOutcome } from "flow-component-model";
import * as React from "react";
import "./SFTForms.css";
declare var manywho: any;

export class SFTMessageBox extends React.Component<any,any> {
    
    content: any = (
        <img
            src="https://files-manywho-com.s3.amazonaws.com/8f6d2e19-efc9-4ebc-b70e-616396f7184e/loading-icon-transparent-background-12.jpg"
        />
    );

    constructor(props: any) {
        super(props);
        this.validate=this.validate.bind(this);
        this.makeObjectData=this.makeObjectData.bind(this);
        this.props.sft.form = this;
    }

    async componentDidMount(): Promise<void> {
        let sft: any = this.props.sft;
        this.forceUpdate();
    }

    validate() : boolean {
        let valid: boolean = true;
        return valid;
    }

    async makeObjectData() : Promise<FlowObjectData> {
        return null;
    }

    render() {

        let outcome: FlowOutcome = this.props.outcome;
        let form: any = this.props.form;
        let icon: string = "glyphicon glyphicon-" + (form.icon || "exclamation-sign") + " sft-dlg-icon";
   
        let msgStr : string = "Deletion is a permanent action.  Please confirm ?";
        msgStr = form.message || msgStr;
 
        let msgRows: any[] = [];
        let msgLines: string[] = msgStr.split("/n");
        msgLines.forEach((line: string) => {
            msgRows.push(
                <span
                    className="sft-dlg-row"
                >
                    {line.trim()}
                </span>
            );
        });
        this.content = (
            <div
                className="sft-dlg"
            >
                <div
                    className="sft-dlg-body"
                >
                    <div
                        className="sft-dlg-body-icon"
                    >
                        <span className={icon}/>
                    </div>
                    <div
                        className="sft-dlg-body-message"
                    >
                        {msgRows}
                    </div>
                </div>
            </div>
        )

        return this.content;
    }
}

manywho.component.register('SFTMessageBox', SFTMessageBox);