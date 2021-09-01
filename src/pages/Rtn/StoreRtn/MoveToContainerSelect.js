import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { stockState } from '@/utils/StockState';
import { getStateCaption, containerState } from '@/utils/ContainerState';

import { loginCompany, loginOrg } from '@/utils/LoginContext';

@connect(({ container }) => ({
    container
}))
export default class MoveToContainerSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            binCode: props.binCode
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value,
            binCode: nextProps.binCode
        });

        if (this.props.value !== nextProps.value) {
            this.onSearch(nextProps.value);
        }
    }

    componentDidMount() {
        const { value } = this.state;
        if (value) {
            this.onSearch(value);
        }
    }

    buildOptions = () => {
        let options = [];
        if (this.props.hasAll && this.props.single) {
            options.push(<Select.Option key="all" value='' > 全部 </Select.Option>);
        }
        let data = this.props.container.containers;
        Array.isArray(data) && data.forEach(function (container) {
            options.push(
                <Select.Option key={container.barcode} value={JSON.stringify({
                    barcode: container.barcode,
                    state: container.state,
                })}> {'[' + container.barcode + ']' + getStateCaption(container.state)} </Select.Option>
            );
        });
        return options;
    }

    onSearch = (value) => {
        const { dispatch, binCode } = this.props;

        let searchKeyValues = {
            companyUuid: loginCompany().uuid,
            dcUuid: loginOrg().uuid,
        }

        if (binCode) {
            searchKeyValues['binCode'] = binCode;
        }

        if (value) {
            searchKeyValues['barcodeLike'] = value;
        }

        dispatch({
            type: 'container/queryIdleAndThisPostionUseing',
            payload: {
                recordCount: 20,
                ...searchKeyValues
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

        // 暂时去掉校验
        // if (this.state.value) {
        //     selectProps.value = this.state.value;
        // }
        selectProps.value = this.state.value;
        return (
            <Select {...selectProps} placeholder={this.props.placeholder}>
                {this.buildOptions()}
            </Select>
        );
    }
}
