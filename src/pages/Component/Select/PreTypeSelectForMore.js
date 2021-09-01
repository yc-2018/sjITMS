import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { PRETYPE } from '@/utils/constants';

/**
* 预定义类型下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值；
*/
@connect(({ pretype }) => ({
    pretype
}))
export default class PreTypeSelectForMore extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            typeNames: props.typeNames,
        }
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.typeNames&&this.props.typeNames!=nextProps.typeNames){
            this.setState({
                typeNames: nextProps.typeNames,
            })
        }

        this.setState({
            value: nextProps.value
        });
    }

    buildOptions = () => {
        const { typeNames } = this.state;
        let options = [];
        if (this.props.hasAll) {
            options.push(<Select.Option key={this.props.pretype + 'All'} value=''> 全部 </Select.Option>);
        }
        Array.isArray(typeNames) &&
            typeNames.forEach(function (item, index) {
                options.push(
                    <Select.Option key={index} value={item} >
                        <EllipsisCol colValue={item} />
                    </Select.Option>
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
        const { typeNames,value } = this.state;
        let isHave = false;
        let newValue=undefined;
        Array.isArray(typeNames) &&
            typeNames.forEach(function (item, index) {
                if (item == value) {
                    isHave = true;
                }
            });
        if (isHave == true) {
            newValue =value;
        }
        const selectProps = {
            disabled: this.props.disabled,
            mode: this.props.mode,
            onChange: this.onChange,
            placeholder: this.props.placeholder,
            defaultValue: this.props.defaultValue,
            value: newValue
        };
       

        return (
            <Select style={{ width: this.props.width ? this.props.width : '100%' }} {...selectProps} id='preType' allowClear>
                {this.buildOptions()}
            </Select>
        );
    }
}
