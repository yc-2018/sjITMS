import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { State, METHOD } from './VendorHandoverBillContants';
import { vendorHandoverLocale } from './VendorHandoverBillLocale';
import VendorHandoverBillSearchForm from './VendorHandoverBillSearchForm';
import { VENDORHANDOVER_RES } from './VendorHandoverBillPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ vendorHandover, loading }) => ({
  vendorHandover,
  loading: loading.models.vendorHandover,
}))
@Form.create()
export default class VendorHandoverBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: vendorHandoverLocale.title,
      data: props.vendorHandover.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      suspendLoading: false,
      key: 'vendorHandover.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    }
  }

  componentDidMount() {
    if(this.props.vendorHandover.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.vendorHandover.data
    });
  }

  /**
   * 刷新/重置
   */
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
      type: 'vendorHandover/query',
      payload: queryFilter,
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

    if (data) {
      let vendorUuid = undefined;
      let handoverUuid = undefined;
      let ownerUuid = undefined;
      let wrhUuid = undefined;
      var days = '';
      if (data.vendor) {
        vendorUuid = JSON.parse(data.vendor).uuid
      }
      if (data.handover) {
        handoverUuid = JSON.parse(data.handover).uuid
      }
      if (data.owner)
        ownerUuid = JSON.parse(data.owner).uuid
      if (data.wrh)
        wrhUuid = JSON.parse(data.wrh).uuid
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        vendorUuid: vendorUuid,
        handoverUuid: handoverUuid,
        ownerUuid: ownerUuid,
        wrhUuid: wrhUuid,
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

  /**
   * 显示新建界面
   */
  onCreate = () => {
    this.props.dispatch({
      type: 'vendorHandover/showPage',
      payload: {
        showPage: 'create',
      }
    });
  }

  onEdit = (record) => {
    this.props.dispatch({
      type: 'vendorHandover/showPage',
      payload: {
        showPage: 'create',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'vendorHandover/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 批量审核
   */
  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
    })
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

  // 批量操作
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    this.setState({
      suspendLoading: true
    })
    const that = this;
    let batch = (i) => {
      if (i < selectedRows.length) {
        let e = selectedRows[i];
        if (batchAction === commonLocale.auditLocale) {
          if (e.state === State.AUDITED.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          } else {
            that.onAudit(e, true).then(res => { batch(i + 1) });
          }
        } else if (batchAction === commonLocale.deleteLocale) {
          if (e.state !== State.SAVED.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          } else {
            that.onRemove(e, true).then(res => { batch(i + 1) });
          }
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }
    batch(0);
  }

  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const that = this
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorHandover/remove',
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

  onAudit = (record, batch) => {
    const that = this;

    let type = 'vendorHandover/audit';
    if (record.state === State.INPROGRESS.name) {
      type = 'vendorHandover/auditInprogress';
    }

    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: type,
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
   * 表格列
   */
  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) =>
        <a onClick={() => this.onView(record)}>
          {text}
        </a>
    },
    {
      title: commonLocale.inVendorLocale,
      dataIndex: 'vendor',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <a onClick={this.onViewVendor.bind(true, record.vendor ? record.vendor.uuid : undefined)}>
        {<EllipsisCol colValue={convertCodeName(record.vendor)} />}</a>
    }, {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.owner)} />
    }, {
      title: commonLocale.inWrhLocale,
      dataIndex: 'wrh',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.wrh)} />
    },
    {
      title: vendorHandoverLocale.method,
      dataIndex: 'method',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (text, record) => (METHOD[record.method].caption)
    },
    {
      title: vendorHandoverLocale.handover,
      width: colWidth.codeNameColWidth,
      dataIndex: 'handover',
      sorter: true,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.handover)} />,
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      sorter: true,
      render: (text, record) => <BadgeUtil value={record.state} />
    },
    {
      title: commonLocale.inUploadDateLocale,
      width: colWidth.dateColWidth,
      dataIndex: 'uploadTime',
      sorter: true,
      render: (text, record) => record.uploadTime ? moment(record.uploadTime).format('YYYY-MM-DD') : <Empty />
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: (text, record) => (
        this.renderOperateCol(record)
      ),
    },
  ];

  renderOperateCol = (record) => {
    if (State[record.state].name == State.SAVED.name) {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    }
    if (State[record.state].name == State.INPROGRESS.name) {
      return <OperateCol menus={this.fetchOperatePropsTow(record)} />
    }
    if (State[record.state].name == State.AUDITED.name) {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    }
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORHANDOVER_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(VENDORHANDOVER_RES.EDIT),
      onClick: this.onEdit.bind(this, record)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(VENDORHANDOVER_RES.DELETE),
      confirm: true,
      confirmCaption: vendorHandoverLocale.title,
      onClick: this.onRemove.bind(this, record, false)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(VENDORHANDOVER_RES.AUDIT),
      confirm: true,
      confirmCaption: vendorHandoverLocale.title,
      onClick: this.onAudit.bind(this, record, false)
    }];
  }

  fetchOperatePropsTow = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORHANDOVER_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(VENDORHANDOVER_RES.AUDIT),
      confirm: true,
      confirmCaption: vendorHandoverLocale.title,
      onClick: this.onAudit.bind(this, record, false)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORHANDOVER_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }];
  }

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return <Button
      type='primary' icon="plus"
      disabled={!havePermission(VENDORHANDOVER_RES.CREATE)}
      onClick={() => this.onCreate()}
    >
      {commonLocale.createLocale}
    </Button>
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    const { selectedRows } = this.state;

    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });
    return [
      <Button key={1} onClick={() => this.onBatchAudit()}
              disabled={!havePermission(VENDORHANDOVER_RES.AUDIT)}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key={2} onClick={() => this.onBatchRemove()}
              disabled={!havePermission(VENDORHANDOVER_RES.DELETE)}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.VENDORRTNHANDOVERBILL.name} />
    ];
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return (
      <VendorHandoverBillSearchForm
        filterValue={this.state.pageFilter.searchKeyValues}
        refresh={this.onSearch}
      />
    );
  }
}
