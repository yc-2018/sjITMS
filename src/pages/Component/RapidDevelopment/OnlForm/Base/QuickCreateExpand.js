/*
 * @Author: Liaorongchang
 * @Date: 2022-02-15 11:31:01
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-02-22 10:40:30
 * @version: 1.0
 */
import { connect } from 'dva';
import React, { Component } from 'react';
import { Form } from 'antd';
import QuickCreatePage from './QuickCreatePage';
import { dynamicQuery } from '@/services/quick/Quick';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class QuickCreate extends QuickCreatePage {
  constructor(props) {
    super(props);
  }

  /**
   * 搜索数据
   * @param {string} searchText 查询键
   * @param {string[]} searchFields 查询字段
   * @param {*} queryParamsJson 数据源查询参数
   * @returns
   */
  fetchData = async (searchText, searchFields, queryParamsJson) => {
    // 分页查询
    queryParamsJson.pageNo = 1;
    queryParamsJson.pageSize = 20;
    // 构建出or语句，使得多个查询字段都能搜索到数据
    let condition = {
      matchType: 'or',
      params: searchFields.map(field => {
        return { field: field, rule: 'like', val: [searchText] };
      }),
    };
    if (!queryParamsJson.condition) {
      // 如果数据源本身查询不带条件，则condition直接作为查询的条件
      queryParamsJson.condition = condition;
    } else {
      // 否则将原本的查询条件与condition作为两个子查询进行and拼接
      queryParamsJson.condition = {
        params: [{ nestCondition: queryParamsJson.condition }, { nestCondition: condition }],
      };
    }
    const response = await dynamicQuery(queryParamsJson);
    if (!response || !response.success || !Array.isArray(response.result.records)) {
      return [];
    }
    return response.result.records;
  };

  handleChange = (
    value,
    tableName,
    dbFieldName,
    fieldShowType,
    line,
    fieldExtendJsons,
    onlFormFields
  ) => {
    if (line == undefined) {
      line = 0;
    } else if (line != 0) {
      line -= 1;
    }

    if (fieldShowType == 'date') {
      this.entity[tableName][line][dbFieldName] = value.format('YYYY-MM-DD');
    } else if (fieldShowType == 'number') {
      this.entity[tableName][line][dbFieldName] = value;
    } else if (fieldShowType == 'sel_tree') {
      this.entity[tableName][line][dbFieldName] = value;
    } else if (fieldShowType == 'radio') {
      this.entity[tableName][line][dbFieldName] = value.target.value;
    } else if (fieldShowType == 'list') {
      this.entity[tableName][line][dbFieldName] = value;
    } else if (fieldShowType == 'auto_complete') {
      this.entity[tableName][line][dbFieldName] = value;
    } else if (fieldShowType == 'textarea') {
      this.entity[tableName][line][dbFieldName] = value.target.value;
    } else {
      this.entity[tableName][line][dbFieldName] = value.target.value;
    }

    if (fieldExtendJsons.childComponent) {
      const onlFormField = onlFormFields.find(
        data => data.dbFieldName == fieldExtendJsons.childComponent
      );
      const { valueField, searchField, queryParams } = JSON.parse(onlFormField.fieldExtendJson);
      const searchFields = searchField.split(',');
      const queryParamsJson = JSON.parse(queryParams);

      this.fetchData(value, searchFields, queryParamsJson).then(sourceData => {
        const data = sourceData.length !== 0 ? sourceData[0][valueField] : '';
        this.props.form.setFieldsValue({ [tableName + fieldExtendJsons.childComponent]: data });
      });
    }
  };
}
