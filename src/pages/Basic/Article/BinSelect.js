import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { MAX_INTEGER_VALUE, STATE } from '@/utils/constants';

/**
* 货位下拉选择控件
*
* 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.bin)
* 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
* hasAll：包含全部选项，可用于搜索条件;全部选项值为''
* disabled：是否禁用；
* multiple：是否多选；
*
*/
@connect(({ bin }) => ({
  bin
}))
export default class BinSelect extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      binList: [],
      binCodes: [],
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.bin.binListBusiness != nextProps.bin.binListBusiness) {
      if (Array.isArray(nextProps.bin.binListBusiness)) {
        let binCodes = [];
        nextProps.bin.binListBusiness.map(item => {
          binCodes.push(item.code)
        })
        if (Array.isArray(this.props.initBinCodes)) {
          this.props.initBinCodes.forEach(item => {
            if (binCodes.indexOf(item) === -1) {
              binCodes.push(item)
            }
          })
        }
        this.setState({
          binList: binCodes
        })
      }
    }
    this.setState({
      value: nextProps.value
    });
    if (this.props.value !== nextProps.value) {
      if (nextProps.value) {
        this.onSearch(nextProps.value.indexOf("code") != -1 ? JSON.parse(nextProps.value).code : nextProps.value);
      }
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value)
      this.onSearch(value);
  }

  buildOptions = () => {
    let options = [];

    let data = this.state.binList;

    Array.isArray(data) && data.forEach(function (item, index) {
      options.push(
        <Select.Option key={index} value={item}> {item} </Select.Option>
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

  onSearch=(value)=>{
    const { dispatch, initBinCodes } = this.props;

    dispatch({
      type: 'bin/queryBinForArticleBusiness',
      payload: {
        page:0,
        pageSize:MAX_INTEGER_VALUE,
        searchKeyValues:{
          companyUuid:loginCompany().uuid,
          dcUuid:loginOrg().uuid,
          code: value,
        },
      },
    });
  }

  render() {
    const { multiple } = this.props;
    const selectProps = {
      disabled: this.props.disabled,
      style: this.props.style,
      mode: multiple ? 'multiple' : '',
      showSearch: true,
      onChange: this.onChange,
      onSearch:this.onSearch,
      placeholder: this.props.placeholder,
      value: this.state.value,
      allowClear: true
    };

    return (
      <Select {...selectProps}>
        {this.buildOptions()}
      </Select>
    );
  }
}
