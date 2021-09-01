import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

/**
 * 板位下拉框选择控件
 * 支持单选和多选，通过设置mode属性等于“multiple”实现多选
 * 支持form表单获取value，单选时值为ucn的json串，多选时值为json串的列表
 * 设置hasAll属性，会在下拉选项中增加全部选项，可用于搜索条件
 */
@connect(({ palletBin }) => ({
  palletBin,
}))
export default class PalletBinSelectByType extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value : '',
    };
  }

  componentDidMount() {
    const { value } = this.state;
    if (value)
      this.initialValue(value);
  }

  initialValue = (value) => {
    if (value) {
      this.onSearch(value);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
    });

    if (this.props.palletBinTypeUuid !== nextProps.palletBinTypeUuid) {
      this.onSearch(nextProps.value, nextProps.palletBinTypeUuid);
    }
  }

  buildOptions = () => {
    let options = [];

    let data = this.props.palletBin.data.list;
    Array.isArray(data) && data.forEach(function(dg) {
      options.push(
        <Select.Option key={dg.uuid} value={dg.barcode}> {dg.barcode} </Select.Option>,
      );
    });
    return options;
  };

  onSearch = (value, typeUuid) => {
    if (!this.props.palletBinTypeUuid || this.props.palletBinTypeUuid === '') {
      return;
    }
    this.props.dispatch({
      type: 'palletBin/query',
      payload: {
        page: 0,
        pageSize: 0,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          nameCode: value,
          palletBinTypeUuid: typeUuid? typeUuid : this.props.palletBinTypeUuid,
        },
        sortFields : {
          barcode: false,
        }
      }
    });
  }

  onChange = (value) => {
    this.setState({ value: value });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(value);
  };

  render() {
    const selectProps = {
      placeholder: this.props.placeholder,
      disabled: this.props.disabled,
      showSearch: true,
      onSearch: this.onSearch,
      onChange: this.onChange,
      value: this.state.value? this.state.value : '',
      autoFocus: this.props.autoFocus ? true : false,
    };

    return (
      <Select {...selectProps} >
        {this.buildOptions()}
      </Select>
    );
  }
}
