/*
 * @Author: Liaorongchang
 * @Date: 2022-02-10 14:16:22
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-02-25 11:47:09
 * @version: 1.0
 */
import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import { dynamicQuery } from "@/services/quick/Quick";
import memoize from "memoize-one";

/**
 * 下拉树选择控件，可传入props同antd TreeSelect控件
 * {string} textField 节点文本字段 
 * {string} valueField 值字段 
 * {string} parentField 父节点字段 
 * {string} sonField 子节点字段 
 * {string} queryParams 数据查询参数
 * {boolean} isLink    是否为联动控件 
 * {string} linkFilter   联动过滤条件 {field:val}形式
 * {object} initialRecord  初始行记录，用作显示
 * {array} sourceData  原始数据
 */
export default class SimpleTreeSelect extends Component {
    state = {
        sourceData: undefined,
        preQueryStr: "",
        treeData: [],
        value: undefined
    };

    static defaultProps = {
        textField: "NAME",
        valueField: "UUID",
        parentField: "PARENTUUID"
    }

    // 在 sourceData, textField, valueField, parentField, sonField 变化时，重新运行 convertTreeData
    convertTreeData = memoize(
        (sourceData, textField, valueField, parentField) => convertData2TreeData(sourceData, textField, valueField, parentField)
    );

    getTreeData = () => this.convertTreeData(this.state.sourceData, this.props.textField, this.props.valueField, this.props.parentField, this.props.sonField)

    static getDerivedStateFromProps(props, state) {
        const nextState = {};
        const nextQueryStr = JSON.stringify({
            queryParams: props.queryParams,
            linkFilter: props.linkFilter
        });
        if (nextQueryStr != state.preQueryStr) {
            nextState.preQueryStr = nextQueryStr;
        }
        if (props.sourceData) {
            nextState.sourceData = props.sourceData;
        }
        if (props.initialRecord && !props.sourceData && !state.sourceData) {
            nextState.sourceData = [props.initialRecord];
        }
        nextState.value = typeof props.value == "object" ? props.value.value : props.value;
        return nextState;
    }

    componentDidMount() {
        if (!this.props.sourceData) {
            this.treeFetchData();
        }
    }

    componentDidUpdate = (_, preState) => {
        // 判断判断查询条件是否一致,如果一致则不加载
        if (preState.preQueryStr != this.state.preQueryStr) {
            this.treeFetchData();
        }
    }

    /**
     * 构建queryParams
     */
    getQueryParams = () => {
        const { queryParams, linkFilter } = this.props;
        let queryParamsJson;

        if (!queryParams) {
            return;
        }
        queryParamsJson = queryParams instanceof Object ? queryParams : JSON.parse(queryParams);

        if (linkFilter) {
            // 构建出联动筛选语句，过滤数据
            const linkFilterCondition = this.getLinkFilterCondition();
            // 构建失败,退出
            if (!linkFilterCondition) {
                return;
            }
            this.addCondition(queryParamsJson, linkFilterCondition);
        }
        return queryParamsJson;
    }

    /**
     * 增加condition
     */
    addCondition = (queryParams, condition) => {
        if (!queryParams.condition) {
            // 如果数据源本身查询不带条件，则condition直接作为查询的条件
            queryParams.condition = condition;
        } else if (!queryParams.condition.matchType || queryParams.condition.matchType == "and") {
            // 如果是and连接,则进行条件追加
            queryParams.condition.params.push({ nestCondition: condition });
        } else {
            // 否则将原本的查询条件与condition作为两个子查询进行and拼接
            queryParams.condition = {
                params: [{ nestCondition: queryParams.condition }, { nestCondition: condition }],
            };
        }
    }

    /**
     * 构建联动筛选的条件
     */
    getLinkFilterCondition = () => {
        const { linkFilter } = this.props;
        const params = [];
        for (const key in linkFilter) {
            const value = linkFilter[key];
            // 值为空的情况为异常
            if (value == null || value == undefined) {
                return;
            }
            params.push({ field: key, rule: 'eq', val: [value] });
        }
        return { params };
    }

    /**
     * 下拉搜索框加载数据
     */
    treeFetchData = async () => {
        const { isLink, linkFilter } = this.props;
        let queryParams = this.getQueryParams();

        // 如果是联动控件,但是没有传递linkFilter,则不加载数据
        if (!queryParams || (isLink && !linkFilter)) {
            return;
        }

        await this.loadData(queryParams);
    };

    loadData = async (queryParams) => {
        const response = await dynamicQuery(queryParams);
        if (!response || !response.success || !Array.isArray(response.result.records)) {
            this.setSourceData([]);
        } else {
            this.setSourceData(response.result.records);
        }
        // 重新加载完数据后,看数据源中是否还有对应的value,没有则清除控件值
        let data = this.findData(this.state.value);
        if (!data && this.state.value != undefined) {
            this.onChange(undefined);
        }
    }

    /**
     * 设置state的数据源
     */
    setSourceData = (sourceData) => {
        if (this.props.onSourceDataChange) {
            this.props.onSourceDataChange(sourceData);
            return;
        }
        this.setState({
            sourceData: sourceData,
        });
    }

    findData = value => {
        let data;
        const seek = (list, value) => {
            for (const item of list) {
                if (item.value == value) {
                    data = item.data;
                    return;
                }
                if (item.children) {
                    seek(item.children, value);
                }
            }
        }
        seek(this.getTreeData(), value);
        return data;
    }

    /**
     * 值更新事件
     */
    onChange = (value) => {
        if (this.props.onChange) {
            let data = this.findData(value);
            if (!data) {
                data = {
                    value: undefined,
                    record: {}
                };
            }
            this.props.onChange(data)
        }
    }

    render() {
        // 将父组件传过来的属性传递下去，以适应Form、getFieldDecorator等处理
        return (
            <TreeSelect
                allowClear={true}
                {...this.props}
                optionFilterProp="children"
                treeData={this.getTreeData()}
                // 将value进行了一层包装，以方便日后扩展
                value={this.state.value}
                onChange={this.onChange}
            />
        );
    }
}

/**
 * 将表数组形式的数据转换为antd TreeSelect 控件能渲染的数据类型
 * @param {array} sourceData 数据源
 * @param {string} textField 节点文本字段
 * @param {string} valueField 值字段
 * @param {string} parentField 父节点字段
 * @param {string} sonField 子节点字段
 * @returns 
 */
function convertData2TreeData(sourceData, textField, valueField, parentField, sonField) {
    if (!sourceData) {
        return [];
    }
    sonField = sonField || valueField;
    function convert(parentId) {
        // 当parentId为null时，搜索parentId为null以及parentId不存在的数据作为最上级
        let parentData = sourceData
            .filter(row => parentId != null ? row[parentField] == parentId : 
                (row[parentField] == null || !sourceData.some(x => x[sonField] == row[parentField]) ))
            .map(row => {
                const textShow = getFieldShow(row, textField);
                const valueShow = getFieldShow(row, valueField);
                return {
                    title: textShow,
                    value: valueShow,
                    data: {
                        value: valueShow,
                        record: row
                    }
                }
            });
        // 防止死循环
        parentData.forEach(row => row.children = row.value != undefined ? convert(row.value) : []);
        return parentData;
    }
    return convert(null);
}


/**
 * 获取定义字段的显示，允许通过 %字段名% 的方式插入值
 * @param {Map} rowData 原始数据
 * @param {String} str 用户定义的字段文本
 */
function getFieldShow(rowData, str) {
    if (!rowData || !str) {
        return;
    }
    var reg = /%\w+%/g;
    var matchFields = str.match(reg);
    if (matchFields) {
        for (const replaceText of matchFields) {
            var field = replaceText.replaceAll('%', '');
            str = str.replaceAll(replaceText, rowData[field]);
        }
        return str;
    } else {
        return rowData[str];
    }
}