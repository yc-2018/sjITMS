import { Button, message } from 'antd';
import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { RECEIVE_RES } from './ReceivePermission';
import ReceiveSearchForm from './ReceiveSearchForm';
import { State, Method } from './ReceiveContants';
import { receiveLocale } from './ReceiveLocale';
import { colWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { ORDER_RES } from '@/pages/In/Order/OrderPermission';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';
import { getQueryBillDays } from '@/utils/LoginContext';
@connect(({ receive, loading }) => ({
  receive,
  loading: loading.models.receive,
}))
export default class ReceiveSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: receiveLocale.title,
      data: props.receive.data,
      visibleAudit: false,
      suspendLoading:false,
      key: 'receive.search.table'
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues[loginOrg().type.toLowerCase()+'Uuid'] = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.receive.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.receive.data
    });
  }

  drawActionButton = () => {
    return (
      <Fragment>
        <Button icon="plus" type="primary"
          disabled={!havePermission(RECEIVE_RES.CREATE)}
          onClick={() => this.onCreate(null)}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'receive/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  /**
   * 跳转到订单详情页面
   */
  onOrderView = (record) => {
    this.props.dispatch({
      type: 'order/getByBillNumberAndDcUuid',
      payload: {
        dcUuid: record.dcUuid,
        sourceBillNumber: record.orderBillNumber
      },
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/in/order',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  drawSearchPanel = () => {
    return <ReceiveSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>
  }

  drawToolbarPanel = () => {
    const { selectedRows } = this.state;

    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
        batchPrintParams.push({
            billNumber: e.billNumber
        })
    });
    return [
      <Button key='onAudit' disabled={!havePermission(RECEIVE_RES.AUDIT)}
        onClick={() => this.onBatchAudit()}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key={2} onClick={() => this.onBatchRemove()} disabled={!havePermission(RECEIVE_RES.REMOVE)}>
        {commonLocale.batchRemoveLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.RECEIVEBILL.name} />
    ];
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(RECEIVE_RES.AUDIT),
      confirm: true,
      confirmCaption: receiveLocale.title,
      onClick: this.onAudit.bind(this, record, false)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(RECEIVE_RES.AUDIT),
      confirm: true,
      confirmCaption: receiveLocale.title,
      onClick: this.onAudit.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(RECEIVE_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(RECEIVE_RES.REMOVE),
      confirm: true,
      confirmCaption: receiveLocale.title,
      onClick: this.onRemove.bind(this, record)
    }];
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>
    },
    {
      title: commonLocale.inVendorLocale,
      dataIndex: 'vendor',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <a onClick={this.onViewVendor.bind(this, val?val.uuid:undefined) }
              disabled={!havePermission(VENDOR_RES.VIEW)}><EllipsisCol colValue={convertCodeName(val)} /></a>
    },
    {
      title: commonLocale.inWrhLocale,
      dataIndex: 'wrh',
      sorter: true,
      width: colWidth.codeColWidth,
      render: val =><EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.inlogisticModeLocale,
      dataIndex: 'logisticMode',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => {
        if (val === LogisticMode.UNIFY.name) {
          return <span>&nbsp;&nbsp;&nbsp;&nbsp;{LogisticMode[val].caption}&nbsp;&nbsp;&nbsp;&nbsp;</span>
        }
        return LogisticMode[val].caption;
      }
    },
    {
      title: commonLocale.inOrderBillNumberLocale,
      dataIndex: 'orderBillNumber',
      width: colWidth.billNumberColWidth,
      sorter: true,
      render: (val, record) => {
        return val ? <span>
          <a onClick={this.onOrderView.bind(this, record) }
            disabled={!havePermission(ORDER_RES.VIEW)}>{val}</a>
        </span> : <Empty />;
      }
    },
    {
      title: '订单来源单号',
      dataIndex: 'sourceOrderBillNumber',
      width: colWidth.billNumberColWidth,
      sorter: true,
      render: val => val ? <EllipsisCol colValue={val} /> : <Empty />
    },
    {
      title: commonLocale.inOwnerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: receiveLocale.method,
      dataIndex: 'method',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => Method[val].caption
    },
    {
      title: receiveLocale.receiver,
      dataIndex: 'receiver',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.inUploadDateLocale,
      dataIndex: 'uploadDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: (val) => {
        return val ? moment(val).format('YYYY-MM-DD') : <Empty />;
      }
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

        State[record.state].name === State.AUDITED.name ?
          <OperateCol menus={this.fetchOperatePropsOne(record)} />
          :
          (State[record.state].name === State.INPROGRESS.name ?
            <OperateCol menus={this.fetchOperatePropsTwo(record)} />
            :
            <OperateCol menus={this.fetchOperatePropsThree(record)} />
          )

      ),
    },
  ];

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
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
      type: 'receive/query',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      let ownerUuid = undefined;
      let vendorUuid = undefined;
      let wrhUuid = undefined;
      let receiverUuid = undefined;
      if (data.owner && data.owner != '') {
        ownerUuid = JSON.parse(data.owner).uuid;
      }
      if (data.vendor) {
        vendorUuid = JSON.parse(data.vendor).uuid
      }
      if (data.wrh) {
        wrhUuid = JSON.parse(data.wrh).uuid
      }
      if (data.days) {
        days = data.days
      }
      if (data.uploadDate && data.uploadDate[0] && data.uploadDate[1]) {
        data.beginUploadDate = moment(new Date(data.uploadDate[0]).setHours(0, 0, 0, 0)).format('YYYY-MM-DD HH:mm:ss');
        data.endUploadDate = moment(new Date(data.uploadDate[1]).setHours(0, 0, 0, 0)).format('YYYY-MM-DD HH:mm:ss');
      } else if (pageFilter.searchKeyValues.beginUploadDate && pageFilter.searchKeyValues.endUploadDate) {
        delete pageFilter.searchKeyValues.beginUploadDate;
        delete pageFilter.searchKeyValues.endUploadDate;
      }
      if (data.billNumber) {
        pageFilter.likeKeyValues = {
          ...pageFilter.likeKeyValues,
          billNumber: data.billNumber
        }
      } else {
        delete pageFilter.likeKeyValues.billNumber;
      }
      if (data.receiver) {
        receiverUuid = JSON.parse(data.receiver).uuid;
      }
      if (data.orderBillNumber) {
        pageFilter.likeKeyValues = {
          ...pageFilter.likeKeyValues,
          orderBillNumber: data.orderBillNumber
        }
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        ownerUuid: ownerUuid,
        vendorUuid: vendorUuid,
        wrhUuid: wrhUuid,
        receiverUuid: receiverUuid,
        days: days
      }
      pageFilter.searchKeyValues[loginOrg().type.toLowerCase()+'Uuid'] = loginOrg().uuid;
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        days: getQueryBillDays()
      };
      pageFilter.searchKeyValues[loginOrg().type.toLowerCase()+'Uuid'] = loginOrg().uuid;
      pageFilter.likeKeyValues = {};
    }
    this.refreshTable();
  }

	/**
   * 跳转到详情页面
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'receive/showPage',
      payload: {
        showPage: 'view',
        billNumber: record.billNumber
      }
    });
  }

  /**
  * 删除处理
  */
  onRemove = (record, callback) => {
    const { dispatch } = this.props;
    let that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'receive/onRemove',
        payload: record,
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.removeSuccessLocale);
          }
        }
      });
    })
  };

	/**
	 * 审核处理
	 */
  onAudit = (record, callback) => {
    const { dispatch } = this.props;
    let that =this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'receive/onAudit',
        payload: record,
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.auditSuccessLocale);
          }
        }
      });
    })
  };

  /**  批处理相关 开始  **/
  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 批量删除
   */
  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;

    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state !== State.SAVED.name && selectedRows[i].state !== State.INPROGRESS.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          } else {
            that.onAudit(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          }
        } else if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state === State.SAVED.name) {
            that.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
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
    };
    bacth(0);
  }

  /**  批处理相关 结束  **/
}
