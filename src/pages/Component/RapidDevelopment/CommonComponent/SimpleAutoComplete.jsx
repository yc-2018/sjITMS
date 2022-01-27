import React, { Component } from 'react';
import { Select, Spin } from 'antd';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';

import { dynamicQuery } from "@/services/quick/Quick";

/**
 * 下拉列表输入框控件，可传入props同antd select
 * {string} textField 节点文本字段 
 * {string} valueField 值字段 
 * {string} searchField 查询字段 
 * {string} queryParams 数据查询参数
 */
export default class SimpleAutoComplete extends Component {
    state = {
        sourceData: [],
        options: []
    };

    @Bind()
    @Debounce(300)
    onSearch (searchText) {
        console.log("searchText", searchText);
        const { textField, valueField, searchField, queryParams } = this.props;
        const searchFields = searchField.split(',');
        if (searchText == "") {
            return;
        }
        const queryParamsJson = JSON.parse(queryParams);
        if (!queryParamsJson) {
            return;
        }
        this.fetchData(searchText, searchFields, queryParamsJson).then(sourceData => {
            this.setState({ sourceData: sourceData, options: convertData2Options(sourceData, textField, valueField, searchFields) });
        });
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
        let condition = { matchType: 'or', params: searchFields.map(field => { return { field: field, rule: 'like', val: [searchText] } }) };
        if (!queryParamsJson.condition) {
            // 如果数据源本身查询不带条件，则condition直接作为查询的条件
            queryParamsJson.condition = condition;
        } else {
            // 否则将原本的查询条件与condition作为两个子查询进行and拼接
            queryParamsJson.condition = { params: [{ nestCondition: queryParamsJson.condition }, {nestCondition: condition}] };
        }
        const response = await dynamicQuery(queryParamsJson);
        if (!response || !response.success || !Array.isArray(response.result.records)) {
            return [];
        }
        return response.result.records;
    }

    render() {
        const { searchField } = this.props;
        const searchFields = searchField.split(',');
        const options = this.state.options.map(d => <Select.Option key={d.value} textField={d.textField}>{d.label}</Select.Option>);
        // 将父组件传过来的属性传递下去，以适应Form、getFieldDecorator等处理
        return (
            <Select
                {...this.props}
                optionLabelProp="textField"
                optionFilterProp="children"
                showSearch
                onSearch={this.onSearch}
            >
                {options}
            </Select>
        );
    }
}

/**
 * 将表数组形式的数据转换为antd TreeSelect 控件能渲染的数据类型
 * @param {array} sourceData 数据源
 * @param {string} textField 节点文本字段
 * @param {string} valueField 值字段
 * @returns 
 */
function convertData2Options(sourceData, textField, valueField, searchFields) {
    return sourceData.map(row => { 
        // let value = {};
        // searchFields.forEach(field => {
        //     value[field] = row[field];
        // });
        // value[valueField] = row[valueField];
        let labels = [];
        searchFields.forEach(field => {
            labels.push(row[field]);
        });
        return { label: labels.join(' | '), value: row[valueField], textField: row[textField] } 
    });
}