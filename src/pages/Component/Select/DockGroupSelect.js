import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

/**
* 货主下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值；
* 支持通过form表单获取控件值，获取到的为货主的uuid，如要获取ucn请给控件加ownerChange事件
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的货主
* forItemTable:传入改参数， 则为明细表格使用， 无form表单 无初值
* 设置autoFocus属性,则会定位焦点
*/
@connect(({ dock }) => ({
  dock
}))
export default class DockGroupSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'dock/getDockGroupByCompanyUuid',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
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
      options.push(<Select.Option key="all" value={' '} > 全部 </Select.Option>);
    }

    let data = this.props.dock.dockGroupList;
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
      placeholder: this.props.placeholder,
      allowClear: this.props.allowClear,
      value : this.state.value,
      style: this.props.style,
      autoFocus:this.props.autoFocus?true:false
    };

    // if (this.state.value) {
    //   selectProps.value = this.state.value;
    // } 
    // else if ((this.state.value == undefined || this.state.value === '') && this.props.forItemTable == undefined) {
    //   selectProps.value = this.state.value;
    // }

    return (
      <Select {...selectProps}  id='dockGroup'>
        {this.buildOptions()}
      </Select>
    );
  }
}