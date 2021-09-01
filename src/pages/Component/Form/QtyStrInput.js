import { PureComponent } from "react";
import { InputNumber } from 'antd';
import { Subtr } from "@/utils/QpcStrUtil";

/**
 * 件数输入框控件
 * 属性value设置初始值
 * 属性onChange监控控件值变化
 */
export default class QtyStrInput extends PureComponent {

    constructor(props) {
        super(props);

        const value = props.value;

        let caseValue = 0;
        let splitValue = 0;

        if (value) {
            let caseAndSplitValues = (value + "").split("+");
            caseValue = caseAndSplitValues[0];
            splitValue = caseAndSplitValues.length > 1 ? caseAndSplitValues[1] : 0;
        }

        this.state = {
            caseValue: caseValue,
            splitValue: splitValue
        }
    }

    componentWillReceiveProps(nextProps) {
        const value = nextProps.value;
        let caseValue = 0;
        let splitValue = 0;
        if (value) {
            let caseAndSplitValues = (value + "").split("+");
            caseValue = caseAndSplitValues[0] ? caseAndSplitValues[0] : 0;
            splitValue = caseAndSplitValues.length > 1 ? caseAndSplitValues[1] : 0;
        }
        this.setState({
            caseValue: caseValue,
            splitValue: splitValue
        });
    }

    onCaseChange = (value) => {
        let valueChanged = (value == null || value == '' || value == 'null' || isNaN(value)) ? 0 : value;
        this.setState({
            caseValue: valueChanged
        });

        const { caseValue, splitValue } = this.state;
        if (this.props.onChange) {
            if (!splitValue) {
                this.props.onChange(valueChanged);
            } else {
                this.props.onChange(valueChanged + "+" + splitValue);
            }
        }
    }

    onSplitChange = (value) => {
        let valueChanged = /^\d+(\.\d+)?$/.test(value) === false ? 0 : value;

        this.setState({
            splitValue: valueChanged
        });

        const { caseValue, splitValue } = this.state;

        let caseValueStr = 0;
        if (caseValue) {
            caseValueStr = caseValue;
        }
        if (this.props.onChange) {
            if (!valueChanged) {
                this.props.onChange(caseValueStr);
            } else {
                this.props.onChange(caseValueStr + "+" + valueChanged);
            }
        }
    }

    render() {
        const { caseValue, splitValue } = this.state;
        const caseNumberProps = {
            placeholder: '整件数',
            precision: 0,
            min: 0,
            // max: 1000000,
            onChange: this.onCaseChange,
        };
        if (caseValue || caseValue === 0) {
            caseNumberProps.value = caseValue;
        }
        const splitNumberProps = {
            placeholder: '零散数',
            precision: 4,
            min: 0,
            max: this.props.maxSplit? Number(Subtr(this.props.maxSplit,0.0001)):100000000,
            onChange: this.onSplitChange,
            // formatter: (value) => {
            //     if (value && /^\d+(\.\d+)?$/.test(value))
            //         return parseFloat(value);
            // }
        };

        if (splitValue || splitValue === 0) {
            splitNumberProps.value = splitValue;
        }

        return (
            <div>
                <InputNumber id='case' style={{ width: '50%' }} {...caseNumberProps} />
                <InputNumber id='split' style={{ width: '50%' }} {...splitNumberProps} />
            </div>
        );
    }
}