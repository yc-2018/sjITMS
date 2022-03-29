import React, { Component } from 'react';
import { Select, Spin } from 'antd';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import memoize from "memoize-one";

import { dynamicQuery } from '@/services/quick/Quick';

/**
 * 下拉列表输入框控件，可传入props同antd select
 * {string} textField 节点文本字段 默认值：NAME
 * {string} valueField 值字段     默认值：VALUE
 * {string} searchField 查询字段  默认值：VALUE
 * {string} queryParams 数据查询参数
 * {string} dictCode 字典编码,与queryParams冲突,字典编码优先
 * {boolean} isLink    是否为联动控件 
 * {string} linkFilter   联动过滤条件 {field:val}形式
 * {object} initialRecord  初始行记录，用作显示
 * {function} onSourceDataChange  查询数据发生变化事件
 * {array} sourceData  原始数据
 * {boolean} autoComplete 是否为下拉搜索框
 * {boolean} showSearch 是否允许文本搜索
 */
export default class SimpleAutoComplete extends Component {
  state = {
    sourceData: undefined,
    preQueryStr: "",
    value: undefined
  };

  static defaultProps = {
    textField: "NAME",
    valueField: "VALUE",
    searchField: "VALUE"
  }

  @Bind()
  @Debounce(300)
  onSearch(searchText) {
    if (searchText == '') {
      return;
    }
    this.autoCompleteFetchData(searchText);
  }

  // 在 sourceData, textField, valueField 变化时，重新运行 getOptions
  convertOptions = memoize(
    (sourceData, textField, valueField) => convertData2Options(sourceData, textField, valueField)
  );

  getOptions = () => this.convertOptions(this.state.sourceData, this.props.textField, this.props.valueField)

  static getDerivedStateFromProps(props, state) {
    const nextState = {};
    const nextQueryStr = JSON.stringify({
      dictCode: props.dictCode,
      queryParams: props.queryParams,
      linkFilter: props.linkFilter
    });
    if (nextQueryStr != state.preQueryStr) {
      nextState.preQueryStr = nextQueryStr;
    }
    if (props.sourceData){
      nextState.sourceData = props.sourceData;
    }
    if (props.initialRecord && !props.sourceData && !state.sourceData) {
      nextState.sourceData = [props.initialRecord];
    }
    nextState.value = typeof props.value == "object" ? props.value.value : props.value;
    return nextState;
  }

  componentDidMount() {
    // 非搜索直接进来就加载数据
    if (!this.props.sourceData && !this.props.autoComplete) {
      this.listFetchData();
    }
  }

  componentDidUpdate(_, preState) {
    // 判断判断查询条件是否一致,如果一致则不加载
    if (preState.preQueryStr != this.state.preQueryStr) {
      this.listFetchData();
    }
  }

  /**
   * 构建queryParams
   */
  getQueryParams = () => {
    const { queryParams, dictCode, linkFilter } = this.props;
    let queryParamsJson;
    // 字典查询优先
    if (dictCode) {
      queryParamsJson = {
        tableName: "V_SYS_DICT_ITEM", condition: {
          params: [{ field: "DICT_CODE", rule: "eq", val: [dictCode] }],
        }
      }
    } else {
      if (!queryParams) {
        return;
      }
      queryParamsJson = queryParams instanceof Object ? queryParams : JSON.parse(queryParams);
    }

    if (linkFilter) {
      // 构建出联动筛选语句，过滤数据
      const linkFilterCondition = this.getLinkFilterCondition();
      // 构建失败,退出
      if(!linkFilterCondition){
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
   * 构建查询筛选的条件
   * @param {*} searchText 查询值
   */
  getSearchCondition = (searchText) => {
    const { searchField } = this.props;
    // 构建出or语句，使得多个查询字段都能搜索到数据
    return {
      matchType: 'or',
      params: searchField.split(',').map(field => {
        return { field: field, rule: 'like', val: [searchText] };
      }),
    };
  }

  /**
   * 下拉搜索框加载数据
   */
  listFetchData = async () => {
    const { isLink, linkFilter } = this.props;
    let queryParams = this.getQueryParams();

    // 如果是联动控件,但是没有传递linkFilter,则不加载数据
    if (!queryParams || (isLink && !linkFilter)) {
      return;
    }

    await this.loadData(queryParams);
  };

  /**
   * autoComlete搜索数据
   * @param {string} searchText 查询键
   */
  autoCompleteFetchData = async (searchText) => {
    const { isLink, linkFilter } = this.props;
    const queryParams = this.getQueryParams();

    // 如果是联动控件,但是没有传递linkFilter,则不加载数据
    if (!queryParams || (isLink && !linkFilter)) {
      return;
    }

    // 分页查询
    queryParams.pageNo = 1;
    queryParams.pageSize = 20;
    // 构建出or语句，使得多个查询字段都能搜索到数据
    const searchCondition = this.getSearchCondition(searchText);
    this.addCondition(queryParams, searchCondition);

    await this.loadData(queryParams);
  };

  /**
   * 设置state的数据源
   */
  setSourceData = (sourceData) => {
    const { textField, valueField } = this.props;
    if (this.props.onSourceDataChange) {
      this.props.onSourceDataChange(sourceData);
      return;
    }
    this.setState({
      sourceData: sourceData,
    });
  }

  loadData = async (queryParams) => {
    const response = await dynamicQuery(queryParams);
    if (!response || !response.success || !Array.isArray(response.result.records)) {
      // 非autoComplete控件请求不到数据则清除数据
      if(this.props.autoComplete){
        return;
      }
      this.setSourceData([]);
    } else {
      this.setSourceData(response.result.records);
    }
    // 重新加载完数据后,看数据源中是否还有对应的value,没有则清除控件值
    let data = this.getOptions().find(x => x.value == this.state.value)?.data;
    if (!data && this.state.value != undefined) {
      this.onChange(undefined);
    }
  }

  /**
   * 值更新事件
   */
  onChange = (value) => {
    if (this.props.onChange) {
      let data = this.getOptions().find(x => x.value == value)?.data;
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
    let { autoComplete, showSearch } = this.props;
    let onSearch;
    const options = this.getOptions().map(d => (
      <Select.Option key={d.value} textfield={d.textField}>
        {d.label}
      </Select.Option>
    ));

    if (autoComplete) {
      showSearch = true;
      onSearch = this.onSearch;
    }

    // 将父组件传过来的属性传递下去，以适应Form、getFieldDecorator等处理
    return (
      <Select
        allowClear={true}
        {...this.props}
        optionLabelProp="textfield"     // 指定回填到选择框的 Option 属性
        optionFilterProp="children"
        showSearch={showSearch}
        onSearch={onSearch}
        // 将value进行了一层包装，以方便日后扩展
        value={this.state.value}
        onChange={this.onChange}
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
function convertData2Options(sourceData, textField, valueField) {
  if (!sourceData) {
    return [];
  }
  return sourceData.map(row => {
    const textShow = getFieldShow(row, textField);
    const valueShow = getFieldShow(row, valueField);
    return {
      label: textShow,
      value: valueShow,
      textField: textShow,
      data: {
        value: valueShow,
        record: row
      }
    }
  });
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
