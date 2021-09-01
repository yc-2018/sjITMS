import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { addressToStr1 } from '@/utils/utils';
/**
 * 商品下拉框
 *
 * 支持单选和多选，传入属性single，表示单选，得到的值为商品ucn的json串
 * 不传single属性时为多选模式，json串的数组
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''，只用于single模式
 * 设置autoFocus属性,则会定位焦点
 */
@connect(({ vendor }) => ({
  vendor
}))
export default class DeliverySelectForPick extends PureComponent {
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
  }
  componentDidMount() {
    this.onSearch(null);
  }
  buildOptions = () => {
    let options = [];
    let data = this.props.vendor.dataForDeliverySelectForPick.list;
    const that = this;
    Array.isArray(data) && data.forEach(function (item) {
      options.push(
        <Select.Option key={item.uuid} value={JSON.stringify({
          uuid: item.uuid,
          code: item.code,
          name: item.name,
          type: 'Vendor',
          address: item.address ? addressToStr1(item.address) : '',
          contacter: item.contactor,
          contactNumber: item.contactPhone,
        })}> {'[' + item.code + ']' + item.name} </Select.Option>
      );
    });
    return options;
  }
  onSearch = (value) => {
    const { state } = this.props;
    let searchKeyValues = {
      state: state,
      codeName: value,
      companyUuid: loginCompany().uuid
    }
    this.props.dispatch({
      type: 'vendor/queryForDeliverySelectForPick',
      payload: {
        page: 0,
        pageSize: 0,
        searchKeyValues: {
          ...searchKeyValues
        },
        sortFields: {
          code: false
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
      filterOption:false,
      disabled: this.props.disabled?true:false
    };
    return (
      <Select {...selectProps} placeholder={this.props.placeholder} id='store'>
        {this.buildOptions()}
      </Select>
    );
  }
}
