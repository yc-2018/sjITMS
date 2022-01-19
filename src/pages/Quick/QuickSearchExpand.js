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

export default class QuickSearchExpand extends SearchPage {
  getData = pageFilters => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryData',
      payload: pageFilters,
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
    });
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: 'test',
      data: [],
      suspendLoading: false,
      columns: [],
      selectFields: [],
      reportCode: props.quickuuid,
      pageFilters: { quickuuid: props.quickuuid, changePage: true },
      key: props.quickuuid + 'quick.search.table', //用于缓存用户配置数据
    };
  }

  componentDidMount() {
    this.queryCoulumns();
    this.onSearch();
  }

  componentWillReceiveProps(nextProps) {
    const { reportCode } = this.state;
    const { map } = nextProps.quick;
    const quickColumnKey = reportCode + 'columns';
    const quickDataKey = reportCode + 'data';
    const reportHeadNameKey = reportCode + 'reportHeadName';
    const columnArray = map.get(quickColumnKey);
    const title = map.get(reportHeadNameKey);
    if (columnArray != null) {
      let quickColumns = new Array();
      columnArray.forEach(column => {
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
        title,
        columns: quickColumns,
        selectFields: columnArray.filter(data => data.isSearch),
      });
    }
    this.setState({ data: map.get(quickDataKey) });
  }

  /**
   * 显示新建/编辑界面
   */
  onCreate = () => {};

  port = () => {
    const { dispatch } = this.props;a
    dispatch({
      type: 'quick/queryAllData',
      payload: this.state.pageFilters,
      callback: response => {
        if (response && response.success) {
          let columns = this.state.columns
          var option = []
          let sheetfilter = [] //对应列表数据中的key值数组，就是上面resdata中的 name，address
          let sheetheader = [] //对应key值的表头，即excel表头
          columns.map(a=>{
            sheetfilter.push(a.key)
            sheetheader.push(a.title)
          })
          option.fileName = this.state.title  //导出的Excel文件名
          option.datas = [
            {
              sheetData: this.state.data.list,
              sheetName: this.state.title,  //工作表的名字
              sheetFilter: sheetfilter,
              sheetHeader: sheetheader,
            }
          ]
          var toExcel = new ExportJsonExcel(option);
          toExcel.saveExcel();
        }
      }
    })
  }

  /**
   * 查询
   */
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

  /**
   * 刷新/重置
   */
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

  
   /**
   * 绘制右上角按钮
   */
    drawActionButton = () => {

    };

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel = () => {};

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
