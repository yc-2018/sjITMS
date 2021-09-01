import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';

@connect(({ inc }) => ({
    inc,
}))
export default class IncContainerSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
    }

    buildOptions = () => {
        let options = [];

        let data = this.props.inc.containers;

        Array.isArray(data) && data.forEach(function (container) {
            options.push(
                <Select.Option key={container.barcode} value={container.barcode}> {container.barcode} </Select.Option>
            );
        });
        return options;
    }

    onSearch = (value) => {
        if (!this.props.binCode)
            return;
        let containers = this.props.inc.containers;
        if (Array.isArray(containers)) {
            let isExist = false;
            for (let x in containers) {
                if (containers[x].barcode === value) {
                    isExist = true;
                    break;
                }
            }
            if (isExist) {
                return;
            }
        }

        this.props.dispatch({
            type: 'inc/queryIncContainers',
            payload: {
                binCode: this.props.binCode,
                containerBarcode: value
            }
        });
    }

    onChange = (selectValue) => {
        this.setState({
            value: selectValue,
        });

        // 用于form表单获取控件值
        if (this.props.onChange)
            this.props.onChange(selectValue);
    }

    render() {
        const { single } = this.props;
        const selectProps = {
            showSearch: true,
            mode: single,
            onChange: this.onChange,
            onSearch: this.onSearch
        };

        if (this.state.value) {
            selectProps.value = this.state.value;
        }

        return (
            <Select {...selectProps} placeholder={this.props.placeholder}>
                {this.buildOptions()}
            </Select>
        );
    }
}
