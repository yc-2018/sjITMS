import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany,loginOrg } from '@/utils/LoginContext';

/**
 * 订单选择下拉框
 */
@connect(({ order }) => ({
  order
}))
export default class OrderBillNumberSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      list:[]
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
    if(this.props.order!=nextProps.order){
      this.setState({
        list:[...nextProps.order.data.list]
      })
    }
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
    this.state.list.forEach(function (order) {
      options.push(
        <Select.Option key={order.billNumber} value={order.billNumber}>
          {order.billNumber+"["+order.sourceBillNumber+"]"}
        </Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {
    this.props.dispatch({
      type: 'order/query',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          states: this.props.states ? this.props.states : '',
          billNumberAndSource: value,
        },
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
      onChange: this.onChange,
      onSearch: this.onSearch,
      value: this.state.value,
      placeholder: '请输入订单号',
      filterOption:false
    };

    return (
      <Select {...selectProps} id='orderBillNumber'>
        {this.buildOptions()}
      </Select>
    );
  }
}
