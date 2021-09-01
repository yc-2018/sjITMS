import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* 货主下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值；
* 支持通过form表单获取控件值，获取到的为货主的uuid，如要获取ucn请给控件加ownerChange事件
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的货主
* 
*/
@connect(({ owner }) => ({
  owner
}))
export default class OwnerSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'owner/query',
      payload: {
        page: 0,
        pageSize: 0,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          state: this.props.onlyOnline ? STATE.ONLINE : ''
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
      options.push(<Select.Option key="all" value='' > 全部 </Select.Option>);
    }

    this.props.owner.data.list.forEach(function (owner) {
      options.push(
        <Select.Option key={owner.uuid} value={owner.code}> {'[' + owner.code + ']' + owner.name} </Select.Option>
      );
    });
    return options;
  }

  onChange = (value) => {
    let ucnValue;
    if (value) {
      this.props.owner.data.list.forEach(function (owner) {
        if (owner.code === value) {
          ucnValue = {
            uuid: owner.uuid,
            code: owner.code,
            name: owner.name
          };
        }
      });
    }

    this.setState({ value: value });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(value);

    // 用于获取控件ucn值
    if (this.props.ownerChange)
      this.props.ownerChange(ucnValue);
  }

  render() {
    return (
      <Select disabled={this.props.disabled} value={this.state.value} placeholder={this.props.placeholder} mode={this.props.multiple ? 'multiple' : ''} onSearch={this.onSearch} showSearch={true} onChange={this.onChange}>
        {this.buildOptions()}
      </Select>
    );
  }
}
