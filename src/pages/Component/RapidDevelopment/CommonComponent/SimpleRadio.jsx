import React, { Component } from 'react';
import { Radio } from 'antd';
import { dynamicQuery } from "@/services/quick/Quick";

/**
 * 单选框控件，可传入props同antd Radio
 * {string} textField 节点文本字段 
 * {string} valueField 值字段 
 * {string} data 选项数据，与 queryParams 冲突
 * {string} queryParams 数据查询参数
 */
export default class SimpleRadio extends Component {
    state = {
        options: []
    };

    // TODO 为什么会被挂载两次
    // TODO 如果数据的value字段和initialvalue的类型不一致，会导致无法匹配，如数值和字符串
    componentDidMount() {
        this.loadData();
    }

    loadData = async () => {
        const { textField, valueField, data, queryParams } = this.props;
        let sourceData;
        if(data){
            sourceData = JSON.parse(data);
        } else {
            const queryParamsJson = JSON.parse(queryParams);
            if (!queryParamsJson) {
                return;
            }
            const apiResult = await dynamicQuery(queryParamsJson);
            if (!apiResult || !apiResult.success || !Array.isArray(apiResult.result.records)) {
                return;
            }
            sourceData = apiResult.result.records;
        }
        this.setState({ options: convertData2Options(sourceData, textField, valueField) });
    }

    render() {
        // 将父组件传过来的属性传递下去，以适应Form、getFieldDecorator等处理
        return (
            <Radio.Group
                {...this.props}
                options={this.state.options}
            />
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
function convertData2Options(sourceData, textField, valueField) {
    return sourceData.map(x => { return { label: x[textField], value: x[valueField] } });
}