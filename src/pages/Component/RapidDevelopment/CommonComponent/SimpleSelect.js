/*
 * @Author: Liaorongchang
 * @Date: 2022-02-10 14:16:00
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-02-25 11:44:40
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { selectCoulumns } from '@/services/quick/Quick';

/**
 * 简易查询下拉选择控件
 *
 * 支持form表单initialValue设置初始值，也可通过属性value设置初始值,形式为JSON.stringify(entity.owner)
 * 支持通过form表单获取控件值，获取到的为货主字符串形式的ucn，可通过JSON.parse(fieldName)转换格式
 * hasAll：包含全部选项，可用于搜索条件;全部选项值为''
 * disabled：是否禁用；multiple：是否多选；onlyOnline：是否只查询启用状态的货主
 */
export default class SimpleSelect extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { selectData: [] };
  }

  componentDidMount() {
    this.initData();
  }

  initData = () => {
    if (this.props.showSearch) {
      this.setState({ selectData: [] });
    } else {
      const { data } = this.props;
      const sourceData = data instanceof Array ? data : JSON.parse(data);
      this.setState({ selectData: sourceData });
    }
  };

  buildOptions = () => {
    const { selectData } = this.state;
    return selectData.map(data => {
      return <Select.Option value={data.value}>{data.name}</Select.Option>;
    });
  };

  onChange = value => {
    // 用于form表单获取控件值
    if (this.props.onChange) this.props.onChange(value);
  };

  onFocus = async () => {
    this.initData();
  };

  onSearch = value => {
    const searchField = this.props.searchField;
    let params = new Array();
    params.push({
      field: searchField.fieldName,
      type: searchField.fieldType,
      rule: 'like',
      val: value,
    });
    this.getCoulumns({ queryParams: params });
  };

  getCoulumns = async pageFilters => {
    const payload = { superQuery: pageFilters, quickuuid: this.props.reportCode };
    const result = await selectCoulumns(payload);
    let sourceData = new Array();
    if (result.data != null) {
      result.data.forEach(sourceDatas => {
        sourceData.push({ value: sourceDatas, name: sourceDatas });
      });
      this.setState({ selectData: sourceData });
    }
  };

  render() {
    const { showSearch, value, searchField } = this.props;
    const selectProps = {
      allowClear: true,
      showSearch: showSearch,
      onChange: this.onChange,
      onSearch: this.onSearch,
      onFocus: this.onFocus,
      value: value == '' ? undefined : value,
      placeholder:
        (showSearch ? '请输入' : '请选择') +
        (searchField.fieldTxt ? searchField.fieldTxt : searchField.dbFieldTxt),
    };

    return <Select {...selectProps}>{this.buildOptions()}</Select>;
  }
}
