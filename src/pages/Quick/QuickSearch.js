import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row } from 'antd';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import axios from 'axios';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { colWidth } from '@/utils/ColWidth';
import AdvanceQuery from './AdvancedQuery/QueryT';
import SimpleQuery from './SimpleQuery/SimpleQuery';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import ExportJsonExcel from 'js-export-excel';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class QuickSearch extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '',
      data: [],
      columns: [],
      selectFields: [],
      reportCode: this.props.quickuuid,
      pageFilters: { quickuuid: this.props.quickuuid, changePage: true },
      key: this.props.quickuuid + 'quick.search.table', //用于缓存用户配置数据
    };
  }

  getData = pageFilters => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryData',
      payload: pageFilters,
      callback: response => {
        if (response.data) this.initData(response.data);
      },
    });
  };

  queryCoulumns = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: this.state.reportCode,
        sysCode: 'tms',
      },
      callback: response => {
        if (response.result) {
          this.initConfig(response.result);
            //配置查询成功后再去查询数据
          this.onSearch();
        }
      },
    });
  };

  componentDidMount() {
    this.queryCoulumns(); 
    //解决用户列展示失效问题 暂时解决方法（查询两次）
    this.queryCoulumns(); 
  }

  //初始化配置
  initConfig = queryConfig => {
    const columns = queryConfig.columns;
    let quickColumns = new Array();
    columns.forEach(column => {
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
      selectFields: columns.filter(data => data.isSearch),
    });
  };
  //初始化数据
  initData = data => {
    var data = {
      list: data.records,
      pagination: {
        total: data.paging.recordCount,
        pageSize: data.paging.pageSize,
        current: data.page,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({ data });
  };

  //显示新建/编辑界面
  onCreate = () => {};

  //查询
  onSearch = filter => {
    if (typeof filter == 'undefined') {
      //重置搜索条件
      this.state.pageFilters = { quickuuid: this.props.quickuuid };
      this.getData(this.state.pageFilters);
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
      this.refreshTable();
    }
  };

  //刷新/重置
  refreshTable = filter => {
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
    this.getData(queryFilter);
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
          selectFields={this.state.selectFields}
          filterValue={this.state.pageFilter.filterValue}
          refresh={this.onSearch}
        />
        <AdvanceQuery
          fieldInfos={this.columns}
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
        />
      </div>
    );
  };
}
