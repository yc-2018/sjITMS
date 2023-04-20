import React, { Component } from 'react';
import { Select, Tooltip } from 'antd';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import memoize from 'memoize-one';
import { addCondition, getFieldShow, memoizeDynamicQuery } from '@/utils/ryzeUtils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { uniqBy } from 'lodash';

/**
 * 下拉列表输入框控件，可传入props同antd select
 * {string} textField 节点文本字段 默认值：NAME
 * {string} valueField 值字段     默认值：VALUE
 * {string} searchField 查询字段  默认值：VALUE
 * {string} label 回填到文本框的字段  默认为textField
 * {string} queryParams 数据查询参数
 * {string} dictCode 字典编码,与queryParams冲突,字典编码优先
 * {boolean} isLink    是否为联动控件
 * {string} linkFilter   联动过滤条件 {field:string, rule:string, val:array}形式
 * {object} initialRecord  初始行记录，用作显示
 * {function} onSourceDataChange  查询数据发生变化事件
 * {array} sourceData  原始数据
 * {boolean} autoComplete 是否为下拉搜索框
 * {boolean} showSearch 是否允许文本搜索
 * {string} mode 设置 Select 的模式为多选或标签 multiple | tags
 * {string} multipleSplit 以什么符号去分割多选组件的 value
 * {boolean} noRecord 控件不需要record，直接返回value
 */
export default class SimpleAutoComplete extends Component {
  state = { sourceData: undefined, preQueryStr: '', value: undefined, searchText: undefined };

  static defaultProps = {
    textField: 'NAME',
    valueField: 'VALUE',
    searchField: 'VALUE',
    multipleSplit: ',',
  };

  @Bind()
  @Debounce(300)
  onSearch(searchText) {
    this.setState({ searchText: searchText });
    if (searchText == '') {
      return;
    }
    this.autoCompleteFetchData(searchText);
  }

  // 在 sourceData, textField, valueField 变化时，重新运行 getOptions
  convertOptions = memoize((sourceData, textField, valueField, label) =>
    convertData2Options(sourceData, textField, valueField, label)
  );

  getOptions = () =>
    this.convertOptions(
      this.state.sourceData,
      this.props.textField,
      this.props.valueField,
      this.props.label
    );

  static getDerivedStateFromProps(props, state) {
    const nextState = {};
    const nextQueryStr = JSON.stringify({
      dictCode: props.dictCode,
      queryParams: props.queryParams,
      linkFilter: props.linkFilter,
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
    nextState.value = typeof props.value == 'object' ? props.value.value : props.value;
    return nextState;
  }

  componentDidMount() {
    // 非搜索直接进来就加载数据
    if (!this.props.sourceData) {
      if (this.props.autoComplete) {
        this.autoCompleteFetchData(this.state.searchText);
      } else {
        this.listFetchData();
      }
    }
  }

  componentDidUpdate(_, preState) {
    // 判断判断查询条件是否一致,如果一致则不加载
    if (preState.preQueryStr != this.state.preQueryStr) {
      if (this.props.autoComplete) {
        this.autoCompleteFetchData(this.state.searchText);
      } else {
        this.listFetchData();
      }
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
        tableName: 'V_SYS_DICT_ITEM',
        condition: { params: [{ field: 'DICT_CODE', rule: 'eq', val: [dictCode] }] },
      };
    } else {
      if (!queryParams) {
        return;
      }
      queryParamsJson = JSON.parse(JSON.stringify(queryParams));
    }
    if (linkFilter) {
      // 构建出联动筛选语句，过滤数据
      const linkFilterCondition = this.getLinkFilterCondition();
      if (!linkFilterCondition) {
        return;
      }
      addCondition(queryParamsJson, linkFilterCondition);
    }
    return queryParamsJson;
  };

  /**
   * 构建联动筛选的条件
   */
  getLinkFilterCondition = () => {
    const { linkFilter, initData } = this.props;
    // 不允许有空查询
    for (const filter of linkFilter) {
      if (filter.val[0] == undefined) {
        if (initData) filter.val[0] = '';
        //初始化数据 允许空查询
        else return;
      }
    }
    return { params: JSON.parse(JSON.stringify(linkFilter)) };
  };

  /**
   * 构建查询筛选的条件
   * @param {*} searchText 查询值
   */
  getSearchCondition = searchText => {
    const { searchField, isOrgSearch } = this.props;
    // 构建出or语句，使得多个查询字段都能搜索到数据
    if (searchField.indexOf(',') == -1 && isOrgSearch) {
      let loginOrgType = loginOrg().type.replace('_', '');
      return {
        matchType: 'and',
        params: [
          { field: searchField, rule: 'like', val: [searchText] },
          { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
          { field: loginOrgType + 'UUID', rule: 'like', val: [loginOrg().uuid] },
        ],
      };
    } else {
      return {
        matchType: 'or',
        params: searchField.split(',').map(field => {
          return { field: field, rule: 'like', val: [searchText] };
        }),
      };
    }
  };

  /**
   * 构建主键查询条件
   */
  getKeyCondition = () => {
    const { mode, valueField, multipleSplit } = this.props;
    const { value } = this.state;
    const rule = mode == 'multiple' ? 'in' : 'eq';
    const val = mode == 'multiple' ? value.split(multipleSplit) : [value];
    return { params: [{ field: valueField, rule, val }] };
  };

  /**
   * 下拉搜索框加载数据
   */
  listFetchData = async () => {
    const { isLink, linkFilter, orderBy, initData, isOrgSearch } = this.props;
    let queryParams = this.getQueryParams();

    // 如果是联动控件,但是没有传递linkFilter,则不加载数据
    if (!initData) {
      if (!queryParams || (isLink && !linkFilter)) {
        return;
      }
    }

    //增加组织查询
    if (isOrgSearch) {
      let loginOrgType = loginOrg().type.replace('_', '');
      let searchCondition = {
        params: [
          { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
          { field: loginOrgType + 'UUID', rule: 'like', val: [loginOrg().uuid] },
        ],
      };
      addCondition(queryParams, searchCondition);
    }
    //20230228 去除没有传递linkFilter,则不加载数据
    // if (!queryParams) {
    //   return;
    // }
    if (orderBy) {
      queryParams.orderBy = orderBy;
    }
    await this.loadData(queryParams);
  };

  /**
   * autoComlete搜索数据
   * @param {string} searchText 查询键
   */
  autoCompleteFetchData = async searchText => {
    const { isLink, linkFilter, orderBy, initData } = this.props;
    const queryParams = this.getQueryParams();
    // 如果是联动控件,但是没有传递linkFilter,则不加载数据

    if (!initData) {
      if (!queryParams || (isLink && !linkFilter)) {
        return;
      }
    }
    // if (!queryParams) {
    //   return;
    // }
    // 分页查询
    queryParams.pageNo = 1;
    queryParams.pageSize = 20;
    if (searchText != undefined && searchText != '') {
      // 构建出or语句，使得多个查询字段都能搜索到数据
      const searchCondition = this.getSearchCondition(searchText);
      addCondition(queryParams, searchCondition);
    } else if (this.state.value != undefined) {
      // 如果已经控件已经有值，则按值搜索，在编辑时可带出源数据
      const keyCondition = this.getKeyCondition();
      addCondition(queryParams, keyCondition);
    } else {
      // 两者都不存在，则不加载数据
      return;
    }
    if (orderBy) {
      queryParams.orderBy = orderBy;
    }
    await this.loadData(queryParams);
  };

  /**
   * 设置state的数据源
   */
  setSourceData = sourceData => {
    //多选保留已选中数据源
    const { value } = this.state;
    const { multipleSplit, valueField, mode } = this.props;
    const oldData =
      this.state.sourceData && value && mode == 'multiple' && multipleSplit
        ? this.state.sourceData.filter(
            x => value?.split(multipleSplit).indexOf(x[valueField]) != -1
          )
        : [];
    sourceData = [...sourceData, ...oldData];
    sourceData = uniqBy(sourceData, valueField);
    this.setState({ sourceData: sourceData });
    if (this.props.onSourceDataChange) {
      this.props.onSourceDataChange(
        sourceData,
        this.getOptions().find(x => x.value == this.state.value)?.data
      );
      return;
    }
  };

  loadData = async queryParams => {
    const response = await memoizeDynamicQuery(queryParams);
    if (!response || !response.success || !Array.isArray(response.result.records)) {
      this.setSourceData([]);
    } else {
      this.setSourceData(response.result.records);
    }
    // 重新加载完数据后,看数据源中是否还有对应的value,没有则清除控件值
    // let data = this.getOptions().find(x => x.value == this.state.value)?.data;
    // if (!data && this.state.value != undefined) {
    //   this.onChange(undefined);
    // }
  };

  /**
   * 值更新事件
   */
  onChange = value => {
    if (!this.props.onChange) {
      return;
    }
    const { noRecord, multipleSplit } = this.props;
    let data = { value: undefined, record: {} };
    // 不需要record，直接返回值
    if (noRecord) {
      if (value instanceof Array && multipleSplit) {
        //value = value?.reverse();
        data = value.length == 0 ? undefined : value.join(multipleSplit);
      } else {
        data = value;
      }
    } else {
      if (!(value instanceof Array)) {
        const findData = this.getOptions().find(x => x.value == value)?.data;
        if (findData) {
          data = findData;
        }
      } else {
        //value = value?.reverse();
        const filterData = this.getOptions()
          .filter(x => value.indexOf(x.value) > -1)
          .map(x => x.data);
        if (filterData.length > 0) {
          if (multipleSplit) {
            // value = filterData.map(x => x.value).join(multipleSplit);
            value = value.join(multipleSplit);
          }
          data = { value, record: filterData.map(x => x.record) };
        }
      }
    }
    this.props.onChange(data);
  };

  render() {
    let { autoComplete, showSearch, mode, multipleSplit } = this.props;
    let { value } = this.state;

    let onSearch;

    // autoComplete 则必须支持查询
    if (autoComplete) {
      showSearch = true;
      onSearch = this.onSearch;
    }

    // 多选情况下把 value 值进行分割
    // toString是为了处理value和数据源数据格式不一致问题
    if (mode == 'multiple' && multipleSplit) {
      value = value
        ?.toString()
        .split(multipleSplit)
        .map(x => x?.toString());
    } else {
      value = value?.toString();
    }
    //选中的置顶
    let isSelect = [];
    let other = [];
    this.getOptions().map(d => {
      let s = (
        <Select.Option key={d.value} textfield={d.textField} title={d.textField}>
          {d.label}
        </Select.Option>
      );
      if (mode == 'multiple' && multipleSplit && value && value.indexOf(d.value) != -1) {
        isSelect.push(s);
      } else {
        other.push(s);
      }
    });

    const options = [...isSelect, ...other];
    // 将父组件传过来的属性传递下去，以适应Form、getFieldDecorator等处理
    return (
      <div>
        <Select
          maxTagCount={1}
          maxTagPlaceholder={e => {
            let title = [];
            this.getOptions().map(x => {
              if (e.indexOf(x.value) != -1) {
                title.push(x.label);
              }
            });
            return <Tooltip title={title.join(',')}>{`+${e?.length}`}</Tooltip>;
          }}
          allowClear={true}
          {...this.props}
          optionLabelProp="textfield" // 指定回填到选择框的 Option 属性
          optionFilterProp="children"
          showSearch={showSearch}
          onSearch={onSearch} // 将value进行了一层包装，以方便日后扩展
          value={value}
          onChange={this.onChange}
        >
          {options}
        </Select>
      </div>
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
function convertData2Options(sourceData, textField, valueField, label) {
  if (!sourceData) {
    return [];
  }
  return sourceData.map(row => {
    const labelShow = getFieldShow(row, label);
    const textShow = getFieldShow(row, textField);
    const valueShow = getFieldShow(row, valueField);
    return {
      label: textShow,
      value: valueShow,
      textField: labelShow || textShow,
      data: {
        value: valueShow,
        record: row,
      },
    };
  });
}
