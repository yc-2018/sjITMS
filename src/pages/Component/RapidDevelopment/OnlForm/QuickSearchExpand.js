import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, message } from 'antd';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import axios from 'axios';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { colWidth } from '@/utils/ColWidth';
import SimpleQuery from '@/pages/Component/RapidDevelopment/OnlReport/SimpleQuery/SimpleQuery';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import ExportJsonExcel from 'js-export-excel';

export default class QuickSearchExpand extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: 'test',
      data: [],
      suspendLoading: false,
      columns: [],
      searchFields: [],
      advancedFields: [],
      reportCode: props.quickuuid,
      pageFilters: { quickuuid: props.quickuuid, changePage: true },
      key: props.quickuuid + 'quick.search.table',
    }; //用于缓存用户配置数据
  }

  //查询数据
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
  //获取列配置
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
    columns.filter(data => data.isShow).forEach(column => {
      const qiuckcolumn = {
        title: column.fieldTxt,
        dataIndex: column.fieldName,
        key: column.fieldName,
        sorter: true,
        width: colWidth.codeColWidth,
        fieldType: column.fieldType,
        render: (val, record) => {
          if (column.orderNum == '1') return <a onClick={this.onView.bind(this, record)}>{val}</a>;
          else if (column.searchShowtype == 'list' && val != undefined) {
            const dictionaryArray =
              column.searchProperties instanceof Object
                ? column.searchProperties.data
                : JSON.parse(column.searchProperties).data;
            if (dictionaryArray instanceof Array)
              return <p3>{dictionaryArray.find(x => x.value == val).name}</p3>;
            else return val;
          } else return val;
        },
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

  /**
   * 显示新建/编辑界面
   */
  onCreate = () => {
    this.props.dispatch({
      type: 'quick/showPageMap',
      payload: {
        showPageK: this.state.reportCode,
        showPageV: this.state.reportCode + 'create',
      },
    });
  };
  /**
   * 编辑界面
   */
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      const { onlFormField } = this.props;
      var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
      this.props.dispatch({
        type: 'quick/showPageMap',
        payload: {
          showPageK: this.state.reportCode,
          showPageV: this.state.reportCode + 'update',
          entityUuid: selectedRows[0][field],
        },
      });
    } else {
      message.error('请至少选中一条数据！');
    }
  };
  /**
   * 查看详情
   */
  onView = record => {
    const { onlFormField } = this.props;
    var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
    if (record.ROW_ID) {
      this.props.dispatch({
        type: 'quick/showPageMap',
        payload: {
          showPageK: this.state.reportCode,
          showPageV: this.state.reportCode + 'view',
          entityUuid: record[field],
        },
      });
    } else {
      const { selectedRows, batchAction } = this.state;
      console.log(selectedRows, 'selectedRows');
      if (selectedRows.length > 0) {
        this.props.dispatch({
          type: 'quick/showPageMap',
          payload: {
            showPageK: this.state.reportCode,
            showPageV: this.state.reportCode + 'view',
            entityUuid: selectedRows[0][field],
          },
        });
      } else message.error('请至少选中一条数据！');
    }
  };

  /**
   * 批量删除
   */
  onBatchDelete = () => {
    const { selectedRows, batchAction } = this.state;
    if (selectedRows.length !== 0) {
      for (var i = 0; i < selectedRows.length; i++) {
        this.deleteById(selectedRows[i]);
      }
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  /**
   * 单一删除
   */
  deleteById = (record, batch) => {
    const { dispatch, tableName, onlFormField } = this.props;
    let that = this;
    var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
    const recordMap = new Map(Object.entries(record));
    var val = recordMap.get(field);
    const params = {
      tableName,
      condition: { params: [{ field, rule: 'eq', val: [val] }] },
      deleteAll: 'false',
    };
    dispatch({
      type: 'quick/dynamicDelete',
      payload: { params },
      callback: response => {
        if (batch) {
          that.batchCallback(response, record);
          resolve({ success: response.success });
          return;
        }

        if (response && response.success) {
          this.setState({ selectedRows: [] });
          that.refreshTable();
          message.success('删除成功！');
        }
      },
    });
  };

  //导出
  port = () => {
    //const { dispatch } = this.props;
    this.props.dispatch({
      type: 'quick/queryAllData',
      payload: this.state.pageFilters,
      callback: response => {
        if (response && response.success) {
          let columns = this.state.columns;
          var option = [];
          let sheetfilter = []; //对应列表数据中的key值数组，就是上面resdata中的 name，address
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
        superQuery: { matchType: filter.matchType, queryParams: filter.queryParams },
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
  drawActionButton = () => {};

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
      </div>
    );
  };
}
