import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

/**
 * 货位类型下拉框选择控件
 * 支持单选和多选，通过设置mode属性等于“multiple”实现多选
 * 支持form表单获取value，单选时值为ucn的json串，多选时值为json串的列表
 * 设置hasAll属性，会在下拉选项中增加全部选项，可用于搜索条件
 * 设置autoFocus属性,则会定位焦点
 */
@connect(({ binType }) => ({
    binType
}))
export default class BinTypeSelect extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            width: props.width
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'binType/query',
            payload: {
                page: 0,
                pageSize: 30,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    dcUuid: loginOrg().uuid
                }
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
    }

    buildOptions = () => {
        let options = [];
        if (this.props.hasAll) {
            options.push(<Select.Option key='all' value=''> 全部 </Select.Option>);
        }
        let data = this.props.binType.data.list;
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
        const binTypeSelectProps = {
            disabled: this.props.disabled,
            placeholder: this.props.placeholder,
            mode: this.props.mode,
            onChange: this.onChange,
            value :this.state.value,
            autoFocus:this.props.autoFocus?true:false
        };
        return (
            <Select {...binTypeSelectProps} style={{ 'width':this.state.width}} id='binType'>
                {this.buildOptions()}
            </Select>
        );
    }
}
