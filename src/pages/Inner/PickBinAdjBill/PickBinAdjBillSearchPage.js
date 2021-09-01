import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message } from 'antd';
import { formatMessage } from 'umi/locale';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { BILL_STATE, BILL_METHOD } from '@/utils/constants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { State, METHOD } from './PickBinAdjBillContants';
import PickBinAdjBillSearchForm from './PickBinAdjBillSearchForm';
import { PickBinAdjBill_RES } from './PickBinAdjBilPermission';
import { pickBinAdjBillLocale } from './PickBinAdjBillLocale';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ pickBinAdjBill, loading }) => ({
  pickBinAdjBill,
  loading: loading.models.pickBinAdjBill,
}))
export default class PickBinAdjBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: pickBinAdjBillLocale.title,
      data: props.pickBinAdjBill.data,
      suspendLoading: false,
      key: 'pickBinAdj.search.table',
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    };

  }

  componentDidMount() {
    if (this.props.pickBinAdjBill.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.pickBinAdjBill.data
    });
  }

    onCreate = () => {
        this.props.dispatch({
            type: 'pickBinAdjBill/showPage',
            payload: {
                showPage: 'create'
            }
        });
    }

  onView = (record) => {
    this.props.dispatch({
      type: 'pickBinAdjBill/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onEdit = (record) => {
    this.props.dispatch({
      type: 'pickBinAdjBill/showPage',
      payload: {
        showPage: 'create',
        entityUuid: record.uuid
      }
    });
  }

  onAudit = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'pickBinAdjBill/audit',
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
            message.success(commonLocale.auditSuccessLocale)
          }
        }
      })
    })
  }

  ///////
  remove = (record, callback) => {
    this.props.dispatch({
      type: 'pickBinAdjBill/remove',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: callback ? callback : (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.removeSuccessLocale);
        }
      }
    });
  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        days: getQueryBillDays()
      }
    }
    this.refreshTable();
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
      pageFilter.searchKeyValues.days = getQueryBillDays()
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'pickBinAdjBill/query',
      payload: queryFilter,
    });
  };

  onBatchAudit = () => {
    this.setState({
      batchAction: "审核"
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;
    this.setState({
      suspendLoading: true
    })
    const that = this;
    let batch = (i) => {
      if (i < selectedRows.length) {
        let e = selectedRows[i];
        if (batchAction === "审核") {
          if (State.SAVED.name === e.state) {
            that.onAudit(e, true).then(res => { batch(i + 1) });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    };
    batch(0);
  }

  drawActionButton = () => {
    return (
      <Fragment>
        <Button icon="plus"
          disabled={!havePermission(PickBinAdjBill_RES.CREATE)}
          type="primary" onClick={this.onCreate}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
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
      <Button key="remove"
        disabled={!havePermission(PickBinAdjBill_RES.AUDIT)}
        onClick={() => this.onBatchAudit()}>
        {commonLocale.batchAuditLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.PICKBINADJBILL.name} />
    ];
  }

  drawSearchPanel = () => {
    return <PickBinAdjBillSearchForm
      filterValue={this.state.pageFilter.searchKeyValues}
      refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
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
      name: commonLocale.editLocale,
      disabled: !havePermission(PickBinAdjBill_RES.EDIT),
      onClick: this.onEdit.bind(this, record)
    }, {
      name: commonLocale.auditLocale,
      confirm: true,
      disabled: !havePermission(PickBinAdjBill_RES.AUDIT),
      confirmCaption: pickBinAdjBillLocale.title,
      onClick: this.onAudit.bind(this, record, undefined)
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      disabled: !havePermission(PickBinAdjBill_RES.DELETE),
      confirmCaption: pickBinAdjBillLocale.title,
      onClick: this.remove.bind(this, record, undefined)
    }];
  }

  renderOperateCol = (record) => {
    if (record.state === "AUDIT") {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    } else {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    }
  }

    columns = [
        {
            title: commonLocale.billNumberLocal,
            dataIndex: 'billNumber',
            sorter: true,
            width: colWidth.billNumberColWidth,
            render: (text, record) => {
                return (
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                );
            }
        },
        {
            title: pickBinAdjBillLocale.method,
            dataIndex: 'method',
            sorter: true,
            width: colWidth.enumColWidth,
            render: (text, record) => record.method ? METHOD[record.method].caption : <Empty />
        },
        {
            title: pickBinAdjBillLocale.operator,
            dataIndex: 'pickBinAdjer',
            sorter: true,
            width: colWidth.codeNameColWidth,
            render: (text, record) => (record.pickBinAdjer && record.pickBinAdjer.uuid ?
                <EllipsisCol colValue={convertCodeName(record.pickBinAdjer)} /> : <Empty />)
        }, {
            title: commonLocale.stateLocale,

            width: colWidth.enumColWidth,
            dataIndex: 'state',
            sorter: true,
            render: (text, record) => {
                return (
                    <BadgeUtil value={record.state} />
                )
            }
        },
        {
            title: commonLocale.operateLocale,
            width: colWidth.operateColWidth,
            render: record => (
                this.renderOperateCol(record)
            ),
        },
    ];
}
