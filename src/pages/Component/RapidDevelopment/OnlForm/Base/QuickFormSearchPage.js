import React, { PureComponent } from 'react';
import { Table, Button, Input, Col, Row, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import { havePermission } from '@/utils/authority';
import axios from 'axios';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { colWidth } from '@/utils/ColWidth';
import SimpleQuery from '@/pages/Component/RapidDevelopment/OnlReport/SimpleQuery/SimpleQuery';
import AdvanceQuery from '@/pages/Component/RapidDevelopment/OnlReport/AdvancedQuery/AdvancedQuery';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import ExportJsonExcel from 'js-export-excel';
import { routerRedux } from 'dva/router';
import { Badge } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { guid } from '@/utils/utils'

/**
 * 查询界面
 */
export default class QuickFormSearchPage extends SearchPage {
  drawcell = e => {}; //扩展render
  drawTopButton = () => {}; //扩展最上层按钮
  drawToolsButton = () => {}; //扩展中间功能按钮
  drawExColumns = () => {}; //table额外的列
  changeState = () => {}; //扩展state
  renderOperateCol = () => {}; //操作列
  exSearchFilter = () => {}; //扩展查询

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
      isOrgQuery: [],
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
          //解决用户列展示失效问题 暂时解决方法（赋值两次）
          this.initConfig(response.result);
          //查询必填
          let queryRequired = response.result.columns.find(item => item.searchRequire);

          let companyuuid = response.result.columns.find(
            item => item.fieldName.toLowerCase() == 'companyuuid'
          );
          let orgName =
            loginOrg().type.toLowerCase() == 'dc'
              ? loginOrg().type.toLowerCase() + 'Uuid'
              : 'dispatchcenteruuid';
          let org = response.result.columns.find(item => item.fieldName.toLowerCase() == orgName);

          if (companyuuid) {
            this.state.isOrgQuery = [
              {
                field: 'companyuuid',
                type: 'VarChar',
                rule: 'eq',
                val: loginCompany().uuid,
              },
            ];
          }

          if (org) {
            this.setState({
              isOrgQuery: response.result.reportHead.organizationQuery
                ? [
                    {
                      field:
                        loginOrg().type.toLowerCase() == 'dc'
                          ? loginOrg().type.toLowerCase() + 'Uuid'
                          : 'dispatchCenterUuid',
                      type: 'VarChar',
                      rule: 'eq',
                      val: loginOrg().uuid,
                    },
                    ...this.state.isOrgQuery,
                  ]
                : [...this.state.isOrgQuery],
            });
          }
          //查询条件有必填时默认不查询
          if (queryRequired) return;

          //配置查询成功后再去查询数据
          this.onSearch();

          //扩展State
          this.changeState();
        }
      },
    });
  };

  componentDidMount() {
    this.queryCoulumns();
    //this.queryCoulumns();
  }

  componentWillUnmount() {
    this.setState = () => {
      return;
    };
  }

  //数据转换
  convertData = (data, preview, record) => {
    if (!data) return '<空>';
    if (!preview) return data;
    return record[preview];
  };

  colorChange = (data, color) => {
    if (!color) return '';

    let colorJson = JSON.parse(color);
    if (!Array.isArray(colorJson)) return '';
    let colorItem = colorJson.find(item => item.value == data);

    if (!colorItem) return '';

    return colorItem.color;
  };

  //自定义报表的render
  customize(record, val, component, column) {
    let e = {
      column: column,
      record: record,
      component: component,
      val: val,
      // props: { ...commonPropertis, ...fieldExtendJson },
    };

    //自定义报表的render
    this.drawcell(e);

    return e.component;
  }

  //初始化配置
  initConfig = queryConfig => {
    const columns = queryConfig.columns;
    let quickColumns = new Array();

    columns.filter(data => data.isShow).forEach(column => {
      let jumpPaths;
      let preview;
      if (column.jumpPath) {
        jumpPaths = column.jumpPath.split(',');
      }
      if (column.preview) {
        preview = column.preview;
      } else {
        preview = 'N';
      }
      let e = {
        column: column,
      };
      let exColumns = this.drawExColumns(e); //额外的列
      const qiuckcolumn = {
        title: column.fieldTxt,
        dataIndex: column.fieldName,
        key: column.fieldName,
        sorter: column.orderType != 0,
        width: column.fieldWidth,
        fieldType: column.fieldType,
        preview: preview,
        render:
          column.clickEvent == '1'
            ? (val, record) => {
                const component = (
                  <a
                    onClick={this.onView.bind(this, record)}
                    style={{ color: this.colorChange(val, column.textColor) }}
                  >
                    {this.convertData(val, column.preview, record)}
                  </a>
                );
                return this.customize(
                  record,
                  this.convertData(val, column.preview, record),
                  component,
                  column
                );
              }
            : column.clickEvent == '2'
              ? (val, record) => {
                  const component = (
                    <a
                      onClick={this.onOtherView.bind(this, record, jumpPaths)}
                      style={{ color: this.colorChange(val, column.textColor) }}
                    >
                      {this.convertData(val, column.preview, record)}
                    </a>
                  );
                  return this.customize(
                    record,
                    this.convertData(val, column.preview, record),
                    component,
                    column
                  );
                }
              : (val, record) => {
                  if (column.textColor && Array.isArray(JSON.parse(column.textColor))) {
                    const component = (
                      <div>
                        <Badge
                          color={this.colorChange(val, column.textColor)}
                          text={this.convertData(val, column.preview, record)}
                        />
                      </div>
                    );
                    return this.customize(
                      record,
                      this.convertData(val, column.preview, record),
                      component,
                      column
                    );
                  } else {
                    const component = <p3>{this.convertData(val, column.preview, record)}</p3>;
                    return this.customize(
                      record,
                      this.convertData(val, column.preview, record),
                      component,
                      column
                    );
                  }
                },
      };
      if (exColumns) {
        quickColumns.push(exColumns);
      }

      quickColumns.push(qiuckcolumn);
    });
    let OptColumn = {
      title: '操作',
      width: colWidth.operateColWidth,
      render: record => this.renderOperateCol(record),
    };
    quickColumns.push(OptColumn);
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
    // 海鼎底层需要uuid作为StandardTable的rowkey
    if (data?.records && data.records.length > 0 && !data.records[0].uuid) {
      data.records.forEach(row => row.uuid = guid());
    }
    var data = {
      list: data.records,
      pagination: {
        total: data.paging.recordCount,
        pageSize: data.paging.pageSize,
        current: data.page,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({ data, selectedRows: [] });
  };

  /**
   * 显示新建/编辑界面
   */
  onCreate = () => {
    this.props.switchTab('create');
  };
  /**
   * 编辑界面
   */
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      const { onlFormField } = this.props;
      var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
      this.props.switchTab('update', {
        entityUuid: selectedRows[0][field],
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
      this.props.switchTab('view', { entityUuid: record[field] });
    } else {
      const { selectedRows, batchAction } = this.state;
      if (selectedRows.length > 0) {
        this.props.switchTab('view', {
          entityUuid: selectedRows[0][field],
        });
      } else message.error('请至少选中一条数据！');
    }
  };

  //跳转到其他详情页
  onOtherView = (record, jumpPaths) => {
    if (!jumpPaths || jumpPaths.length != 2) {
      message.error('配置为空或配置错误，请检查点击事件配置！');
      return;
    }

    // console.log('jumpPath', jumpPaths[0], 'entityUuid', record[jumpPaths[1]], '3', jumpPaths[2]);

    this.props.dispatch(
      routerRedux.push({
        pathname: jumpPaths[0],
        state: {
          tab: 'view',
          param: { entityUuid: record[jumpPaths[1]] },
        },
      })
    );
  };

  /**
   * 批量删除
   */
  onBatchDelete = () => {
    const { selectedRows, batchAction } = this.state;
    const { dispatch } = this.props;
    const params = [];
    let that = this;
    if (selectedRows.length !== 0) {
      for (var i = 0; i < selectedRows.length; i++) {
        this.deleteById(selectedRows[i], params);
      }
      dispatch({
        type: 'quick/dynamicDelete',
        payload: { params },
        callback: response => {
          // if (batch) {
          //   that.batchCallback(response, record);
          //   resolve({ success: response.success });
          //   return;
          // }

          if (response && response.success) {
            this.setState({ selectedRows: [] });
            that.refreshTable();
            message.success('删除成功！');
          }
        },
      });
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  /**
   * 单一删除
   */
  deleteById = (record, paramsData) => {
    const { dispatch, tableName, onlFormField } = this.props;

    var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
    const recordMap = new Map(Object.entries(record));
    var val = record[field];

    onlFormField.forEach(x => {
      var field;
      var tableName = x.onlFormHead.tableName;
      if (x.onlFormHead.tableType == '2') {
        field = x.onlFormFields.find(x => x.mainField != null)?.dbFieldName;
      } else {
        field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
      }
      var params = {
        tableName,
        condition: { params: [{ field, rule: 'eq', val: [val] }] },
        deleteAll: 'false',
      };
      paramsData.push(params);
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
            if (a.preview != 'N') {
              sheetfilter.push(a.preview);
            } else {
              sheetfilter.push(a.key);
            }
            sheetheader.push(a.title);
          });
          option.fileName = this.state.title; //导出的Excel文件名
          response.data.records.map(item => {});
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
    let exSearchFilter = this.exSearchFilter();
    if (!exSearchFilter) exSearchFilter = [];
    if (typeof filter == 'undefined') {
      //重置搜索条件
      this.state.pageFilters = {
        quickuuid: this.props.quickuuid,
        superQuery: { matchType: '', queryParams: [...this.state.isOrgQuery, ...exSearchFilter] },
      }; //增加组织 公司id查询条件
      this.getData(this.state.pageFilters);
    } else {
      const { dispatch } = this.props;
      const { columns } = this.state;
      const pageFilters = {
        ...this.state.pageFilters,
        superQuery: {
          matchType: filter.matchType,
          queryParams: [...filter.queryParams, ...this.state.isOrgQuery, ...exSearchFilter],
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

  // test=()=>{
  //   alert("测试弹出")
  // }

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    //额外的菜单选项
    const menus = [];
    menus.push({
      // disabled: !havePermission(STORE_RES.CREATE), //权限认证
      name: '测试', //功能名称
      onClick: this.test, //功能实现
    });
    return (
      <div>
        <Button
          // hidden={!havePermission(this.state.reportCode + '.create')}
          onClick={this.onCreate}
          type="primary"
          icon="plus"
        >
          新建
        </Button>
        <Button
          // hidden={!havePermission(this.state.reportCode + '.edit')}
          onClick={this.onUpdate}
          type="primary"
        >
          编辑
        </Button>
        <Button
          // hidden={!havePermission(this.state.reportCode + '.view')}
          onClick={this.onView}
          type="primary"
        >
          查看
        </Button>
        <Button
          // hidden={!havePermission(this.state.reportCode + '.port')}
          onClick={this.port}
          type="primary"
        >
          导出
        </Button>
        {this.drawTopButton()}
        {/* <SearchMoreAction menus={menus} /> */}
      </div>
    );
  };

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel = () => {
    return (
      <div>
        <Popconfirm
          title="你确定要删除所选中的内容吗?"
          onConfirm={() => this.onBatchDelete()}
          okText="确定"
          cancelText="取消"
        >
          <Button
          // hidden={!havePermission(this.state.reportCode + '.delete')}
          >
            删除
          </Button>
        </Popconfirm>
        <AdvanceQuery
          searchFields={this.state.advancedFields}
          fieldInfos={this.columns}
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          reportCode={this.state.reportCode}
          isOrgQuery={this.state.isOrgQuery}
        />
        {this.drawToolsButton()}
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
          isOrgQuery={this.state.isOrgQuery}
        />
      </div>
    );
  };
}
