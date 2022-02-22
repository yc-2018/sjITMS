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
 * {boolean} autoComplete 是否为下拉搜索框
 * {boolean} showSearch 是否允许文本搜索
 */
export default class SimpleAutoComplete extends Component {
    state = {
        sourceData: [],
        options: []
    };

    @Bind()
    @Debounce(300)
    onSearch(searchText) {
        const { textField, valueField, searchField, queryParams } = this.props;
        const searchFields = searchField.split(',');
        if (searchText == "") {
            return;
        }
        const queryParamsJson = JSON.parse(queryParams);
        if (!queryParamsJson) {
            return;
        }
        this.autoCompleteFetchData(searchText, searchFields, queryParamsJson).then(sourceData => {
            this.setState({ sourceData: sourceData, options: convertData2Options(sourceData, textField, valueField, searchFields) });
        });
    }

    componentDidMount() {
        // 非搜索直接进来就加载数据
        if (!this.props.autoComplete) {
            const { textField, valueField, searchField, queryParams } = this.props;
            const searchFields = searchField.split(',');
            const queryParamsJson = JSON.parse(queryParams);
            if (!queryParamsJson) {
                return;
            }
            this.listFetchData(queryParamsJson).then(sourceData => {
                this.setState({ sourceData: sourceData, options: convertData2Options(sourceData, textField, valueField, searchFields) });
            });
        }
    }

    /**
     * 下拉搜索框加载数据
     * @param {*} queryParamsJson 查询条件
     * @returns 
     */
    listFetchData = async (queryParamsJson) => {
        const response = await dynamicQuery(queryParamsJson);
        if (!response || !response.success || !Array.isArray(response.result.records)) {
            return [];
        }
        return response.result.records;
    }

    /**
     * autoComlete搜索数据
     * @param {string} searchText 查询键
     * @param {string[]} searchFields 查询字段
     * @param {*} queryParamsJson 数据源查询参数
     * @returns 
     */
    autoCompleteFetchData = async (searchText, searchFields, queryParamsJson) => {
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
            queryParamsJson.condition = { params: [{ nestCondition: queryParamsJson.condition }, { nestCondition: condition }] };
        }
        const response = await dynamicQuery(queryParamsJson);
        if (!response || !response.success || !Array.isArray(response.result.records)) {
            return [];
        }
        return response.result.records;
    }

    render() {
        let { searchField, autoComplete, showSearch } = this.props;
        let onSearch;
        const options = this.state.options.map(d => <Select.Option key={d.value} textfield={d.textField}>{d.label}</Select.Option>);

        if (autoComplete) {
            showSearch = true;
            onSearch = this.onSearch;
        }

        // 将父组件传过来的属性传递下去，以适应Form、getFieldDecorator等处理
        return (
            <Select
                {...this.props}
                optionLabelProp="textfield"     // 指定回填到选择框的 Option 属性
                optionFilterProp="children"
                showSearch={showSearch}
                onSearch={onSearch}
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
 * @param {string} valueField 查询字段
 * @returns 
 */
function convertData2Options(sourceData, textField, valueField, searchField) {
    return sourceData.map(row => {
        return { label: getFieldShow(row, textField), value: getFieldShow(row, valueField), textField: getFieldShow(row, textField) }
    });
}


/**
 * 获取定义字段的显示，允许通过 %字段名% 的方式插入值
 * @param {Map} rowData 原始数据
 * @param {String} str 用户定义的字段文本
 */
function getFieldShow(rowData, str) {
    var reg = /%\w+%/g;
    var matchFields = str.match(reg);
    if (matchFields) {
        for (const replaceText of matchFields) {
            var field = replaceText.replaceAll("%", "");
            str = str.replaceAll(replaceText, rowData[field]);
        }
        return str;
    } else {
        return rowData[str];
    }
}