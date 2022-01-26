import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import { dynamicQuery } from "@/services/quick/Quick";

/**
 * 下拉树选择控件，可传入props同antd TreeSelect控件
 * {string} textField 节点文本字段 
 * {string} valueField 值字段 
 * {string} parentField 父节点字段 
 * {string} queryParams 数据查询参数
 */
export default class SimpleTreeSelect extends Component {
    state = {
        treeData: []
    };

    // TODO 为什么会被挂载两次
    componentDidMount() {
        this.loadData();
    }

    loadData = async () => {
        const { textField, valueField, parentField, queryParams } = this.props;
        console.log(this.props);
        const queryParamsJson = JSON.parse(queryParams);
        if (!queryParamsJson) {
            return;
        }
        const data = await dynamicQuery(queryParamsJson);
        if (!data || !data.success || !Array.isArray(data.result.records)) {
            return;
        }
        const sourceData = data.result.records;
        const treeData = convertData2TreeData(sourceData, textField, valueField, parentField);
        this.setState({ treeData: treeData });
    }

    render() {
        // 将父组件传过来的属性传递下去，以适应Form、getFieldDecorator等处理
        return (
            <TreeSelect
                {...this.props}
                treeData={this.state.treeData}
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
 * @returns 
 */
function convertData2TreeData(sourceData, textField, valueField, parentField) {
    function convert(parentId) {
        let parentData = sourceData
            .filter(x => x[parentField] == parentId)
            .map(x => { return { title: x[textField], value: x[valueField] } });
        parentData.forEach(x => x.children = convert(x.value));
        return parentData;
    }
    return convert(null);
}