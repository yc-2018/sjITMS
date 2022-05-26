/*
 * @Author: Liaorongchang
 * @Date: 2022-02-10 14:16:00
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-26 11:55:57
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { selectCoulumns, dynamicQuery } from '@/services/quick/Quick';

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
    this.state = { sourceData: [] };
  }

  componentDidMount() {
    this.initData();
  }

  initData = async () => {
    let queryParamsJson;
    if (this.props.showSearch) {
      this.setState({ sourceData: [] });
    } else {
      const { dictCode } = this.props;
      if (dictCode) {
        queryParamsJson = {
          tableName: 'V_SYS_DICT_ITEM',
          condition: {
            params: [{ field: 'DICT_CODE', rule: 'eq', val: [dictCode] }],
          },
        };
        const response = await dynamicQuery(queryParamsJson);
        if (!response || !response.success || !Array.isArray(response.result.records)) {
          this.setSourceData([]);
        } else {
          this.setSourceData(response.result.records);
        }
      }
    }
  };

  /**
   * 设置state的数据源
   */
  setSourceData = sourceData => {
    const { textField, valueField } = this.props;
    if (this.props.onSourceDataChange) {
      this.props.onSourceDataChange(sourceData);
      return;
    }
    this.setState({
      sourceData: sourceData,
    });
  };

  buildOptions = () => {
    const { sourceData } = this.state;
    return sourceData.map(data => {
      return <Select.Option value={data.VALUE}>{data.NAME}</Select.Option>;
    });
  };

  onChange = value => {
    // 用于form表单获取控件值
    if (this.props.onChange) {
      this.props.onChange(value);
    }
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
    params = [...params, ...this.props.isOrgQuery];
    this.getCoulumns({ queryParams: params }, value);
  };

  getCoulumns = async (pageFilters, value) => {
    const payload = { superQuery: pageFilters, quickuuid: this.props.reportCode };
    const result = await selectCoulumns(payload);
    let sourceData = new Array();
    if (result.data != null) {
      result.data.forEach(sourceDatas => {
        sourceData.push({ NAME: sourceDatas, VALUE: sourceDatas });
      });
    } else {
      sourceData.push({ NAME: value, VALUE: value });
    }
    this.setState({ sourceData: sourceData });
  };

  render() {
    return (
      <Select
        {...this.props}
        // onChange={this.onChange}
        onSearch={this.onSearch}
        onFocus={this.onFocus}
      >
        {this.buildOptions()}
      </Select>
    );
  }
}
