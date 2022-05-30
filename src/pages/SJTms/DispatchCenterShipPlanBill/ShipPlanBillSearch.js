/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-26 11:19:33
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Form, Badge, Button, message } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import { connect } from 'dva';
import SearchPage from './SearchPage';
import { guid } from '@/utils/utils';
import { aborted, shipRollback } from '@/services/sjitms/ScheduleBill';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class ShipPlanBillSearch extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      suspendLoading: false,
      hasOnRow: true,
      searchPageType: 'LINE',
      columns: [],
      searchFields: [],
      advancedFields: [],
      data: [],
      isOrgQuery: [],
      selectedRows: [],
      historyRows: {},
      width: '100%',
      scrollValue: {
        x: 4100,
        y: 'calc(40vh)',
      },
    };
    this.state.pageFilter = this.props.pageFilter;
  }

  columns = [
    {
      title: '过度数据1',
    },
    {
      title: '过度数据2',
    },
    {
      title: '过度数据3',
    },
    {
      title: '过度数据4',
    },
    {
      title: '过度数据5',
    },
  ];

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    this.queryCoulumns();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pageFilter != this.props.pageFilter) {
      this.refreshTable(nextProps.pageFilter ? nextProps.pageFilter : null);
      this.setState({
        pageFilter: { ...nextProps.pageFilter },
      });
    }
  }

  //获取列配置
  queryCoulumns = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: this.props.reportCode,
        sysCode: 'tms',
      },
      callback: response => {
        if (response.result) {
          this.initConfig(response.result);

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
          this.refreshTable(this.props.pageFilter ? this.props.pageFilter : null);
        }
      },
    });
  };

  //初始化配置
  initConfig = queryConfig => {
    const columns = queryConfig.columns;
    const editableState = ['Saved', 'Approved', 'Shipping', 'Shiped'];
    let quickColumns = new Array();
    columns.filter(data => data.isShow).forEach(column => {
      let OptColumn = {
        title: '操作',
        width: colWidth.operateColWidth,
        render: (val, record) => {
          return (
            <a
              disabled={!editableState.includes(record.STAT)}
              onClick={() => {
                this.props.memberModalClick(record);
              }}
            >
              编辑
            </a>
          );
        },
      };
      quickColumns.push(OptColumn);
      let e = {
        column: column,
      };
      const qiuckcolumn = {
        title: column.fieldTxt,
        dataIndex: column.fieldName,
        key: column.fieldName,
        sorter: column.orderType != 0,
        width: column.fieldWidth,
        fieldType: column.fieldType,
        render:
          column.clickEvent == '1'
            ? (val, record) => {
                const component = (
                  <a
                    onClick={this.onView.bind(this, record)}
                    style={{ color: this.colorChange(val, column.textColorJson) }}
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
                      style={{ color: this.colorChange(val, column.textColorJson) }}
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
                  if (column.textColorJson) {
                    const component = (
                      <div>
                        <Badge
                          color={this.colorChange(val, column.textColorJson)}
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

      quickColumns.push(qiuckcolumn);
    });
    this.columns = quickColumns;
    this.setState({
      columns: quickColumns,
      advancedFields: columns.filter(data => data.isShow),
      searchFields: columns.filter(data => data.isSearch),
    });
  };

  colorChange = (data, color) => {
    if (!color) return '';

    let colorItem = color.find(item => item.ITEM_VALUE == data);
    if (!colorItem) return '';

    return colorItem.TEXT_COLOR;
  };

  //数据转换
  convertData = (data, preview, record) => {
    if (!data) return '<空>';
    if (!preview) return data;
    return record[preview];
  };

  //自定义报表的render
  customize(record, val, component, column) {
    let e = {
      column: column,
      record: record,
      component: component,
      val: val,
    };

    return e.component;
  }

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
   * 刷新/重置
   */
  refreshTable = filter => {
    let queryFilter;
    if (filter) {
      var order = '';
      for (var key in filter.sortFields) {
        var sort = filter.sortFields[key] ? 'descend' : 'ascend';
        order = key + ',' + sort;
      }
      if (typeof filter.superQuery == 'undefined') {
        queryFilter = {
          order: order,
          ...filter,
          page: filter.page ? filter.page + 1 : 0 + 1,
          pageSize: filter.pageSize ? filter.pageSize : 20,
          superQuery: {
            matchType: filter.matchType,
            queryParams: [...this.state.isOrgQuery],
          },
        };
      } else {
        queryFilter = {
          order: order,
          ...filter,
          page: filter.page ? filter.page + 1 : 0 + 1,
          pageSize: filter.pageSize ? filter.pageSize : 20,
        };
      }
    }
    this.getData(queryFilter);
  };

  //查询数据
  getData = pageFilter => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryData',
      payload: pageFilter,
      callback: response => {
        if (response.data) {
          this.initData(response.data);
        }
      },
    });
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
        total: data.paging.recordCount,
        pageSize: data.paging.pageSize,
        current: data.page,
        showTotal: total => `共 ${total} 条`,
      },
    };
    this.setState({ data, selectedRows: [] });
  };

  changeSelectedRows = selectedRows => {
    const { historyRows } = this.state;
    if (historyRows.UUID == selectedRows.UUID) {
      this.props.refreshView(true, selectedRows);
      this.setState({ historyRows: {} });
    } else {
      this.props.refreshView(false, selectedRows);
      this.setState({ historyRows: selectedRows });
    }
  };

  /**
   * 批量回滚
   */
  onBatchRollBack = () => {
    this.setState({
      batchAction: '回滚',
    });
    this.handleBatchProcessConfirmModalVisible(true);
  };

  /**
   * 批量作废
   */
  onBatchAbort = () => {
    this.setState({
      batchAction: '作废',
    });
    this.handleBatchProcessConfirmModalVisible(true);
  };

  onMoveCar = () => {
    const { selectedRows } = this.state;
    // console.log('selectedRows', selectedRows);
    if (selectedRows.length === 1) {
      this.props.removeCarModalClick(selectedRows);
    } else message.error('请选中一条数据！');
  };

  onRollBack = (record, batch) => {
    const that = this;
    return new Promise(function(resolve, reject) {
      shipRollback(record.UUID).then(result => {
        if (result && batch) {
          that.batchCallback(result, record);
          resolve({ success: result.success });
          that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
          return;
        }
      });
    });
  };

  onAbort = (record, batch) => {
    const that = this;
    return new Promise(function(resolve, reject) {
      aborted(record.UUID).then(result => {
        if (result && batch) {
          that.batchCallback(result, record);
          resolve({ success: result.success });
          that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
          return;
        }
      });
    });
  };

  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;
    const that = this;
    let bacth = i => {
      // console.log(i);
      if (i < selectedRows.length) {
        if (batchAction === '回滚') {
          if (selectedRows[i].STAT == 'Approved') {
            this.onRollBack(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === '作废') {
          if (
            selectedRows[i].STAT == 'Approved' ||
            selectedRows[i].STAT == 'Delivering' ||
            selectedRows[i].STAT == 'Shiped'
          ) {
            this.onAbort(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        }
      }
    };
    bacth(0);
  };

  drawOther = () => {
    return (
      <div>
        <Button style={{ marginBottom: '-5px' }} onClick={() => this.onBatchRollBack()}>
          取消批准
        </Button>
        <Button style={{ marginLeft: '12px' }} onClick={() => this.onBatchAbort()}>
          作废
        </Button>
        <Button style={{ marginLeft: '12px' }} onClick={() => this.onMoveCar()}>
          移车
        </Button>
      </div>
    );
  };
}
