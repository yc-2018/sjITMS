import { Button, message } from 'antd';
import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import Empty from '@/pages/Component/Form/Empty';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import DecinvBillSearchForm from './DecinvBillSearchForm';
import { decinvBillState } from './DecinvBillState';
import { decLocale } from './DecInvBillLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { havePermission } from '@/utils/authority';
import { DEC_RES } from './DecinvBillPermission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ dec, loading }) => ({
  dec,
  loading: loading.models.dec,
}))
export default class ReceiveSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: decLocale.title,
      data: props.dec.data,
      key: 'decinv.search.table',
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.dec.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dec.data
    });
  }

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
      type: 'dec/query',
      payload: queryFilter,
      callback: response => {
        if (response && response.success && response.data) {
          this.setState({
            data: {
              list: response.data.records ? response.data.records : null,
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

  drawActionButton = () => {
    const menus = [{
      name: decLocale.manageType,
      onClick: this.onMangeDecinvType
    }];
    return (
      <Fragment>
        {/* <Button
          onClick={() => this.onMangeDecinvType(null)}
          disabled={!havePermission(DEC_RES.CREATE)}
        >
          {decLocale.manageType}
        </Button> */}
        <Button icon="plus" type="primary"
          onClick={() => this.onCreate(null)} disabled={!havePermission(DEC_RES.CREATE)}>
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    );
  }

  onMangeDecinvType = () => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'decinvType'
      }
    });
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  drawSearchPanel = () => {
    return <DecinvBillSearchForm
      filterValue={this.state.pageFilter.searchKeyValues}
      refresh={this.onSearch}
      toggleCallback={this.toggleCallback}
    />
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
      <Button key='1'
        disabled={!havePermission(DEC_RES.REMOVE)}
        onClick={() => this.onBatchRemove()}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
      <Button key='2'
        disabled={!havePermission(DEC_RES.AUDIT)}
        onClick={() => this.onBatchAudit()}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.DECINVBILL.name} />
    ];
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record.uuid)
    }];
  }

  fetchOperatePropsOneForAudit = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record.uuid)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(DEC_RES.CREATE) || JSON.stringify(record.sourceBill) === '{}' || record.sourceBill && record.sourceBill.billType && record.sourceBill.billType !== 'AlcDiffBill',
      onClick: this.onEditAudit.bind(this, record.uuid)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record.uuid)
    }, {
      name: commonLocale.auditLocale,
      confirm: true,
      confirmCaption: decLocale.title,
      disabled: !havePermission(DEC_RES.AUDIT),
      onClick: this.onAudit.bind(this, record)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record.uuid)
    }, {
      name: commonLocale.auditLocale,
      confirm: true,
      confirmCaption: decLocale.title,
      disabled: !havePermission(DEC_RES.AUDIT),
      onClick: this.onAuditDirect.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(DEC_RES.CREATE),
      onClick: this.onEdit.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      confirmCaption: decLocale.title,
      disabled: !havePermission(DEC_RES.REMOVE),
      onClick: this.onDelete.bind(this, record, false)
    }];
  }

  renderOperateCol = (record) => {
    if (record.state === decinvBillState.SAVED.name) {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    }
    if (record.state === decinvBillState.APPROVED.name) {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    }
    if (record.state === decinvBillState.AUDITED.name) {
      if(record.sourceBill && record.sourceBill.billType && record.sourceBill.billType === 'AlcDiffBill') {
        return <OperateCol menus={this.fetchOperatePropsOneForAudit(record)} />
      } else {
        return <OperateCol menus={this.fetchOperatePropsOne(record)} />
      }

    }
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (val, record) => <span>
        <a onClick={this.onView.bind(this, record.uuid)}>
          {val}
        </a>
      </span>
    },
    {
      title: decLocale.type,
      dataIndex: 'type',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => <EllipsisCol colValue={val} />
    },
    {
      title: commonLocale.inWrhLocale,
      dataIndex: 'wrh',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: decLocale.decer,
      dataIndex: 'decer',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: '来源单号',
      dataIndex: 'sourceBillNumber',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => val?<EllipsisCol colValue={val} />:<Empty />
    },
    {
      title: commonLocale.inUploadDateLocale,
      dataIndex: 'uploadDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: (val) => {
        return val ? moment(val).format('YYYY-MM-DD') : <Empty />
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

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      let ownerUuid = undefined;
      let vendorUuid = undefined;
      let wrhUuid = undefined;
      let decerUuid = undefined;
      if (data.owner) {
        ownerUuid = JSON.parse(data.owner).uuid;
      }
      if (data.vendor) {
        vendorUuid = JSON.parse(data.vendor).uuid;
      }
      if (data.wrh) {
        wrhUuid = JSON.parse(data.wrh).uuid;
      }
      if (data.decer) {
        decerUuid = JSON.parse(data.decer).uuid;
      }
      if (data.days) {
        days = data.days
      }
      if (data.uploadDate && data.uploadDate[0] && data.uploadDate[1]) {
        data.uploadDateStart = moment(data.uploadDate[0]).format('YYYY-MM-DD');
        data.uploadDateEnd = moment(data.uploadDate[1]).format('YYYY-MM-DD');
      } else if (pageFilter.searchKeyValues.uploadDateStart && pageFilter.searchKeyValues.uploadDateEnd) {
        delete pageFilter.searchKeyValues.uploadDateStart;
        delete pageFilter.searchKeyValues.uploadDateEnd;
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        ownerUuid: ownerUuid,
        vendorUuid: vendorUuid,
        wrhUuid: wrhUuid,
        decerUuid: decerUuid,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        days: getQueryBillDays()
      };
      pageFilter.likeKeyValues = {};
    }

    this.refreshTable();
  }

  /**
   * 跳转到详情页面
   */
  onView = (uuid) => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  /**
   * 跳转到编辑页面
   */
  onEdit = (uuid) => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  /**
   * 跳转到编辑页面
   */
  onEditAudit = (uuid) => {
    this.props.dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'createAudit',
        entityUuid: uuid
      }
    });
  }

  /**
   * 审核
   */
  onAudit = (entity) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'dec/showPage',
      payload: {
        showPage: 'audit',
        entityUuid: entity.uuid,
      }
    });
  }

  /**
   * 直接审核
   */
  onAuditDirect = (entity, batch) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'dec/onAudit',
        payload: {
          uuid: entity.uuid,
          version: entity.version,
          decInvRealQtys: [],
        },
        callback: (response) => {
          if (batch) {
            resolve({
              success: true
            })
            that.batchCallback(response, entity);
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.auditSuccessLocale);
          }
        }
      });
    })
  }

  /**
   * 删除
   */
  onDelete = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'dec/onRemove',
        payload: {
          uuid: record.uuid,
          version: record.version,
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            message.success(commonLocale.removeSuccessLocale);
            that.refreshTable();
          }
        }
      });
    })
  }

  // -------- 批处理 START----------

  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
    });
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
        if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state === decinvBillState.SAVED.name) {
            that.onDelete(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        }

        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state === decinvBillState.SAVED.name || selectedRows[i].state === decinvBillState.APPROVED.name) {
            that.onAuditDirect(selectedRows[i], true).then(res => {
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
    }
    bacth(0);
  }

  // -------- 批处理 END----------
}
