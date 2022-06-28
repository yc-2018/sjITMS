/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-25 11:25:33
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { Form, Badge, Button, message } from 'antd';
import { colWidth } from '@/utils/ColWidth';
import { connect } from 'dva';
import SearchPage from './SearchPage';
import { guid, convertDateToTime } from '@/utils/utils';
import { aborted, shipRollback } from '@/services/sjitms/ScheduleBill';
import { loginUser, loginCompany, loginOrg } from '@/utils/LoginContext';
import { queryAllData } from '@/services/quick/Quick';
import { getLodop } from '@/pages/Component/Printer/LodopFuncs';
import { render } from 'react-dom';
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
      printPage: undefined,
      data: [],
      isOrgQuery: [],
      selectedRows: [],
      historyRows: {},
      width: '100%',
      scrollValue: {
        x: 4100,
        y: 'calc(50vh)',
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
    if (data === '' || data == undefined || data === '[]') return '<空>';
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
    const { printPage } = this.state;
    return (
      <div>
        <Button style={{ marginBottom: -5 }} onClick={() => this.onBatchRollBack()}>
          取消批准
        </Button>
        <Button style={{ marginLeft: 12 }} onClick={() => this.onBatchAbort()}>
          作废
        </Button>
        <Button style={{ marginLeft: 12 }} onClick={() => this.onMoveCar()}>
          移车
        </Button>
        <Button style={{ marginLeft: 12 }} onClick={() => this.handlePrint()} icon="printer">
          打印
        </Button>
        <div id="printPage" style={{ display: 'none' }}>
          {printPage}
        </div>
      </div>
    );
  };

  //打印
  handlePrint = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.warn('请选择需要打印的排车单');
      return;
    }
    const hide = message.loading('加载中...', 0);
    let LODOP = getLodop();
    if (LODOP == undefined) return;
    LODOP.PRINT_INIT('排车单打印');
    LODOP.SET_PRINT_PAGESIZE(2, 281, 240, '280mm*241mm'); //1代表横的打印 2代表竖的打印 3纵向打印，宽度固定，高度按打印内容的高度自适应；
    LODOP.SET_PRINT_MODE('PRINT_DUPLEX', 1); //去掉双面打印
    LODOP.SET_SHOW_MODE('LANDSCAPE_DEFROTATED', 1); //纸张旋转横过来
    LODOP.SET_PRINT_STYLEA(0, 'Horient', 2); //打印项在纸张中水平居中
    const strStyle = '<style> td,th {height:30px}</style>';
    await this.buildPrintPage();
    const printPages = document.getElementById('printPage').childNodes;
    printPages.forEach(page => {
      LODOP.NewPageA();
      LODOP.ADD_PRINT_TABLE('2%', '2%', '96%', 220, strStyle + page.innerHTML);
    });
    LODOP.PREVIEW();
    hide();
    this.setState({ printPage: undefined });
  };

  buildPrintPage = async () => {
    const { selectedRows } = this.state;
    const printPages = [];
    for (let index = 0; selectedRows.length > index; index++) {
      const response = await queryAllData({
        quickuuid: 'sj_itms_schedule_order',
        superQuery: {
          queryParams: [
            {
              field: 'billuuid',
              type: 'VarChar',
              rule: 'eq',
              val: selectedRows[index].UUID,
            },
          ],
        },
      });
      const scheduleDetails = response.success ? response.data.records : [];
      const printPage = drawPrintPage(selectedRows[index], scheduleDetails);
      printPages.push(printPage);
    }
    this.setState({ printPage: printPages });
  };
}
const drawPrintPage = (schedule, scheduleDetails) => {
  return (
    <div>
      <table
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}
        border={1}
        cellPadding={0}
        cellSpacing={0}
      >
        <thead>
          <tr style={{ height: 50 }}>
            <th colspan={2} style={{ border: 0 }} />
            <th colspan={4} style={{ border: 0 }}>
              <div style={{ fontSize: 22, textAlign: 'center' }}>广东时捷物流有限公司排车单</div>
            </th>
            <th colspan={2} style={{ border: 0 }}>
              <div style={{ fontSize: 16, textAlign: 'center' }}>
                <span>第</span>
                <font tdata="PageNO" color="blue">
                  ##
                </font>
                <span>页/共</span>
                <font color="blue" style={{ textDecoration: 'underline blue' }} tdata="PageCount">
                  ##
                </font>
                <span>页</span>
              </div>
            </th>
          </tr>

          <tr>
            <th colspan={8} style={{ border: 0 }}>
              <div style={{ display: 'flex', textAlign: 'left' }}>
                <div style={{ flex: 1 }}>调度签名：</div>
                <div style={{ flex: 1 }}>装车人签名：</div>
                <div style={{ flex: 1 }}>打印时间： {convertDateToTime(new Date())}</div>
                <div style={{ flex: 1, textAligin: 'left' }}>制单人： {loginUser().name}</div>
              </div>
            </th>
          </tr>

          <tr>
            <th colspan={8} style={{ border: 0 }}>
              <div style={{ display: 'flex', textAlign: 'left' }}>
                <div style={{ flex: 1 }}>单号： {schedule.BILLNUMBER}</div>
                <div style={{ flex: 1 }}> 车牌号： {schedule.VEHICLEPLATENUMBER}</div>
                <div style={{ flex: 1 }}> 送货员： {schedule.STEVEDORE || ''}</div>
                <div style={{ flex: 1 }} />
              </div>
            </th>
          </tr>

          <tr>
            <th width={50}>序号</th>
            <th width={120}>销售单号</th>
            <th width={100}>客户编号</th>
            <th width={150}>客户名称</th>
            <th width={80}>整件</th>
            <th width={80}>散件</th>
            <th width={100}>板位</th>
            <th width={100}>备注</th>
          </tr>
        </thead>
        <tbody>
          {scheduleDetails ? (
            scheduleDetails.map((item, index) => {
              return (
                <tr style={{ textAlign: 'center' }}>
                  <td>{index + 1}</td>
                  <td width={120}>{item.ORDERNUMBER}</td>
                  <td>{item.DELIVERYPOINTCODE}</td>
                  <td>{item.DELIVERYPOINTNAME}</td>
                  <td>{item.REALCARTONCOUNT}</td>
                  <td>{item.REALSCATTEREDCOUNT}</td>
                  <td />
                  <td>{item.NOTE || ''}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
        <tfoot>
          <tr style={{ height: 35 }}>
            <td colspan={4}>合计:</td>
            <td style={{ textAlign: 'center' }}>
              <font color="blue" tdata="SubSum" format="#,##" tindex="5">
                ######
              </font>
            </td>
            <td style={{ textAlign: 'center' }}>
              <font color="blue" tdata="SubSum" format="#,##" tindex="6">
                ######
              </font>
            </td>
            <td colspan={2} />
          </tr>
          <tr style={{ height: 35 }}>
            <td colspan={8}>备注:</td>
          </tr>
          <tr style={{ height: 35 }}>
            <td colspan={8} style={{ border: 0 }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1 }}>装车员:</div>
                <div style={{ flex: 1 }}>司机:</div>
                <div style={{ flex: 1 }}> 送货员:</div>
                <div style={{ flex: 1 }}>调度:</div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
