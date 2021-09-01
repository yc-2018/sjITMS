import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany,loginOrg } from '@/utils/LoginContext';

/**
 * 类型下拉框
 *
 * 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
 * 不传single属性时为多选模式，json串的数组
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
 * 设置autoFocus属性,则会定位焦点
 */
@connect(({ pretype }) => ({
  pretype
}))
export default class TypeSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      pageFilter: {
        page: 0,
        pageSize: 0,
        sortFields: {},
        searchKeyValues: {
          orgUuid: loginOrg().uuid,
          preType:'ALCNTCTYPE'
        },
      },
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }

  componentDidMount() {
    const { pageFilter } = this.state;
    this.props.dispatch({
      type: 'pretype/query',
      payload: pageFilter
    });
  }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll) {
      options.push(<Select.Option key="all" value={''} > 全部 </Select.Option>);
    }
    let data = this.props.pretype.data.list;
    const that = this;
    Array.isArray(data) && data.forEach(function (item) {
      options.push(
        <Select.Option key={item.uuid} value={item.name}> {item.name} </Select.Option>
      );
    });
    return options;
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
    return (
      <Select id='type' disabled={this.props.disabled} value={this.state.value} placeholder={this.props.placeholder} mode={this.props.multiple ? 'multiple' : ''} onChange={this.onChange}>
        {this.buildOptions()}
      </Select>
    );
  }
}
