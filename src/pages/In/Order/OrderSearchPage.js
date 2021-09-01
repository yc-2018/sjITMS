import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, Divider, message, Menu, Dropdown, Tooltip } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import OrderSearchForm from './OrderSearchForm';
import { LogisticMode, State } from './OrderContants';
import { orderLocale } from './OrderLocale';
import { ORDER_RES } from './OrderPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { orgType } from '@/utils/OrgType';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';
@connect(({ order, loading }) => ({
  order,
  loading: loading.models.order,
}))
@Form.create()
export default class OrderSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: orderLocale.title,
      data: props.order.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      operate: '',
      modalVisible: false,
      billNumber: '',
      suspendLoading: false,
      reportParams: [],
      key: 'order.search.table'
    }
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
    // this.state.pageFilter.searchKeyValues.days = localStorage.getItem(window.location.hostname + "-queryBillDays");
  }
  componentDidMount() {
    if(this.props.order.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }
  // componentWillReceiveProps(nextProps) {
  //   console.log('走了订单的变化周期=========')
  //   this.setState({
  //     data: nextProps.order.data
  //   });
  // }
  changeSelectedRows = (selectedRows) => {
    let param = [];
    for (let i = 0; i < selectedRows.length; i++) {
      param.push({
        billNumber: selectedRows[i].billNumber
      })
    }
    this.setState({
      reportParams: param
    }, () => { })
  }
  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    console.log('重新刷新了订单=========')
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
        reportParams: []
      });
      if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
        pageFilter.searchKeyValues.days = getQueryBillDays()
      }
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'order/query',
      payload: queryFilter,
      callback: response => {
        if (response && response.success && response.data) {
          this.setState({
            data:{
              list: response.data.records ? response.data.records : [],
              pagination: {
                total: response.data.paging.recordCount,
                pageSize: response.data.paging.pageSize,
                current: response.data.page + 1,
                showTotal: total => `共 ${total} 条`,
              }
            }
          })
        }
      }
    });
  };
  /**
   * 搜索
   */
  onSearch = (data) => {
    const {
      pageFilter
    } = this.state;
    pageFilter.page = 0;
    var beginCreateTime = '';
    var endCreateTime = '';
    var beginExpireDate = '';
    var endExpireDate = '';
    var days = '';
    let ownerUuid = undefined;
    let vendorUuid = undefined;
    let wrhUuid = undefined;
    if (data) {
      if (data.owner && data.owner != '') {
        ownerUuid = JSON.parse(data.owner).uuid;
      }
      if (data.vendor) {
        vendorUuid = JSON.parse(data.vendor).uuid;
      }
      if (data.wrh) {
        wrhUuid = JSON.parse(data.wrh).uuid;
      }
      if (data.createTime) {
        beginCreateTime = moment(data.createTime[0]).format('YYYY-MM-DD')
        endCreateTime = moment(data.createTime[1]).format('YYYY-MM-DD')
      }
      if (data.expireDate) {
        beginExpireDate = moment(data.expireDate[0]).format('YYYY-MM-DD')
        endExpireDate = moment(data.expireDate[1]).format('YYYY-MM-DD')
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        beginCreateTime: beginCreateTime,
        endCreateTime: endCreateTime,
        beginExpireDate: beginExpireDate,
        endExpireDate: endExpireDate,
        ownerUuid: ownerUuid,
        vendorUuid: vendorUuid,
        wrhUuid: wrhUuid,
        isContainTime: '0',
        days: days
      }
      pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        days: getQueryBillDays()
      }
      pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
    }
    this.refreshTable();
  }

  onType = () => {
    this.props.dispatch({
      type: 'order/showPage',
      payload: {
        showPage: 'type'
      }
    });
  }
  /**
   * 显示新建/编辑界面
   */
  onCreate = (uuid) => {
    const payload = {
      showPage: 'create'
    }
    if (uuid != '') {
      payload.entityUuid = uuid;
    }
    this.props.dispatch({
      type: 'order/showPage',
      payload: {
        ...payload
      }
    });
  }
  /**
   * 批量审核
   */
  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 批量作废
   */
  onBatchAbort = () => {
    this.setState({
      batchAction: commonLocale.abortLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 批量完成
   */
  onBatchFinish = () => {
    this.setState({
      batchAction: commonLocale.finishLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 批量删除
   */
  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 批量复制
   */
  onBatchCopy = () => {
    this.setState({
      batchAction: commonLocale.copyLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 批量核价
   */
  onBatchPricing = () => {
    this.setState({
      batchAction: orderLocale.pricing,
      content: orderLocale.pricingContent
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 生成预检单
   */
  onGenPreview = () => {
    const { selectedRows } = this.state;
    let orderBillNumbers = [];
    if (Array.isArray(selectedRows) && selectedRows.length === 0){
      message.warn('请选择要预检的订单。')
      return;
    }
    selectedRows.forEach(function(record) {
      orderBillNumbers.push({billNumber: record.billNumber});
    })
    this.props.dispatch(routerRedux.push({
      pathname: '/in/preview',
      payload: {
        showPage: 'create',
        orderBillNumbers: orderBillNumbers
      }
    }));
  }
  // 批量操作
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;
    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.finishLocale) {
          if ((selectedRows[i].state === State.INITIAL.name || selectedRows[i].state === State.BOOKING.name
            || selectedRows[i].state === State.BOOKED.name || selectedRows[i].state === State.INPROGRESS.name)
            && selectedRows[i].notAllowFinish == false) {
            that.onMakeSureFinish(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state === State.SAVED.name) {
            that.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state === State.SAVED.name) {
            that.onAudit(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === commonLocale.abortLocale) {
          if (selectedRows[i].state === State.INITIAL.name) {
            that.onAbort(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === commonLocale.copyLocale) {
          that.onCopy(selectedRows[i], true).then(res => {
            bacth(i + 1);
          })
        } else if (batchAction === orderLocale.pricing) {
          if (selectedRows[i].pricing == true && (selectedRows[i].state === State.INITIAL.name || selectedRows[i].state == State.BOOKING.name ||
            selectedRows[i].state == State.BOOKED.name || selectedRows[i].state == State.PREVEXAM.name || selectedRows[i].state == State.INPROGRESS.name)) {
            that.onPricing(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }
    bacth(0);
  }
  /**
   * 单一审核
   */
  onAudit = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'order/audit',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.auditSuccessLocale)
          }
        }
      })
    })
  }
  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'order/delete',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.removeSuccessLocale)
          }
        }
      })
    })
  }
  /**
   * 作废
   */
  onAbort = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'order/abort',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.abortSuccessLocale)
          }
        }
      })
    })
  }
  /**
   * 复制
   */
  onCopy = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'order/copy',
        payload: {
          billNumber: record.billNumber,
          dcUuid: record.dcUuid
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.copySuccessLocale)
          }
        }
      })
    })
  }
  /**
   * 核价
   */
  onPricing = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'order/totalPricing',
        payload: {
          billUuid: record.uuid,
          version: record.version
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(orderLocale.pricingSuccess)
          }
        }
      })
    })
  }
  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate, billNumber) => {
    if (operate && billNumber) {
      this.setState({
        operate: operate,
        billNumber: billNumber
      })
    }
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 模态框确认操作
   */
  handleOk = () => {
    const { operate, record } = this.state;
    if (operate === commonLocale.finishLocale) {
      this.onMakeSureFinish(record);
    }
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }
  /**
   * 单一完成
   */
  onFinish = (record, batch) => {
    //如果是进行中 调用查询是否有收货的接口;
    let that = this;
    return new Promise(function (resolve, reject) {
      if (record.state === State.INPROGRESS.name) {
        that.props.dispatch({
          type: 'receive/queryInProgress',
          payload: {
            orderBillNumber: record.billNumber,
          },
          callback: (response) => {
            // 如果有 弹出框提示 是否完成，是=>完成 否=>取消
            if (response && response.success) {
              if (response.data && response.data.length > 0) {
                that.handleModalVisible(commonLocale.finishLocale, record.billNumber)
                that.setState({
                  record: record
                })
                resolve({
                  success: true
                })
              } else {
                resolve({
                  success: that.onMakeSureFinish(record, batch)
                })
              }
            }
          }
        })
      } else {
        //直接调用
        resolve({
          success: that.onMakeSureFinish(record, batch)
        })
      }
    })
  }
  /**
   * 确认完成
   */
  onMakeSureFinish = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'order/finish',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.finishSuccessLocale)
          }
        }
      })
    })
  }
  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'order/showPage',
      payload: {
        showPage: 'view',
        billNumber: record.billNumber
      }
    });
  }
  /**
   * 批量导入
   */
  handleShowExcelImportPage = () => {
    this.props.dispatch({
      type: 'order/showPage',
      payload: {
        showPage: 'import',
      }
    });
  }
  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.copyLocale,
      confirm: true,
      confirmCaption: orderLocale.title,
      disabled: !havePermission(ORDER_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }, {
      name: commonLocale.finishLocale,
      disabled: !havePermission(ORDER_RES.FINISH) || record.notAllowFinish == true,
      confirm: true,
      confirmCaption: orderLocale.title,
      onClick: this.onFinish.bind(this, record)
    }, {
      name: orderLocale.pricing,
      disabled: !havePermission(ORDER_RES.PRICING) || record.pricing == false,
      confirm: true,
      confirmCaption: orderLocale.title,
      onClick: this.onPricing.bind(this, record, false)
    }];
  }
  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.copyLocale,
      confirm: true,
      confirmCaption: orderLocale.title,
      disabled: !havePermission(ORDER_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }, {
      name: commonLocale.abortLocale,
      confirm: true,
      confirmCaption: orderLocale.title,
      disabled: !havePermission(ORDER_RES.ABORT),
      onClick: this.onAbort.bind(this, record, false)
    }, {
      name: commonLocale.finishLocale,
      disabled: !havePermission(ORDER_RES.FINISH) || record.notAllowFinish == true,
      confirm: true,
      confirmCaption: orderLocale.title,
      onClick: this.onFinish.bind(this, record, false)
    }, {
      name: orderLocale.pricing,
      disabled: !havePermission(ORDER_RES.PRICING) || record.isPricing == false,
      confirm: true,
      confirmCaption: orderLocale.title,
      onClick: this.onPricing.bind(this, record, false)
    }];
  }
  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.copyLocale,
      confirm: true,
      confirmCaption: orderLocale.title,
      disabled: !havePermission(ORDER_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }, {
      name: commonLocale.auditLocale,
      confirm: true,
      confirmCaption: orderLocale.title,
      disabled: !havePermission(ORDER_RES.AUDIT),
      onClick: this.onAudit.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(ORDER_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(ORDER_RES.DELETE),
      confirm: true,
      confirmCaption: orderLocale.title,
      onClick: this.onRemove.bind(this, record, false)
    }];
  }
  fetchOperatePropsFour = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.copyLocale,
      confirm: true,
      confirmCaption: orderLocale.title,
      disabled: !havePermission(ORDER_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }];
  }
  renderOperateCol = (record) => {
    if (State[record.state].name == 'SAVED') {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    }
    if (State[record.state].name == 'INITIAL') {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    }
    if (State[record.state].name == 'BOOKING' ||
      State[record.state].name == 'BOOKED' ||
      State[record.state].name == 'PREVEXAM' ||
      State[record.state].name == 'INPROGRESS') {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    }
    if (State[record.state].name == 'FINISHED' || State[record.state].name == 'ABORTED') {
      return <OperateCol menus={this.fetchOperatePropsFour(record)} />
    }
  }
  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.billNumberLocal,
      sorter: true,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth,
      render: (val, record) =>
        <span>
          <a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
        </span>
    },
    {
      title: orderLocale.sourceBillNumber,
      dataIndex: 'sourceBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: val => val ? <EllipsisCol colValue={val} /> : <Empty />
    },
    {
      title: orderLocale.type,
      width: colWidth.enumColWidth,
      sorter: true,
      dataIndex:'type',
      render: (val, record) => record.type ? <EllipsisCol colValue={record.type} /> : <Empty />
    },
    {
      title: commonLocale.inVendorLocale,
      width: colWidth.codeNameColWidth,
      sorter: true,
      dataIndex: 'vendor',
      render: val => <a onClick={this.onViewVendor.bind(this, val ? val.uuid : undefined)}
        disabled={!havePermission(VENDOR_RES.VIEW)}><EllipsisCol  colValue={convertCodeName(val)} /></a>
    },
    {
      title: orderLocale.wrh,
      width: colWidth.codeNameColWidth,
      dataIndex: 'wrh',
      sorter: true,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.inOwnerLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'owner',
      sorter: true,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.inlogisticModeLocale,
      width: colWidth.enumColWidth,
      sorter: true,
      dataIndex: 'logisticMode',
      render: val => LogisticMode[val].caption
    },
    {
      title: orderLocale.createTime,
      dataIndex: 'createTime',
      width: colWidth.dateColWidth,
      sorter: true,
      render: val => <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>,
    },
    {
      title: commonLocale.inValidDateLocale,
      dataIndex: 'expireDate',
      width: colWidth.dateColWidth + 30,
      sorter: true,
      render: val => <span>{val ? moment(val).format('YYYY-MM-DD') : <Empty />}</span>,
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      sorter: true,
      dataIndex: 'state',
      render: val => <BadgeUtil value={val} />
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];
  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    const menus = [{
      disabled: !havePermission(ORDER_RES.CREATE),
      name: commonLocale.importLocale,
      onClick: this.handleShowExcelImportPage
    }];
    if (loginOrg().type != orgType.vendor.name) {
      menus.push({
        name: '管理订单类型',
        onClick: this.onType
      });
      return (<Fragment>
        <Button id="createButton" icon="plus" type="primary" disabled={!havePermission(ORDER_RES.CREATE)}
                onClick={this.onCreate.bind(this, '')}>
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>);
    }
  }
  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return [
      <Button key={1} onClick={() => this.onBatchFinish()}
              disabled={!havePermission(ORDER_RES.FINISH)}>
        {commonLocale.batchFinishLocale}
      </Button>,
      <Button key={2} onClick={() => this.onBatchRemove()}
              disabled={!havePermission(ORDER_RES.DELETE)}>
        {commonLocale.batchRemoveLocale}
      </Button>,
      <Button key={3} onClick={() => this.onBatchAudit()} disabled={!havePermission(ORDER_RES.AUDIT)}>
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key={4} onClick={() => this.onBatchAbort()} disabled={!havePermission(ORDER_RES.ABORT)}>
        {commonLocale.batchAbortLocale}
      </Button>,
      <Button key={5} onClick={() => this.onBatchCopy()} disabled={!havePermission(ORDER_RES.COPY)}>
        {commonLocale.batchCopyLocale}
      </Button>,
      <Button key={6} onClick={() => this.onBatchPricing()} disabled={!havePermission(ORDER_RES.PRICING)}
      >
        {orderLocale.batchPricing}
      </Button>,
      <Button key={7} onClick={() => this.onGenPreview()}>
        预检
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={this.state.reportParams}
        moduleId={'ORDERBILL'} />
    ];
  }
  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <div>
        <OrderSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          toggleCallback={this.toggleCallback}
        />
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={this.state.operate}
          content={'当前订单中包含正在进行中的收货单，确认是否完成该订单?'}
          onOk={this.handleOk}
          onCancel={this.handleModalVisible}
        />
      </div>
    );
  }
}
