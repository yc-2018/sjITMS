import { connect } from 'dva';
import { Form, Button, Input, Divider, message, Menu, Dropdown, Tooltip, Icon, Row, Col } from 'antd';
import Empty from '@/pages/Component/Form/Empty';
import { add, accAdd, accMul, accDiv } from '@/utils/QpcStrUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName, convertDateToTime } from '@/utils/utils';
import { loginOrg, loginCompany, getActiveKey } from '@/utils/LoginContext';
import SearchPage from './SearchPage';
import moment from 'moment';
import { colWidth } from '@/utils/ColWidth'
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { shipPlanBillDispatchLocale } from '../ShipPlanBillDispatch/ShipPlanBillDispatchLocale';
import BadgeUtil from '@/pages/Component/BadgeUtil'
import PrintButton from '@/pages/Component/Printer/PrintButton'
import { State, Type, editableState } from './DispatchCenterShipPlanBillContants';
import ShipPlanBillCreateModal from './ShipPlan/ShipPlanBillCreateModal';

@connect(({ dispatchCenterShipPlanBill, chargeLoading, dispatchCenterShipBill, loading }) => ({
  dispatchCenterShipPlanBill,
  chargeLoading,
  dispatchCenterShipBill,
  loading: loading.models.dispatchCenterShipPlanBill,
}))
@Form.create()
export default class DispatchCenterShipPlanBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      // data: props.dispatchCenterShipPlanBill.data,
      data: {
        list: [],
        pagination: {},
      },
      selectedRows: [],
      suspendLoading: false,
      createModalVisible: false,
      reportParams: [],
      hasOnRow: true,
      searchPageType: 'LINE',
      tabTrue: props.tabTrue,
      showCreatePage: props.showCreatePage,
      width: "100%",
      key: 'dispatchCenterShipPlanBill.search.table',
      scrollValue: {
        x: 4100,
        y: "calc(40vh)"

      },
      pageFilter: {
        page: 0,
        pageSize: 50,
        sortFields: {},
        searchKeyValues: {},
        likeKeyValues: {},
        key: 'dispatchCenterShipPlanBill.search.table',
      },
      editModalVisible: false,
      targetShipPlanBill: {}
    }
    this.state.pageFilter = this.props.pageFilter;
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this);
    if (!this.state.tabTrue) {
      this.refreshTable(this.props.pageFilter ? this.props.pageFilter : null);
    } else {
      this.setState({
        data: {
          list: [],
          pagination: {},
        },
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dispatchCenterShipPlanBill.data != this.props.dispatchCenterShipPlanBill.data) {
      this.setState({
        data: nextProps.dispatchCenterShipPlanBill.data,
        tabTrue: true
      });
    }
    if (nextProps.pageFilter != this.props.pageFilter) {
      this.refreshTable(this.props.pageFilter ? this.props.pageFilter : null);
      this.setState({
        pageFilter: { ...this.props.pageFilter }
      })
    }


  }

  changeSelectedRows = (selectedRows) => {
    let param = [];
    for (let i = 0; i < selectedRows.length; i++) {
      param.push({
        billNumber: selectedRows[i].billNumber
      })
    }
    this.setState({
      reportParams: param
    }, () => { });
    this.props.refreshView(null, selectedRows);
  };

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }
    let queryFilter = { ...pageFilter };
    if (filter && filter.searchKeyValues) {
      filter.searchKeyValues.vehicleStr = filter.searchKeyValues.vehicleStr ? filter.searchKeyValues.vehicleStr.toString() : '';
      filter.searchKeyValues.driverCodeName = filter.searchKeyValues.driverCodeName ? filter.searchKeyValues.driverCodeName.toString() : '';
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'dispatchCenterShipPlanBill/query',
      payload: queryFilter,
    });
  };

  onApprove = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'dispatchCenterShipPlanBill/onApprove',
        payload: {
          billUuid: record.uuid,
          version: record.version,
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
            return;
          }
        }
      })
    })
  }

  onAbort = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'dispatchCenterShipPlanBill/onAbort',
        payload: {
          billUuid: record.uuid,
          version: record.version,
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
            return;
          }
        }
      })
    })
  }

  onBeginShip = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'chargeLoading/beginloading',
        payload: {
          scheduleBillUuid: record.uuid
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
            return;
          }
        }
      })
    })
  }

  onEndShip = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'chargeLoading/finishloading',
        payload: {
          scheduleBillUuid: record.uuid
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
            return;
          }
        }
      })
    })
  }

  onCheckOut = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'dispatchCenterShipBill/updateDispatchTime',
        payload: {
          billNumber: record.billNumber
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
            return;
          }
        }
      })
    })
  }

  onCheckIn = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'dispatchCenterShipBill/updateReturnTime',
        payload: {
          billNumber: record.billNumber
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
            return;
          }
        }
      })
    })
  }

  onRollBack = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'dispatchCenterShipPlanBill/onRollBack',
        payload: {
          billUuid: record.uuid,
          version: record.version,
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
            return;
          }
        }
      })
    })
  }

  onSave = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'dispatchCenterShipPlanBill/modifybillonly',
        payload: record,
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
            return;
          }
        }
      })
    })
  }

  handleFieldChange = (e, fieldName, line) => {
    const { data } = this.state;
    const target = data.list[line];
    if (fieldName === 'note') {
      target.note = e.target.value;
    }
    data.list[line] = target;
    this.setState({
      data: {...data}

    })
  }

  /**
   * 批量作废
   */
  onBatchAbort = () => {
    this.setState({
      batchAction: commonLocale.abortLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量回滚
   */
  onBatchRollBack = () => {
    this.setState({
      batchAction: shipPlanBillDispatchLocale.rollBack
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量保存
   */
  onBatchSave= () => {
    this.setState({
      batchAction: '保存'
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量批准
   */
  onBatchApprove = () => {
    this.setState({
      batchAction: commonLocale.approveLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量开始装车
   */
  onBatchBeginShip = () => {
    this.setState({
      batchAction: '开始装车'
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量结束装车
   */
  onBatchEndShip = () => {
    this.setState({
      batchAction: '结束装车'
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量出车
   */
  onBatchCheckOut = () => {
    this.setState({
      batchAction: '出车'
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量回车
   */
  onBatchCheckIn = () => {
    this.setState({
      batchAction: '回车'
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  // 批量操作
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.abortLocale) {
          if (selectedRows[i].stat == State.Approved.name || selectedRows[i].stat == State.Delivering.name
            || selectedRows[i].stat == State.Shiped.name || selectedRows[i].stat == State.Returned.name
          ) {
            this.onAbort(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === shipPlanBillDispatchLocale.rollBack) {
          if (selectedRows[i].stat == State.Approved.name) {
            this.onRollBack(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === commonLocale.approveLocale) {
          if (selectedRows[i].stat == State.Saved.name) {
            this.onApprove(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === '开始装车') {
          if (selectedRows[i].stat == State.Approved.name) {
            this.onBeginShip(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === '结束装车') {
          if (selectedRows[i].stat == State.Shipping.name) {
            this.onEndShip(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        }  else if (batchAction === '删除') {
          if (selectedRows[i].stat == State.Saved.name) {
            this.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === '出车') {
          if (selectedRows[i].stat == State.Approved.name || selectedRows[i].stat == State.Shiped.name) {
            this.onCheckOut(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === '回车') {
          if (selectedRows[i].stat == State.Delivering.name) {
            this.onCheckIn(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === '保存') {
          this.onSave(selectedRows[i], true).then(res => {
            bacth(i + 1)
          })
        } else {
          this.setState({
            suspendLoading: false
          })
        }
      }
    }

    bacth(0);
  }

  handleShowExcelImportPage = () => {
    const { serialArch } = this.state;
    this.props.refreshLineBillPage('true', serialArch);
  };

  onCancelModal = () => {
    this.setState({
      createModalVisible: false,
    });
  };

  onCreate = () => {
    this.setState({
      createModalVisible: true,
    })
  };


  onClickRow = (record) => {
    this.props.refreshView(record, null);
  }
  /**
   * 已批准、装车中、已装车、配送中
   * 允许修改司机等随车人员的信息
   */
  onEdit = (record, e) => {
 
    if (e) { //阻止冒泡 不考虑IE
      e.stopPropagation()
    }

    this.setState({
      editModalVisible: true,
      targetShipPlanBill: record
    })
  }

  /**
   * 查看详情
   */
  onCancelModal = (record) => {
    this.setState({
      editModalVisible: false,
      targetShipPlanBill: {}
    })
  }

  onBatchRemove = () => {
    this.setState({
      batchAction: '删除',
      content: '排车单'
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onRemove =(record,batch)=>{
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'vehicleDispatching/onRemove',
        payload: record,
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            that.refreshTable(that.props.pageFilter ? that.props.pageFilter : null);
            return;
          }
        }
      });
    })
  }

  /**
   * 绘制编辑对话框
   */

  drawBussiness = () => {
    const { editModalVisible, targetShipPlanBill, } = this.state;

    return (
      <div>
        <ShipPlanBillCreateModal
          visible={editModalVisible}
          entityUuid={targetShipPlanBill.uuid}
          onCancelModal={this.onCancelModal}
          noShipGroup={true}
          edit={true}
        />
      </div>
    )
  }

  columns = [
    {
      title: '操作',
      key: 'operate',
      width: 80,
      fixed: 'left',
      render: (val, record) => <a disabled={!editableState.includes(record.stat)} onClick={(e) => this.onEdit(record, e)}>{'编辑'}</a>
    },
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth - 50,
      render: val => val ? val : <Empty />
    },
    {
      title: '门店数',
      dataIndex: 'deliveryPointCount',
      sorter: true,
      width: 80,
      render: val => val ? val : <Empty />
    },
    {
      title: '状态',
      dataIndex: 'stat',
      sorter: true,
      width: 100,
      render: (val, record) => record.stat ? <BadgeUtil value={record.stat.toUpperCase()} /> : <Empty />
    },
    {
      title: '装车状态',
      dataIndex: 'shipStat',
      sorter: true,
      width: 150,
      render: (val, record) => {
        if (val && val === 'ship') {
          return <span>{'可装车'}</span>
        } else if (val && val === 'nonship') {
          return <span>{'不可装车'}</span>
        } else {
          return <Empty />
        }
      }
    },
    {
      title: '驾驶员',
      dataIndex: 'driver',
      width: 120,
      render: (val) => {
        return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />
      }
    },
    {
      title: '线路号',
      dataIndex: 'archLineCode',
      width: 120,
      render: val => val ? convertCodeName(val) : <Empty />
    },
    {
      title: '打印时间',
      dataIndex: 'printTime',
      sorter: true,
      width: 160,
      render: (val, record) => <span>{record.printTime ? record.printTime : <Empty />}</span>,
    },
    {
      title: '装车开始时间  ',
      dataIndex: 'beginShipTime',
      width: 160,
      render: (val, record) => <span>{record.beginShipTime ? record.beginShipTime : <Empty />}</span>,
    },
    {
      title: '车牌号',
      dataIndex: 'plateNumber',
      width: 100,
      render: val => val ? val : <Empty />
    },
    {
      title: '信箱号',
      dataIndex: 'mailNumber',
      width: 160,
      render: val => val ? val : <Empty />
    },
    {
      title: '取货点',
      dataIndex: 'pickUpPoint',
      width: 160,
      render: val => val ? convertCodeName(val) : <Empty />
    },
    {
      title: '装车结束时间',
      width: 160,
      render: (val, record) => <span>{record.finishShipTime ? record.finishShipTime : <Empty />}</span>,
    },
    {
      title: '发车时间',
      width: 160,
      render: (val, record) => <span>{record.dispatchTime ? record.dispatchTime : <Empty />}</span>,
    },
    {
      title: '回车时间',
      width: 160,
      render: (val, record) => <span>{record.returnTime ? record.returnTime : <Empty />}</span>,
    },
    {
      title: '送货确认时间',
      width: 160,
      render: (val, record) => <span>{record.confirmTime ? record.confirmTime : <Empty />}</span>,
    },
    {
      title: '作废时间',
      dataIndex: 'abortTime',
      sorter: true,
      width: 160,
      render: (val, record) => <span>{record.abortTime ? record.abortTime : <Empty />}</span>,
    },
    {
      title: '作废操作用户',
      dataIndex: 'abortUser',
      sorter: true,
      width: 160,
      render: val => val ? convertCodeName(val) : <Empty />
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: val => val ? Type[val].caption : <Empty />
    },
    {
      title: '出车公里数',
      dataIndex: 'dispatchMileage',
      width: 160,
      render: val => val ? val : 0

    },
    {
      title: '回车公里数',
      dataIndex: 'returnMileage',
      width: 160,
      render: val => val ? val : 0
    },
    {
      title: '行驶里程',
      dataIndex: 'travelMileage',
      width: 160,
      render: val => val ? val : 0
    },
    {
      title: '行驶时间',
      width: 160,
      render: (val, record) => <span>{record.travelTime ? record.travelTime : <Empty />}</span>,
    },
    {
      title: '送货员',
      dataIndex: 'deliveryMan',
      width: 160,
      render: val => val ? convertCodeName(val) : <Empty />
    },
    {
      title: '批准时间',
      dataIndex: 'approveTime',
      sorter: true,
      width: 160,
      render: val => <span>{val ? val : <Empty />}</span>,
    },
    {
      title: '体积',
      dataIndex: 'volume',
      width: 100,
      render: val => val ? val : 0
    },
    {
      title: '数量',
      dataIndex: 'weight',
      width: 100,
      render: val => val ? val : 0
    },
    {
      title: '车型',
      dataIndex: 'vehicleType',
      sorter: true,
      width: 150,
      render: val => val ? convertCodeName(val) : <Empty />
    },
    {
      title: '调度人',
      dataIndex: 'approveUser',
      sorter: true,
      width: 160,
      render: val => val ? convertCodeName(val) : <Empty />
    },
    {
      title: '整件(估)',
      dataIndex: 'cartonCount',
      width: 160,
      render: val => val ? val : 0
    },
    {
      title: '备注',
      dataIndex: 'note',
      width: 150,
      render:(val,record, index)=>{
        return (
          <Input
            value={record.note}
            onChange={
              e => this.handleFieldChange(e, 'note', index)
            }
          />
        )
      }
    }
  ];

  drawOther = () => {
    return <div>
      <Button style={{ marginBottom:'10px' }} key={1} onClick={() => this.onBatchRemove()}>
        {'删除'}
      </Button>
      <Button style={{  marginLeft: '12px',marginBottom:'10px' }} key={2} onClick={() => this.onBatchApprove()}>
        {commonLocale.batchApproveLocale}
      </Button>
      <Button style={{ marginLeft: '12px',marginBottom:'10px' }} key={3} onClick={() => this.onBatchAbort()}>
        {commonLocale.batchAbortLocale}
      </Button>
      <Button style={{ marginLeft: '12px', marginBottom:'10px' }} key={4} onClick={() => this.onBatchRollBack()}>
        {shipPlanBillDispatchLocale.batchRollBack}
      </Button>
      <Button style={{ marginLeft: '12px', marginBottom:'10px' }} key={5} onClick={() => this.onBatchBeginShip()}>
        {'开始装车'}
      </Button>
      <Button style={{ marginLeft: '12px', marginBottom:'10px' }} key={6} onClick={() => this.onBatchEndShip()}>
        {'结束装车'}
      </Button>
      <Button style={{ marginLeft: '12px', marginBottom:'10px' }} key={7} onClick={() => this.onBatchCheckOut()}>
        {'出车'}
      </Button>
      <Button style={{ marginLeft: '12px', marginBottom:'10px' }} key={8} onClick={() => this.onBatchCheckIn()}>
        {'回车'}
      </Button>
      <Button style={{ marginLeft: '12px', marginRight: '12px', marginBottom:'10px' }} key={9} onClick={() => this.onBatchSave()}>
        {'保存'}
      </Button>
      <PrintButton
        style={{ marginBottom:'10px' }}
        key='printButton'
        reportParams={this.state.reportParams}
        moduleId={'SHIPPLANBILL'} />
    </div>
  }

}
