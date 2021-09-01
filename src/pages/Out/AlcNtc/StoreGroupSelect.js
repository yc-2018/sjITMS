import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* 货主下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.owner)
* 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的货主
*/
@connect(({ storepickorder }) => ({
  storepickorder
}))
export default class StoreGroupSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'storepickorder/queryOrders',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          this.setState({
            storeGroup: response.data
          })
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
    let data = this.state.storeGroup;
      Array.isArray(data) && data.forEach(function (dg) {
        options.push(
          <Select.Option key={dg.uuid} value={dg.uuid}> {dg.code} </Select.Option>
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
      mode: multiple ? 'multiple' : '',
      onChange: this.onChange,
      onSearch: this.onSearch,
      placeholder: this.props.placeholder,
    };
    if (this.state.value) {
      selectProps['value'] = this.state.value;
    }else if ((this.state.value == undefined || this.state.value === '') && this.props.forItemTable == undefined) {
      selectProps.value = this.state.value;
    }

    return (
      <Select {...selectProps} id ='storeGroup'>
        {this.buildOptions()}
      </Select>
    );
  }
}
