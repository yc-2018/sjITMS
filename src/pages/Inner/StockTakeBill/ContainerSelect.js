import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';

/**
* 容器下拉选择控件
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
@connect(({ bin }) => ({
  bin
}))
export default class ContainerSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
    }
  }

  componentWillReceiveProps(nextProps) {
    // if (this.props.value !== nextProps.value) {
    //   if (nextProps.value) {
    //     this.onSearch(nextProps.value);
    //   }
    // }
  }

  // componentDidMount() {
  //   let value = this.state.value? this.state.value : "";
  //   this.onSearch(value);
  // }

  onSearch = (value) => {
    const { binCode } = this.props;
    this.setState({
      value: value
    })

    let payload = {};
    payload.binCode = binCode? binCode : '';

    if (value) {
      payload.containerLike = value;
    }

    this.props.dispatch({
      type: 'bin/getContainersByBinCode',
      payload: payload ? payload : {},
      callback: (response) => {
        if (response && response.success && response.data){
          this.setState({containers: response.data.containerList})
        }
      }
    });
  }

  buildOptions = () => {
    let options = [];
    let data = this.state.containers;
    Array.isArray(data) && data.forEach(function (barcode) {
      options.push(
        <Select.Option key={barcode} value={barcode}>
          {barcode}
        </Select.Option>
      );
    });
    if (data && data.length == 1){
      this.setState({
        value: this.props.bin.containers[0],
      })
    }
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
      onSelect: this.onChange,
      onSearch: this.onSearch,
      placeholder: this.props.placeholder,
      defaultValue: this.props.defaultValue
    };

    selectProps.value = this.props.value;

    return (
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}
