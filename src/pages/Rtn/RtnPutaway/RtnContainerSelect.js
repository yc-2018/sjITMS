import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { binUsage } from '@/utils/BinUsage';
import { containerState } from '@/utils/ContainerState';
import { stockState } from '@/utils/StockState';

/**
* 容器下拉选择控件（库存表查询数据）
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.container)
* 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；
* multiple：是否多选；
* usage: 用途，
* state：容器状态
* 
*/
@connect(({ stock }) => ({
  stock
}))
export default class RtnContainerSelect extends PureComponent {
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
      if (nextProps.value) {
        this.onSearch(nextProps.value);
      }
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value)
      this.onSearch(value);
  }

  onSearch = (value) => {
    const { dispatch, ownerUuid } = this.props;
    const { stockFilter } = this.state;

    if (!ownerUuid) {
      return;
    }

    dispatch({
      type: 'stock/pageQuery',
      payload: {
        page: 0,
        pageSize: 20,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: ownerUuid,
        binUsages: [binUsage.VendorRtnReceiveTempBin.name],
        containerBarcode: value,
        state: stockState.NORMAL.name
      }
    });
  }

  buildOptions = () => {
    let options = [];
    let data = this.props.stock.data.list;

    const containers = [];
    Array.isArray(data) && data.forEach(function (stock) {
      if (stock.containerBarcode && containers.indexOf(stock.containerBarcode) === -1) {
        options.push(
          <Select.Option key={stock.containerBarcode}
            value={JSON.stringify({
              barcode: stock.containerBarcode,
              bincode: stock.binCode
            })}>
            {stock.containerBarcode}
          </Select.Option>
        );

        containers.push(stock.containerBarcode)
      }
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
      showSearch: true,
      mode: multiple ? 'multiple' : '',
      onChange: this.onChange,
      onSearch: this.onSearch,
      placeholder: this.props.placeholder,
      defaultValue: this.props.defaultValue
    };

    if (this.state.value) {
      selectProps.value = this.state.value;
    }

    return (
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}