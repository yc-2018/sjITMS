import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { placeholderChooseLocale, commonLocale } from '@/utils/CommonLocale';

/**
* 线路体系下拉选择控件
* 属性：支持form表单initialValue设置初始值，也可通过属性value设置初始值；hasAll：包含全部选项，可用于搜索条件;
* disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的货主
* 事件：ownerChange，valueChange事件，默认的onChange事件获取的value为选中货主的代码，ownerChange获取的值为选中货主的ucn
*/
@connect(({ dispatchSerialArch }) => ({
    dispatchSerialArch
}))
export default class SerialArchDispatchCenterSelect extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'dispatchSerialArch/getOnlineSerialArchs',
            payload: {
                companyUuid: loginCompany().uuid,
                dispatchCenterUuid : loginOrg().uuid
            },
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.dispatchSerialArch.onLineList;

        if (this.props.hasAll)
            options.push(<Select.Option key="all" value='' > 全部 </Select.Option>);
        Array.isArray(data) && data.forEach(function (dg) {
            options.push(
                <Select.Option key={dg.uuid} value={JSON.stringify({
                    uuid: dg.uuid,
                    code: dg.code,
                    name: dg.name
                })}> {'[' + dg.code + ']' + dg.name} </Select.Option>
            );
        });

        return options;
    }

    onChange = (value) => {
        this.setState({ value: value });
        // 用于form表单获取控件值
        if (this.props.onChange)
            this.props.onChange(value);
    }

    render() {
        const { multiple } = this.props;
        const selectProps = {
            disabled: this.props.disabled,
            mode: multiple ? 'multiple' : '',
            onChange: this.onChange,
            onSearch: this.onSearch,
            placeholder: this.props.placeholder ? this.props.placeholder : placeholderChooseLocale(),
            autoFocus:true
        };

        selectProps.value = this.state.value;

        return (
            <Select {...selectProps} style={{width:'100%'}}>
                {this.buildOptions()}
            </Select>
        );
    }
}