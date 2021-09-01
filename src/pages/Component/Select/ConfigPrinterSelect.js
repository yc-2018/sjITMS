import React, { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany } from '@/utils/LoginContext';

/**
* 已被配置的打印机下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值；
*/
@connect(({ printerConfig }) => ({
  printerConfig
}))
export default class ConfigPrinterSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      printerList: [],
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'printerConfig/getByDcUuid'
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.printerConfig.data && nextProps.printerConfig.data.printerConfigs) {
      this.setState({
        printerList: nextProps.printerConfig.data.printerConfigs.map(printer => printer.shortName)
      })
    }
    this.setState({
      value: nextProps.value
    });
  }

  buildOptions = () => {
    const { printerList, value } = this.state;
    let options = [];
    Array.isArray(printerList) &&
      printerList.forEach(function (item, index) {
        options.push(
          <Select.Option key={item} value={item}>{item}</Select.Option>
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
    const selectProps = {
      onChange: this.onChange,
      placeholder: '请选择打印机',
      value: this.state.value,
    };
    return (
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}