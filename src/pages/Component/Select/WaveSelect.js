import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

/**
 * 商品下拉框
 *
 * 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
 * 不传single属性时为多选模式，json串的数组
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
 * 设置autoFocus属性,则会定位焦点
 */
@connect(({ wave }) => ({
  wave
}))
export default class WaveSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });

    if (this.props.value !== nextProps.value) {
      this.onSearch(nextProps.value);
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value)
      this.onSearch(value);
  }

  buildOptions = () => {
    let options = [];
    let data = this.props.wave.data.list;
    const that = this;
    Array.isArray(data) && data.forEach(function (item) {
      options.push(
        <Select.Option key={item.uuid} value={item.billNumber}> {item.billNumber} </Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {
    this.props.dispatch({
      type: 'wave/query',
      payload: {
        page: 0,
        pageSize: 10,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          billNumber: value
        }
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
      mode: single ? '' : 'multiple',
      onChange: this.onChange,
      onSearch: this.onSearch,
      value: this.state.value,
      autoFocus:this.props.autoFocus?true:false,
      filterOption:false
    };

    return (
      <Select {...selectProps} placeholder={this.props.placeholder} id='wave'>
        {this.buildOptions()}
      </Select>
    );
  }
}
