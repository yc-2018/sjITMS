import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { placeholderChooseLocale } from '@/utils/CommonLocale';

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
@connect(({ dockGroupConfig }) => ({
  dockGroupConfig
}))
export default class DockGroupSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      options: []
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'dockGroupConfig/queryByDcUuid',
      payload: {
        dcUuid: loginOrg().uuid
      },
      callback: (res) => {
        let options = [];
        if (this.props.hasAll) {
          options.push(<Select.Option key="all" value=''> 全部 </Select.Option>);
        }
        const that = this;
        let hasValue = false;

        let data = res.data;
        Array.isArray(data) && data.forEach(function (dg) {
          // 如果当前value于查询出的数据都不一致 则value展示为 undefined
          let reVal = JSON.stringify({
            uuid: dg.dockGroup.uuid,
            code: dg.dockGroup.code,
            name: dg.dockGroup.name
          });
          if (reVal === that.state.value) {
            hasValue = true;
          }
          options.push(
            <Select.Option key={dg.dockGroup.uuid} value={reVal}> {'[' + dg.dockGroup.code + ']' + dg.dockGroup.name} </Select.Option>
          );
        });
        if (hasValue == false && !Array.isArray(this.state.value)) {
          that.setState({
            value: undefined,
            options: options
          })
        } else {
          that.setState({
            options: options
          });
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value ? nextProps.value : undefined
    });
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
      allowClear: this.props.allowClear,
      value: this.state.value,
      style: this.props.style,
      autoFocus: this.props.autoFocus ? true : false,
      placeholder: placeholderChooseLocale('码头集'),
    };
    if (this.state.value) {
      selectProps.value = this.state.value;
    } else if (this.state.value == undefined || this.state.value === '') {
      selectProps.value = this.state.value;
    }
    return (
      <Select {...selectProps} id='dockGroupCollectBin'>
        {this.state.options}
      </Select>
    );
  }
}
