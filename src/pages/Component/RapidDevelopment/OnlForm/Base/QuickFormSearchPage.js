import React from 'react';
import { Button, message, Popconfirm, Switch, Badge } from 'antd';
import { havePermission } from '@/utils/authority';
import SearchPage from '../../CommonLayout/RyzeSearchPage';
import { colWidth } from '@/utils/ColWidth';
import SimpleQuery from '@/pages/Component/RapidDevelopment/OnlReport/SimpleQuery/SimpleQuery';
import AdvanceQuery from '@/pages/Component/RapidDevelopment/OnlReport/AdvancedQuery/AdvancedQuery';
import ExportJsonExcel from 'js-export-excel';
import { routerRedux } from 'dva/router';
import { loginCompany, loginOrg, getTableColumns } from '@/utils/LoginContext';
import { guid } from '@/utils/utils';
import moment from 'moment';
import { updateEntity } from '@/services/quick/Quick';

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
  drapTableChange = e => {}; //拖拽事件
  exSearchFilter = () => {}; //扩展查询

  defaultSearch = () => {
    //默认查询
    let ex = this.state.queryConfigColumns.filter(item => {
      return item.searchDefVal != null && item.searchDefVal != '';
    });
    let defaultSearch = [];
    let exSearchFilter;
    for (const item of ex) {
      if (item.fieldType == 'Date') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else if (item.fieldType == 'DateTime') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD 00:00:00');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else {
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: item.searchDefVal,
        };
      }

      defaultSearch.push(exSearchFilter);
    }

    return defaultSearch;
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '',
      data: [],
      suspendLoading: false,
      columns: [],
      searchFields: [],
      advancedFields: [],
      reportCode: props.quickuuid,
      isOrgQuery: [],
      key: props.quickuuid + 'quick.search.table', //用于缓存用户配置数据
      defaultSort: '',
      formConfig: {},
      colTotal: [],
      queryConfigColumns: [],
      tableName: '',
      authority: props.route?.authority ? props.route.authority[0] : null,
    };
  }

  /**
   * 获取配置信息,用于写入redis
   */
  getCreateConfig = () => {
    this.props.dispatch({
      type: 'quick/queryCreateConfig',
      payload: this.state.reportCode,
      callback: response => {
        if (response.result) {
          console.log('请求配置成功');
          this.setState({ formConfig: response.result });
        }
      },
    });
  };

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
                      rule: 'like',
                      val: loginOrg().uuid,
                    },
                    ...this.state.isOrgQuery,
                  ]
                : [...this.state.isOrgQuery],
            });
          }

          let defaultSortColumn = response.result.columns.find(item => item.orderType > 1);
          if (defaultSortColumn) {
            let defaultSort =
              defaultSortColumn.orderType == 2
                ? defaultSortColumn.fieldName + ',ascend'
                : defaultSortColumn.fieldName + ',descend';
            this.setState({ defaultSort });
          }

          //查询条件有必填时默认不查询
          //if (queryRequired) return;

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
    this.getCreateConfig();
  }

  componentWillUnmount() {
    this.setState = () => {
      return;
    };
  }

  //数据转换
  convertData = (data, preview, record) => {
    if (data === '' || data == undefined || data === '[]') return '<空>';
    if (!preview) return data;
    const convert = record[preview] || '<空>';
    return convert;
  };

  colorChange = (data, color) => {
    if (!color) return '';

    //let colorJson = JSON.parse(color);
    //if (!Array.isArray(colorJson)) return '';
    let colorItem = color.find(item => item.ITEM_VALUE == data);
    if (!colorItem) return '';

    return colorItem.TEXT_COLOR;
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

  //开关控件update
  changeOpenState = async (e, record, column) => {
    let field = this.state.formConfig[0]?.onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
    let sets = {};
    sets[column.fieldName] = e ? 1 : 0;
    let param = {
      tableName: this.state.tableName,
      sets,
      condition: {
        params: [
          {
            field,
            rule: 'eq',
            val: [record[field]],
          },
        ],
      },
      updateAll: false,
    };
    let result = await updateEntity(param);
    if (result.success) {
      record[column.fieldName] = sets[column.fieldName];
      this.setState({});
      e ? message.success('启用成功') : message.success('禁用成功');
    } else {
      e ? message.error('启用失败') : message.error('禁用失败');
    }
  };

  //初始化配置
  initConfig = queryConfig => {
    const columns = queryConfig.columns;
    let quickColumns = new Array();

    columns.filter(data => data.isShow).forEach(column => {
      let preview;
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
        width: column.fieldWidth == 0 ? colWidth.codeColWidth : column.fieldWidth,
        fieldType: column.fieldType,
        preview: preview,
        render: (val, record) => this.getRender(val, column, record),
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
    let tableNameSplit = queryConfig.sql.split(' ');
    let tableName = tableNameSplit[tableNameSplit.length - 1];
    this.setState({
      title: queryConfig.reportHeadName,
      columns: quickColumns,
      advancedFields: columns.filter(data => data.isShow),
      searchFields: columns.filter(data => data.isSearch),
      queryConfigColumns: queryConfig.columns,
      tableName,
    });
  };

  columnComponent = {
    view: (val, column, record) => {
      return (
        <a
          onClick={() => this.onView(record)}
          style={{ color: this.colorChange(val, column.textColorJson) }}
        >
          {this.convertData(val, column.preview, record)}
        </a>
      );
    },
    otherView: (val, column, record) => {
      const value = this.convertData(val, column.preview, record);
      return value != '<空>' ? (
        <a
          onClick={() => this.onOtherView(record, column)}
          style={{ color: this.colorChange(val, column.textColorJson) }}
        >
          {value}
        </a>
      ) : (
        <p3>{value}</p3>
      );
    },
    switch: (val, column, record) => {
      return (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="禁用"
          checked={val == 1}
          onClick={e => this.changeOpenState(e, record, column)}
        />
      );
    },
    colorBadge: (val, column, record) => {
      return (
        <div>
          <Badge
            color={this.colorChange(val, column.textColorJson)}
            text={this.convertData(val, column.preview, record)}
          />
        </div>
      );
    },
    p3: (val, column, record) => {
      return <p3>{this.convertData(val, column.preview, record)}</p3>;
    },
  };

  getRender = (val, column, record) => {
    let component;
    // val = this.convertData(val, column.preview, record)
    if (column.render) {
      component = column.render(val, column, record);
    } else if (column.clickEvent == '1') {
      component = this.columnComponent.view(val, column, record);
    } else if (column.clickEvent == '2') {
      component = this.columnComponent.otherView(val, column, record);
    } else if (column.reportRender && column.reportRender == 1 && loginOrg().type == 'COMPANY') {
      component = this.columnComponent.switch(val, column, record);
    } else if (column.textColorJson) {
      component = this.columnComponent.colorBadge(val, column, record);
    } else {
      component = this.columnComponent.p3(val, column, record);
    }

    return this.customize(record, this.convertData(val, column.preview, record), component, column);
  };

  //初始化数据
  initData = data => {
    // 海鼎底层需要uuid作为StandardTable的rowkey
    if (data?.records && data.records.length > 0 && !data.records[0].uuid) {
      data.records.forEach(row => (row.uuid = guid()));
    }
    let colTotal = data.columnTotal;
    var data = {
      list: data.records,
      pagination: {
        total: data.paging.recordCount,
        pageSize: data.paging.pageSize,
        current: data.page,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({ data, selectedRows: [], colTotal });
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
      this.props.switchTab('view', {
        entityUuid: record[field],
        // searchInfo: {
        //   ...this.state,
        //   columns: this.columns,
        // },
      });
    } else {
      const { selectedRows, batchAction } = this.state;
      if (selectedRows.length > 0) {
        this.props.switchTab('view', {
          entityUuid: selectedRows[0][field],
          // searchInfo: {
          //   ...this.state,
          //   columns: this.columns,
          // },
        });
      } else message.error('请至少选中一条数据！');
    }
  };

  //跳转到其他详情页
  onOtherView = (record, column) => {
    let jumpPaths;
    if (column.jumpPath) {
      jumpPaths = column.jumpPath.split(',');
    }
    console.log(column, 'jumpPaths', jumpPaths);
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
    const code = this.state.formConfig[0].onlFormHead.code
      ? this.state.formConfig[0].onlFormHead.code
      : 'woxiangyaokuaile';
    let that = this;
    if (selectedRows.length !== 0) {
      for (var i = 0; i < selectedRows.length; i++) {
        this.deleteById(selectedRows[i], params);
      }
      dispatch({
        type: 'quick/dynamicDelete',
        payload: { params, code },
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
    const { key } = this.state;
    let defaultCache =
      getTableColumns(key + 'columnInfo') && typeof getTableColumns(key + 'columnInfo') != 'object'
        ? JSON.parse(getTableColumns(key + 'columnInfo'))
        : getTableColumns(key + 'columnInfo');
    let columnsList = [];
    if (defaultCache) {
      columnsList = defaultCache.newList;
    }
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
            let excelColumn = '';
            if (a.preview != 'N') {
              excelColumn = a.preview;
            } else {
              excelColumn = a.key;
            }
            console.log('columnsList', columnsList);
            if (columnsList.length <= 0) {
              sheetfilter.push(excelColumn);
              sheetheader.push(a.title);
            } else if (columnsList.indexOf(a.title) != -1) {
              sheetfilter.push(excelColumn);
              sheetheader.push(a.title);
            }
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

    let defaultSearch = this.defaultSearch();
    if (!defaultSearch) defaultSearch = [];

    //增加查询页数从缓存中读取
    let pageSize = localStorage.getItem(this.props.quickuuid + 'searchPageLine')
      ? parseInt(localStorage.getItem(this.props.quickuuid + 'searchPageLine'))
      : 20;

    if (typeof filter == 'undefined') {
      // console.log('this.state.pageFilters', this.state.pageFilters);
      let queryParams = this.state.pageFilters.superQuery?.queryParams?.filter(item => {
        return (
          item.field != 'dispatchCenterUuid' &&
          item.field != 'dcUuid' &&
          item.field != 'companyuuid'
        );
      });
      let pageFilters = this.state.pageFilters;
      if (this.state.pageFilters.superQuery && exSearchFilter.length == 0) {
        pageFilters = {
          pageSize,
          ...this.state.pageFilters,
          superQuery: {
            ...this.state.pageFilters.superQuery,
            queryParams: [...queryParams, ...this.state.isOrgQuery],
          },
        };
        // console.log('pageFiltersaa', pageFilters);
        this.getData(pageFilters);
      } else {
        this.state.pageFilters = {
          pageSize,
          order: this.state.defaultSort,
          quickuuid: this.props.quickuuid,
          superQuery: {
            matchType: '',
            queryParams: [...this.state.isOrgQuery, ...exSearchFilter, ...defaultSearch],
          },
        }; //增加组织 公司id查询条件
        this.getData(this.state.pageFilters);
      }
    } else if (filter == 'reset') {
      //点击重置时，重置搜索条件
      this.state.pageFilters = {
        pageSize,
        order: this.state.defaultSort,
        quickuuid: this.props.quickuuid,
        superQuery: {
          matchType: '',
          queryParams: [...this.state.isOrgQuery, ...exSearchFilter, ...defaultSearch],
        },
      }; //增加组织 公司id查询条件
      this.getData(this.state.pageFilters);
    } else {
      const { dispatch } = this.props;
      const { columns } = this.state;
      const pageFilters = {
        pageSize,
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
        ...pageFilters,
        order: order,
        page: filter.page + 1,
        pageSize: filter.pageSize,
      };
      //设置页码缓存
      localStorage.setItem(this.state.reportCode + 'searchPageLine', filter.pageSize);
    } else {
      //查询页码重置为1
      queryFilter.page = 1;
    }
    this.state.pageFilters = queryFilter;
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
          hidden={!havePermission(this.state.authority + '.create')}
          onClick={this.onCreate}
          type="primary"
          icon="plus"
        >
          新建
        </Button>
        <Button
          hidden={!havePermission(this.state.authority + '.edit')}
          onClick={this.onUpdate}
          type="primary"
        >
          编辑
        </Button>
        <Button
          hidden={!havePermission(this.state.authority + '.view')}
          onClick={this.onView}
          type="primary"
        >
          查看
        </Button>
        <Button
          hidden={!havePermission(this.state.authority + '.port')}
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
          <Button hidden={!havePermission(this.state.authority + '.delete')}>删除</Button>
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
    const { superQuery } = this.state.pageFilters;
    let filterValue = {};
    if (superQuery) {
      for (const item of superQuery.queryParams) {
        if (item.type == 'Date') {
          let dateVal = item.val.split('||');
          filterValue[item.field] = [
            moment(dateVal[0], 'YYYY-MM-DD'),
            moment(dateVal[1], 'YYYY-MM-DD'),
          ];
        } else if (item.type == 'DateTime') {
          let dateVal = item.val.split('||');
          filterValue[item.field] = [
            moment(dateVal[0], 'YYYY-MM-DD HH:mm:ss'),
            moment(dateVal[1], 'YYYY-MM-DD HH:mm:ss'),
          ];
        } else if (item.type == 'Time') {
          let dateVal = item.val.split('||');
          filterValue[item.field] = [
            moment(dateVal[0], 'HH:mm:ss'),
            moment(dateVal[1], 'HH:mm:ss'),
          ];
        } else {
          filterValue[item.field] = item.val;
        }
      }
    }
    return (
      <div>
        <SimpleQuery
          selectFields={this.state.searchFields}
          filterValue={filterValue}
          refresh={this.onSearch}
          reportCode={this.state.reportCode}
          isOrgQuery={this.state.isOrgQuery}
        />
      </div>
    );
  };
}
