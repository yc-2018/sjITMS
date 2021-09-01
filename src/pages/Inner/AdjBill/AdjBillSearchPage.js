import { Button, message } from 'antd';
import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Empty from '@/pages/Component/Form/Empty';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { State, Type } from './AdjBillContants';
import { adjBillLocale } from './AdjBillLocale';
import { ADJ_RES } from './AdjBillPermission';
import { AdjSourceBill } from './AdjBillContants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import AdjBillSearchForm from './AdjBillSearchForm';
import { routerRedux } from 'dva/router';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ adjBill, loading }) => ({
  adjBill,
  loading: loading.models.adjBill,
}))
export default class AdjBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: adjBillLocale.title,
      data: props.adjBill.data,
      key: 'adjBill.search.table'
    }
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    };
  }

  componentDidMount() {
    if(this.props.adjBill.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.adjBill.data
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
   * 批量删除
   */
  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'adjBill/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  onBatchApprove = () => {
    this.setState({
      batchAction: commonLocale.approveLocale
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
        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state != State.AUDITED.name) {
            that.onAudit(selectedRows[i], true).then(res => {
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

  onRemove = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'adjBill/onRemove',
        payload: record,
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

  onAudit = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'adjBill/onAudit',
        payload: {
          uuid: record.uuid,
          version: record.version,
          itemQtys: []
        },
        callback: (response) => {
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

  onView = (record) => {
    this.props.dispatch({
      type: 'adjBill/showPage',
      payload: {
        showPage: 'view',
        billNumber: record.billNumber
      }
    });
  }


  onSearch = (data) => {
    const { pageFilter } = this.state;
    var days = '';
    if (data) {
      if (data.adjerUuid) {
        data.adjerUuid = JSON.parse(data.adjerUuid).uuid
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        days: days
      },
        pageFilter.likeKeyValues = {
          ...pageFilter.likeKeyValues,
          ...data
        }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        stateEquals: '',
        moverUuidEquals: '',
        fromWrhUuidEquals: '',
        days: getQueryBillDays()
      },
        pageFilter.likeKeyValues = {
          billNumberLike: '',
          articleCodeContain: '',
          fromContainerContain: '',
          toContainerContain: '',
          fromBinContain: '',
          toBinContain: ''
        },
        pageFilter.sortFields = {
          billNumber: false
        }
    }
    this.refreshTable();
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
      type: 'adjBill/query',
      payload: queryFilter,
    });
  };

  /**
    * 显示原因管理界面
    */
  onShowReasonView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'adjBill/onShowReasonView',
    });
  }

  onViewSourceBill = sourceBill => {
    if (sourceBill.billType == AdjSourceBill.ReceiveBill.name) {
      this.props.dispatch(routerRedux.push({
        pathname: '/in/receive',
        payload: {
          showPage: 'view',
          billNumber: sourceBill.billNumber
        }
      }));
    } else if (sourceBill.billType == AdjSourceBill.StoreRtnBill.name) {
      this.props.dispatch(routerRedux.push({
        pathname: '/rtn/storeRtn',
        payload: {
          showPage: 'view',
          entityUuid: sourceBill.billUuid
      }
      }));
    } else if (sourceBill.billType == AdjSourceBill.VendorRtnHandoverBill.name) {
      this.props.dispatch(routerRedux.push({
        pathname: '/rtn/vendorHandover',
        payload: {
          showPage: 'view',
          entityUuid: sourceBill.billUuid
        }
      }));
    }
  }

  drawToolbarPanel() {
    const { selectedRows } = this.state;
    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });

    return [
      <Button key="onBatchAudit" onClick={() => this.onBatchAudit()}
          disabled={!havePermission(ADJ_RES.AUDIT)}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key="onBatchRemove" onClick={() => this.onBatchRemove()}
          disabled={!havePermission(ADJ_RES.REMOVE)}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.ADJBILL.name} />
    ];
  }

  drawSearchPanel = () => {
    return <AdjBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
      filterLikeValue={this.state.pageFilter.likeKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback} />;
  }


  handleCancel() {
    this.props.form.resetFields();
    this.refreshTable();
  }


  fetchOperateProps = (record) => {
    let operateProps = [];
    operateProps.push(
      {
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      }
    );

    if (record.state === State.SAVED.name) {
      operateProps.push(
        {
          name: commonLocale.editLocale,
          disabled: !havePermission(ADJ_RES.CREATE),
          onClick: this.onCreate.bind(this, record.uuid)
        }
      );
    }

    if (record.state != State.AUDITED.name) {
      operateProps.push(
        {
          name: commonLocale.auditLocale,
           disabled: !havePermission(ADJ_RES.AUDIT),
          confirm: true,
          confirmCaption: adjBillLocale.title,
          onClick: this.onAudit.bind(this, record, false)
        }
      );
    }

    if (record.state === State.SAVED.name) {
      operateProps.push(
        {
          name: commonLocale.deleteLocale,
          disabled: !havePermission(ADJ_RES.REMOVE),
          confirm: true,
          confirmCaption: adjBillLocale.title,
          onClick: this.onRemove.bind(this, record, false)
        }
      );
    }
    return operateProps;
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      key: 'billNumber',
      render: (text, record) => {
        return (
          <a onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      }
    },
    {
      title: adjBillLocale.type,
      dataIndex: 'type',
      sorter: true,
      width: colWidth.enumColWidth,
      key: 'type',
      render: (text) => text ? Type[text].caption : <Empty />
    },
    {
      title: adjBillLocale.adjer,
      dataIndex: 'adjer',
      sorter: true,
      width: colWidth.codeNameColWidth,
      key: 'adjer',
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.adjer)} />
    },
    {
      title: adjBillLocale.sourceBill,
      dataIndex: 'sourceBill',
      sorter: true,
      width: colWidth.billNumberColWidth,
      key: 'sourceBill',
      render: (val, record) => {
        let colValue = [record.sourceBill.billNumber] + AdjSourceBill[record.sourceBill.billType];
        return (
          <a onClick={() => this.onViewSourceBill(val)}>
            <EllipsisCol colValue={colValue} />
          </a>
        );
      }
    },
    {
      title: commonLocale.inUploadDateLocale,
      dataIndex: 'createInfo.time',
      sorter: true,
      width: colWidth.dateColWidth,
      key: 'uploadDate',
      render: (val) => {
        return val ? moment(val).format('YYYY-MM-DD') : <Empty />;
      }
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex:'state',
      key: 'state',
      sorter: true,
      render: (text, record) => {
        return (<BadgeUtil value={record.state} />)
      }
    },
    {
      key: 'operate',
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      sorter: true,
      render: record => {
        return <OperateCol menus={this.fetchOperateProps(record)} />
      }
    },
  ];
  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    const menus = [{
      name: adjBillLocale.manageReason,
      onClick: this.onShowReasonView
    }];
    return (
      <Fragment>
        <Button icon="plus" type="primary"
          onClick={this.onCreate.bind(this, '')}
          disabled={!havePermission(ADJ_RES.CREATE)}
        >
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    )
  }

}
