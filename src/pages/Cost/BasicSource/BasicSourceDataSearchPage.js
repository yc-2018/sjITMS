/*
 * @Author: Liaorongchang
 * @Date: 2022-06-14 11:10:51
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-16 17:38:29
 * @version: 1.0
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, message } from 'antd';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import AdvanceQuery from '@/pages/Component/RapidDevelopment/OnlReport/AdvancedQuery/AdvancedQuery';
import SearchPage from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeSearchPage';
import { dynamicQuery } from '@/services/quick/Quick';
import { colWidth } from '@/utils/ColWidth';
import { guid } from '@/utils/utils';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class BasicSourceDataSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      isNotHd: true,
      scroll: this.props.scroll,
      title: this.props.title,
      data: [],
      suspendLoading: false,
      columns: [],
      searchFields: [],
      isOrgQuery: [],
      // queryParams: this.props.params,
      tableName: this.props.tableName,
    };
  }

  componentDidMount() {
    this.queryColumns();
  }

  //获取列配置
  queryColumns = async () => {
    let param = {
      tableName: 'cost_form_field',
      condition: {
        params: [{ field: 'FORMUUID', rule: 'eq', val: [this.props.selectedRows] }],
      },
    };
    const columnsData = await dynamicQuery(param);
    if (columnsData && columnsData.success) {
      this.initConfig(columnsData.result.records);
      this.initConfig(columnsData.result.records);

      //配置查询成功后再去查询数据
      this.onSearch();
    }
  };

  initConfig = queryConfig => {
    let quickColumns = new Array();
    let quickSearchFields = new Array();
    queryConfig.filter(data => data.SHOW).forEach(data => {
      const qiuckcolumn = {
        title: data.DB_FIELD_TXT,
        dataIndex: data.DB_FIELD_NAME,
        key: data.DB_FIELD_NAME,
        sorter: true,
        width: colWidth.codeColWidth,
        fieldType: data.DB_TYPE,
      };
      quickColumns.push(qiuckcolumn);

      const quickSearchField = {
        fieldName: data.DB_FIELD_NAME,
        fieldTxt: data.DB_FIELD_TXT,
        fieldType: data.DB_TYPE,
        searchCondition: 'eq',
      };
      quickSearchFields.push(quickSearchField);
    });
    if (quickColumns.length == 0) {
      message.error(this.state.title + '数据源展示列为空');
      return;
    }

    this.columns = quickColumns;
    this.setState({
      columns: quickColumns,
      searchFields: quickSearchFields,
    });
  };

  getData = async pageFilters => {
    console.log('pageFilters', pageFilters);
    const result = await dynamicQuery(pageFilters);
    if (result && result.result && result.result.records != 'false') {
      this.initData(result.result);
    } else {
      message.error('查无数据');
      return;
    }
  };

  onSearch = async filter => {
    const { tableName } = this.state;
    let param;
    if (filter == undefined) {
      param = {
        pageNo: 1,
        pageSize: 20,
        searchCount: true,
        tableName: tableName,
      };
    } else {
      const queryParams = params => {
        let param = params.map(data => {
          return {
            field: data.field,
            rule: data.rule,
            type: data.type,
            val: [data.val],
          };
        });
        return param;
      };
      param = {
        pageNo: 1,
        pageSize: 20,
        searchCount: true,
        tableName: tableName,
        condition: {
          params: queryParams(filter.queryParams),
        },
      };
    }
    this.getData(param);
  };

  //初始化数据
  initData = data => {
    // 海鼎底层需要uuid作为StandardTable的rowkey
    if (data?.records && data.records.length > 0 && !data.records[0].uuid) {
      data.records.forEach(row => (row.uuid = guid()));
    }
    var data = {
      list: data.records,
      pagination: {
        total: data.total,
        pageSize: data.pageSize,
        current: data.pageNo,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({ data, selectedRows: [] });
  };

  refreshTable = filter => {
    const { tableName } = this.state;
    console.log('filter', filter);
    let queryFilter;
    if (filter) {
      var order = [];
      for (var key in filter.sortFields) {
        var sort = filter.sortFields[key] ? '-' : '+';
        order.push(key + sort);
      }
      queryFilter = {
        tableName: tableName,
        searchCount: true,
        orderBy: order,
        pageNo: filter.page + 1,
        pageSize: filter.pageSize,
      };
    }
    // this.state.pageFilters = queryFilter;
    this.getData(queryFilter);
  };

  columns = [
    {
      title: '查询异常',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
  ];

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel = () => {
    return (
      <div style={{ marginTop: '10px' }}>
        <AdvanceQuery
          searchFields={this.state.searchFields}
          fieldInfos={this.columns}
          // filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          reportCode={this.state.tableName}
          // isOrgQuery={this.state.isOrgQuery}
        />
      </div>
    );
  };
}
