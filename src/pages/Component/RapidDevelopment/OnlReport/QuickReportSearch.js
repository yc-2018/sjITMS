import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row } from 'antd';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import axios from 'axios';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { colWidth } from '@/utils/ColWidth';
import AdvanceQuery from '@/pages/Component/RapidDevelopment/OnlReport/AdvancedQuery/AdvancedQuery';
import SimpleQuery from '@/pages/Component/RapidDevelopment/OnlReport/SimpleQuery/SimpleQuery';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import ExportJsonExcel from 'js-export-excel';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class QuickReportSearch extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '',
      data: [],
      columns: [],
      searchFields: [],
      advancedFields: [],
      reportCode: this.props.quickuuid,
      pageFilters: { quickuuid: this.props.quickuuid, changePage: true },
      key: this.props.quickuuid + 'quick.search.table', //用于缓存用户配置数据
    };
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    await this.initConfig();
    this.onSearch();
  }
  
  // 初始化配置
  initConfig = async () => {
    const response = await this.queryCoulumns();
    const { result: queryConfig } = response;
    if (!queryConfig) {
      return;
    }

    const columns = queryConfig.columns;
    let quickColumns = new Array();
    columns.filter(data => data.isShow).forEach(column => {
      const qiuckcolumn = {
        title: column.fieldTxt,
        dataIndex: column.fieldName,
        key: column.fieldName,
        sorter: true,
        width: colWidth.codeColWidth,
        fieldType: column.fieldType,
      };
      quickColumns.push(qiuckcolumn);
    });
    this.columns = quickColumns;
    this.setState({
      title: queryConfig.reportHeadName,
      columns: quickColumns,
      advancedFields: columns.filter(data => data.isShow),
      searchFields: columns.filter(data => data.isSearch),
    });
  };

  //初始化数据
  reloadData = async (pageFilter) => {
    const response = await this.getData(pageFilter);
    const { data } = response;
    if (!data) {
      return;
    }
    var tableData = {
      list: data.records,
      pagination: {
        total: data.paging.recordCount,
        pageSize: data.paging.pageSize,
        current: data.page,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({ data: tableData });
  };

  /**
   * 获取表格数据
   * @param {*} pageFilters 查询条件
   */
  getData = pageFilters => {
    return new Promise((resolve, reject) => {
      this.props.dispatch({
        type: 'quick/queryData',
        payload: pageFilters,
        callback: response => {
          resolve(response); 
        }
      });
    }); 
  };

  /**
   * 获取字段配置
   */
  queryCoulumns = () => {
    return new Promise((resolve, reject) => {
      this.props.dispatch({
        type: 'quick/queryColumns',
        payload: {
          reportCode: this.state.reportCode,
          sysCode: 'tms',
        },
        callback: response => {
          resolve(response);
        },
      });
    });
  };

  //显示新建/编辑界面
  onCreate = () => { };

  //查询
  onSearch = async filter => {
    if (typeof filter == 'undefined') {
      //重置搜索条件
      this.state.pageFilters = { quickuuid: this.props.quickuuid };
      this.reloadData(this.state.pageFilters);
    } else {
      const { dispatch } = this.props;
      const { columns } = this.state;
      const pageFilters = {
        ...this.state.pageFilters,
        superQuery: {
          matchType: filter.matchType,
          queryParams: filter.queryParams,
        },
      };
      this.state.pageFilters = pageFilters;
      await this.refreshTable();
    }
  };

  //刷新/重置
  refreshTable = async filter => {
    const { dispatch } = this.props;
    const { pageFilters } = this.state;

    let queryFilter = { ...pageFilters };
    if (filter) {
      var order = '';
      for (var key in filter.sortFields) {
        var sort = filter.sortFields[key] ? 'descend' : 'ascend';
        order = key + ',' + sort;
      }
      queryFilter = {
        order: order,
        ...pageFilters,
        page: filter.page + 1,
        pageSize: filter.pageSize,
      };
    }
    await this.reloadData(queryFilter);
  };

  columns = [
    {
      title: '过度数据',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
  ];

  //导出
  port = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryAllData',
      payload: this.state.pageFilters,
      callback: response => {
        if (response && response.success) {
          let columns = this.state.columns;
          var option = [];
          let sheetfilter = []; //对应列表数据中的key值数组
          let sheetheader = []; //对应key值的表头，即excel表头
          columns.map(a => {
            sheetfilter.push(a.key);
            sheetheader.push(a.title);
          });
          option.fileName = this.state.title; //导出的Excel文件名
          option.datas = [
            {
              sheetData: response.data.records,
              sheetName: this.state.title, //工作表的名字
              sheetFilter: sheetfilter,
              sheetHeader: sheetheader,
            },
          ];
          var toExcel = new ExportJsonExcel(option);
          toExcel.saveExcel();
        }
      },
    });
  };

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return (
      <div>
        <Button onClick={this.port} type="primary">
          导出
        </Button>
      </div>
    );
  };

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return (
      <div>
        <SimpleQuery
          selectFields={this.state.searchFields}
          filterValue={this.state.pageFilter.filterValue}
          refresh={this.onSearch}
          reportCode={this.state.reportCode}
        />
        <AdvanceQuery
          searchFields={this.state.advancedFields}
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          reportCode={this.state.reportCode}
        />
      </div>
    );
  };
}
