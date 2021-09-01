import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

/**
* 拣货方案商品下拉框
*
* 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
* 不传single属性时为多选模式，json串的数组
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
*
*/
export default class StockTakeBinSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      data: this.props.data
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
    //
    // if (this.props.value !== nextProps.value) {
    //   this.onSearch(nextProps.value);
    // }
  }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll && this.props.single) {
      options.push(<Select.Option key="all" value='' > 全部 </Select.Option>);
    }

    let data = this.props.data;
    Array.isArray(data) && data.forEach(function (item) {
      options.push(
        <Select.Option key={item.binCode} value={JSON.stringify({
          binCode: item.binCode,
          wrhUuid: item.wrhUuid
        })}>{item.binCode}</Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {
    const { data } = this.props;

    const newData = [];
    for (let item of data) {
      if (item.binCode.indexOf(value) > -1)
        newData.push(item)
    }

    this.setState({
      data: newData
    })
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
    const { value } = this.state;
    const selectProps = {
      showSearch: true,
      mode: single ? '' : 'multiple',
      onChange: this.onChange,
      onSearch: this.onSearch,
      defaultValue: this.props.defaultValue
    };

    if (value) {
      selectProps.value = value;
    }

    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}
