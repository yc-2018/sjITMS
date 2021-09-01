import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { Button, message } from 'antd';
import { convertCodeName,compareSortFunction } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { colWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg,getActiveKey } from '@/utils/LoginContext';
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { ORDER_RES } from '@/pages/In/Order/OrderPermission';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { alcNtcLocale } from './AlcNtcLocale';
import { ALCNTC_RES } from './AlcNtcPermission';
import { State } from './AlcNtcContants';
import AlcNtcSearchForm from './AlcNtcSearchForm';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ alcNtc, loading }) => ({
  alcNtc,
  loading: loading.models.alcNtc,
}))
export default class AlcNtcSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: alcNtcLocale.title,
      data: props.alcNtc.data,
      scroll: {},
      suspendLoading: false,
      key: 'alcNtc.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.alcNtc.fromView) {
      return;
    } else {
      this.refreshTable();
    }
    let totalWidth = 0;
    this.columns.forEach(e => {
      if (e.width) {
        totalWidth = totalWidth + e.width;
      }
    });
    if (totalWidth > document.getElementsByClassName("ant-table-wrapper")[0].offsetWidth) {
      let tableScroll = {
        x: totalWidth
      }
      this.setState({
        scroll: tableScroll
      })
    }

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.alcNtc.data
    });
  }

  drawActionButton = () => {
    const menus = [];
    if (loginOrg().type != orgType.store.name) {
      menus.push({
        disabled: !havePermission(ALCNTC_RES.CREATE),
        name: commonLocale.importLocale,
        onClick: this.handleShowExcelImportPage
      });
      menus.push({
        name: '管理配单类型',
        onClick: this.onType
      });
    }
    return loginOrg().type == orgType.store.name ? null : (
      <Fragment>
        <Button type="primary" icon="plus"
                disabled={!havePermission(ALCNTC_RES.CREATE)}
                onClick={() => this.onCreate(null)}>
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    );
  }

  handleShowExcelImportPage = () => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'import',
      }
    });
  }
  onType = () => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'type'
      }
    });
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  drawSearchPanel = () => {
    return <AlcNtcSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>
  }

  drawToolbarPanel = () => {
    const { selectedRows } = this.state;

    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });
    return loginOrg().type == orgType.store.name ? [] : [
      <Button key='onAudit'
              disabled={!havePermission(ALCNTC_RES.AUDIT)}
              onClick={() => this.onBatchAudit()}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key='onRemove'
              disabled={!havePermission(ALCNTC_RES.REMOVE)}
              onClick={() => this.onBatchRemove()}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
      <Button key='onAbort'
              disabled={!havePermission(ALCNTC_RES.ABORT)}
              onClick={() => this.onBatchAbort()}
      >
        {commonLocale.batchAbortLocale}
      </Button>,
      <Button key='onCopy'
              disabled={!havePermission(ALCNTC_RES.COPY)}
              onClick={() => this.onBatchCopy()}
      >
        {commonLocale.batchCopyLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.ALCNTCBILL.name} />
    ];
  }

  fetchOperatePropsFour = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.copyLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      disabled: !havePermission(ALCNTC_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }];
  }

  fetchOperatePropsUsed = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.copyLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      disabled: !havePermission(ALCNTC_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(ALCNTC_RES.EDIT),
      onClick: this.onCreate.bind(this, record.uuid)
    },];
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.copyLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      disabled: !havePermission(ALCNTC_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }, {
      name: commonLocale.finishLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      disabled: !havePermission(ALCNTC_RES.FINISH),
      onClick: this.onFinish.bind(this, record)
    }];
  }

  fetchOperatePropsTwo = (record) => {

    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.copyLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      disabled: !havePermission(ALCNTC_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(ALCNTC_RES.EDIT),
      onClick: this.onCreate.bind(this, record.uuid)
    },{
      name: commonLocale.abortLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      disabled: !havePermission(ALCNTC_RES.ABORT),
      onClick: this.onAbort.bind(this, record, false)
    }, {
      name: commonLocale.finishLocale,
      confirm: true,
      disabled: !havePermission(ALCNTC_RES.FINISH),
      confirmCaption: alcNtcLocale.title,
      onClick: this.onFinish.bind(this, record)
    }];
  }

  fetchOperatePropsThree = (record) => {

    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.copyLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      disabled: !havePermission(ALCNTC_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }, {
      name: commonLocale.auditLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      disabled: !havePermission(ALCNTC_RES.AUDIT),
      onClick: this.onAudit.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(ALCNTC_RES.EDIT),
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      confirmCaption: alcNtcLocale.title,
      disabled: !havePermission(ALCNTC_RES.REMOVE),
      onClick: this.onRemove.bind(this, record, false)
    }];
  }

  renderOperateCol = (record) => {
    if (loginOrg().type == orgType.store.name) {
      return <OperateCol menus={[{
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      }]} />;
    }
    if (State[record.state].name == State.SAVED.name) {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    } else if (State[record.state].name === State.INITIAL.name) {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    } else if (State[record.state].name === State.INALC.name
      || State[record.state].name === State.INPROGRESS.name) {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    } else if (State[record.state].name === State.USED.name) {
      return <OperateCol menus={this.fetchOperatePropsUsed(record)} />
    } else {
      return <OperateCol menus={this.fetchOperatePropsFour(record)} />
    }
  }
  getTotalWidth = (columns) => {
    let totalWidth = 0;
    columns.forEach(e => {
      if (e.width) {
        totalWidth = totalWidth + e.width;
      }
    });

    return totalWidth;
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth + 50,
      render: (val, record) =>
        <span>
          <a onClick={this.onView.bind(this, record)}>{val}</a>
        </span>
    },
    {
      title: '来源单号',
      dataIndex: 'sourceBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth + 50
    },
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'store',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (val, record) => {
        return <span>
          <a onClick={this.onViewStore.bind(true, record.store ? record.store.uuid : undefined)}
             disabled={!havePermission(STORE_RES.VIEW)}><EllipsisCol colValue={convertCodeName(val)} /></a>
        </span>;
      }
    },
    {
      title: commonLocale.inWrhLocale,
      dataIndex: 'wrh',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: '配单类型',
      dataIndex: 'type',
      sorter: true,
      width: colWidth.codeNameColWidth
    },
    {
      title: commonLocale.inlogisticModeLocale,
      dataIndex: 'logisticMode',
      width: colWidth.enumColWidth,
      sorter: true,
      render: val => LogisticMode[val].caption
    },
    {
      title: commonLocale.inOwnerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.orderBillNumberLocal,
      dataIndex: 'orderBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth + 50,
      render: (val, record) => {
        return val ? <span>
          <a onClick={this.onOrderView.bind(this, record)}
             disabled={!havePermission(ORDER_RES.VIEW)}>{val}</a>
          <br />
          {
            record.sourceOrderBillNumber ?
              <EllipsisCol colValue={alcNtcLocale.sourceOrderBillNumber + ':' + record.sourceOrderBillNumber} /> : null
          }
        </span> : <Empty />;
      }
    },
    {
      title: commonLocale.waveLocal,
      dataIndex: 'waveBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (val, record) => {
        return val ? <span>
          <a onClick={this.onWaveView.bind(this, record)}
             disabled={!havePermission(WAVEBILL_RES.VIEW)}>{val}</a>
        </span> : <Empty />;
      }
    },
    {
      title: '门店组',
      dataIndex: 'groupStore',
      width: colWidth.codeNameColWidth,
      render: val => {
        return val ? <EllipsisCol colValue={convertCodeName(val)} /> : <Empty />;
      }
    },
    {
      title: alcNtcLocale.pickUpload,
      dataIndex: 'pickUploadDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: val => {
        return val ? moment(val).format('YYYY-MM-DD') : <Empty />;
      }
    },
    {
      title: alcNtcLocale.shipUpload,
      dataIndex: 'shipUploadDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: val => {
        return val ? moment(val).format('YYYY-MM-DD') : <Empty />;
      }
    },
    {
      title: alcNtcLocale.alcDate,
      dataIndex: 'alcDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: val => {
        return val ? moment(val).format('YYYY-MM-DD') : < Empty />;
      }
    },
    {
      title: alcNtcLocale.expireDate,
      dataIndex: 'expireDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: val => {
        return val ? moment(val).format('YYYY-MM-DD') : < Empty />;
      }
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      sorter: true,
      width: colWidth.enumColWidth,
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
    let states = "";
    let groupStores = "";
    if( filter && filter.searchKeyValues && filter.searchKeyValues.states) {
      states = filter.searchKeyValues.states
    }
    if( filter && filter.searchKeyValues && filter.searchKeyValues.groupStores) {
      groupStores = filter.searchKeyValues.groupStores
    }
    let queryFilter = { ...pageFilter };
    if (pageFilter && pageFilter.searchKeyValues && pageFilter.searchKeyValues.states && Array.isArray(pageFilter.searchKeyValues.states)) {
      states = pageFilter.searchKeyValues.states.join(",");
    } else {
      states = pageFilter.searchKeyValues.states
    }
    if (pageFilter && pageFilter.searchKeyValues && pageFilter.searchKeyValues.groupStores && Array.isArray(pageFilter.searchKeyValues.groupStores)) {
      groupStores = pageFilter.searchKeyValues.groupStores.join(",");
    } else {
      groupStores = pageFilter.searchKeyValues.groupStores
    }
    queryFilter.searchKeyValues.states = states;
    queryFilter.searchKeyValues.groupStores = groupStores;
    if (filter && filter.searchKeyValues && filter.searchKeyValues.states) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'alcNtc/query',
      payload: queryFilter,
    });

  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      let storeUuid = undefined;
      let ownerUuid = undefined;
      let wrhUuid = undefined;
      let dcUuid = undefined;
      if (data.store) {
        storeUuid = JSON.parse(data.store).uuid;
      } else if (loginOrg().type == orgType.store.name) {
        storeUuid = loginOrg().uuid;
      }
      if (data.dc) {
        dcUuid = JSON.parse(data.dc).uuid
      }
      if (data.owner) {
        ownerUuid = JSON.parse(data.owner).uuid
      }
      if (data.wrh) {
        wrhUuid = JSON.parse(data.wrh).uuid
      }
      if (data.days) {
        days = data.days
      }
      if (data.expireDate && data.expireDate[0] && data.expireDate[1]) {
        data.startExpireDate = moment(data.expireDate[0]).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).format('YYYY-MM-DD HH:mm:ss');
        data.endExpireDate = moment(data.expireDate[1]).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).format('YYYY-MM-DD HH:mm:ss');
      } else if (pageFilter.searchKeyValues.startExpireDate && pageFilter.searchKeyValues.endExpireDate) {
        delete pageFilter.searchKeyValues.startExpireDate;
        delete pageFilter.searchKeyValues.endExpireDate;
      }
      if (data.pickUploadDate && data.pickUploadDate[0] && data.pickUploadDate[1]) {
        data.startPickUploadDate = moment(data.pickUploadDate[0]).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).format('YYYY-MM-DD HH:mm:ss');
        data.endPickUploadDate = moment(data.pickUploadDate[1]).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).format('YYYY-MM-DD HH:mm:ss');
      } else if (pageFilter.searchKeyValues.startPickUploadDate && pageFilter.searchKeyValues.endPickUploadDate) {
        delete pageFilter.searchKeyValues.startPickUploadDate;
        delete pageFilter.searchKeyValues.endPickUploadDate;
      }
      if (data.shipUploadDate && data.shipUploadDate[0] && data.shipUploadDate[1]) {
        data.startShipUploadDate = moment(data.shipUploadDate[0]).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).format('YYYY-MM-DD HH:mm:ss');
        data.endShipUploadDate = moment(data.shipUploadDate[1]).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).format('YYYY-MM-DD HH:mm:ss');
      } else if (pageFilter.searchKeyValues.startShipUploadDate && pageFilter.searchKeyValues.endShipUploadDate) {
        delete pageFilter.searchKeyValues.startShipUploadDate;
        delete pageFilter.searchKeyValues.endShipUploadDate;
      }

      if (data.alcDate && data.alcDate[0] && data.alcDate[1]) {
        data.startAlcDate = moment(data.alcDate[0]).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).format('YYYY-MM-DD HH:mm:ss');
        data.endAlcDate = moment(data.alcDate[1]).set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        }).format('YYYY-MM-DD HH:mm:ss');
      } else if (pageFilter.searchKeyValues.startAlcDate && pageFilter.searchKeyValues.endAlcDate) {
        delete pageFilter.searchKeyValues.startAlcDate;
        delete pageFilter.searchKeyValues.endAlcDate;
      }

      pageFilter.searchKeyValues = {
        dcUuid: loginOrg().type == orgType.store.name ? dcUuid : undefined,
        ...pageFilter.searchKeyValues,
        ...data,
        storeUuid: storeUuid,
        ownerUuid: ownerUuid,
        wrhUuid: wrhUuid,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        days: getQueryBillDays()
      }
      pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
    }
    this.refreshTable();
  }

  /**
   * 跳转到详情页面
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
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
        dcUuid: loginOrg().uuid,
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

  /**
   * 跳转到波次单详情页面
   */
  onWaveView = (record) => {
    this.props.dispatch({
      type: 'wave/getByNumber',
      payload: record.waveBillNumber,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/wave',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  /**
   * 完成处理
   */
  onFinish = (record) => {
    this.props.dispatch({
      type: 'alcNtc/onFinish',
      payload: record,
      callback: (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.finishSuccessLocale);
        }
      }
    });
  }

  /**
   * 删除处理
   */
  onRemove = (record, callback) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'alcNtc/onRemove',
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
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'alcNtc/onAudit',
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

  /**
   * 作废处理
   */
  onAbort = (record, callback) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'alcNtc/onAbort',
        payload: record,
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.abortSuccessLocale);
          }
        }
      });
    });
  };

  /**
   * 复制处理
   */
  onCopy = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'alcNtc/copy',
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

  /**  批处理相关 开始  **/
  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchAbort = () => {
    this.setState({
      batchAction: commonLocale.abortLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchCopy = () => {
    this.setState({
      batchAction: commonLocale.copyLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state == State.SAVED.name) {
            this.onAudit(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state == State.SAVED.name) {
            this.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === commonLocale.abortLocale) {
          if (selectedRows[i].state == State.INITIAL.name) {
            this.onAbort(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === commonLocale.copyLocale) {
          that.onCopy(selectedRows[i], true).then(res=>{
            bacth(i+1);
          });
        } else {
          this.setState({
            suspendLoading: false
          })
        }
      }
    }

    bacth(0);

    /**  批处理相关 结束  **/
  }
}
