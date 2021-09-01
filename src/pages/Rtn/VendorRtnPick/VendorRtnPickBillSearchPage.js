import { connect } from 'dva';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import VendorRtnPickBillSearchForm from './VendorRtnPickBillSearchForm';
import { State, Type, METHOD } from './VendorRtnPickBillContants';
import { vendorRtnPickLocale } from './VendorRtnPickBillLocale';
import ModifyMethodModal from './ModifyMethodModal';
import ModifyPickerModal from './ModifyPickerModal';
import BatchAuditModal from './BatchAuditModal';
import { VENDORRTNPICK_RES } from './VendorRtnPickBillPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ vendorRtnPick, loading }) => ({
  vendorRtnPick,
  loading: loading.models.vendorRtnPick,
}))
@Form.create()
export default class VendorRtnPickBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);

        this.state = {
            ...this.state,
            title: vendorRtnPickLocale.title,
            data: props.vendorRtnPick.data,
            selectedRows: [],
            record: {},
            entityUuid: '',
            methodModalVisible: false,
            pickerModalVisible: false,
            auditModalVisible: false,
            suspendLoading: false,
            key: 'vendorRtnPick.search.table'
        }

        this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
        this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
        this.state.pageFilter.sortFields = {
            billNumber: true
        }
    }


  componentDidMount() {
    if(this.props.vendorRtnPick.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.vendorRtnPick.data
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
      type: 'vendorRtnPick/query',
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
      let pickerUuid = undefined;
      let ownerUuid = undefined;
      let wrhUuid = undefined;
      var days = '';
      if (data.vendor) {
        vendorUuid = JSON.parse(data.vendor).uuid
      }
      if (data.picker) {
        pickerUuid = JSON.parse(data.picker).uuid
      }
      if (data.owner) {
        ownerUuid = JSON.parse(data.owner).uuid;
      }
      if (data.wrh) {
        wrhUuid = JSON.parse(data.wrh).uuid;
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        vendorUuid: vendorUuid,
        pickerUuid: pickerUuid,
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
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'vendorRtnPick/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  // 批量操作
  onBatchProcess = () => {
    const { method, picker, selectedRows, batchAction } = this.state;

    this.setState({
      suspendLoading: true
    })
    const that = this;
    let batch = (i) => {
      if (i < selectedRows.length) {
        let e = selectedRows[i];
        if (batchAction === commonLocale.auditLocale) {
          if (e.state === State.APPROVED.name
            && Type.WHOLECONTAINER.name == Type[e.type].name
            && METHOD.MANUAL.name === METHOD[e.method].name) {
            that.onAudit(e, true).then(res => { batch(i + 1) });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        } else if (batchAction === vendorRtnPickLocale.batchAlterMethod) {
          if (e.state === State.APPROVED.name && e.method !== method) {
            that.onAlterMethod(e, true).then(res => { batch(i + 1) });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        } else if (batchAction === vendorRtnPickLocale.batchAlterPicker) {
          if (e.state === State.APPROVED.name
            && (!e.picker || e.picker.uuid !== picker.uuid)) {
            that.onAlterPicker(e, true).then(res => { batch(i + 1) });
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
    }
    batch(0);
  }

  onAlterPicker = (record, batch) => {
    const { picker } = this.state;

    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorRtnPick/alterPicker',
        payload: {
          uuid: record.uuid,
          version: record.version,
          picker: picker
        },
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.modifySuccessLocale)
          }
        }
      })
    })
  }

  onAlterMethod = (record, batch) => {
    const { method } = this.state;

    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorRtnPick/alterMethod',
        payload: {
          uuid: record.uuid,
          version: record.version,
          method: method
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.modifySuccessLocale)
          }
        }
      })
    })
  }

  onAudit = (record, batch) => {
    const { picker, toBinCode, pickQty } = this.state;
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorRtnPick/auditWhole',
        payload: {
          body: {
            dcUuid: loginOrg().uuid,
            companyUuid: loginCompany().uuid,
            picker: picker,
            pickQty: pickQty,
            toBinCode: toBinCode,
          },
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

  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth,
      sorter: true,
      render: (text, record) =>
        <span>
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                </span>

    }, {
      title: commonLocale.inOwnerLocale,
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
      title: commonLocale.inVendorLocale,
      dataIndex: 'vendor',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <a onClick={this.onViewVendor.bind(true, record.vendor ? record.vendor.uuid : undefined)}>
        {<EllipsisCol colValue={convertCodeName(record.vendor)} />}</a>
    },
    {
      title: vendorRtnPickLocale.type,
      dataIndex: 'type',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (text, record) => Type[record.type].caption
    },
    {
      title: vendorRtnPickLocale.method,
      dataIndex: 'method',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (text, record) => METHOD[record.method].caption
    }, {
      title: vendorRtnPickLocale.picker,
      dataIndex: 'picker',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.picker)} />
    },
    {
      title: vendorRtnPickLocale.sourceBillNumber,
      width: colWidth.billNumberColWidth,
      key: vendorRtnPickLocale.sourceBillNumber,
      sorter:true,
      dataIndex: 'sourceBillNumber',
      render: val => val ? <EllipsisCol colValue={val} /> : <Empty />
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      sorter: true,
      render: (text, record) => <BadgeUtil value={record.state} />
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: (text, record) => (this.renderOperateCol(record))
    },
  ];

  renderOperateCol = (record) => {
    if (State[record.state].name == State.APPROVED.name
      && METHOD.MANUAL.name == METHOD[record.method].name
    ) {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    }
    else {
      return <OperateCol menus={this.fetchOperatePropsTow(record)} />
    }
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORRTNPICK_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(VENDORRTNPICK_RES.AUDIT),
      onClick: this.handleAuditModal.bind(this, record),
    }];
  }

  fetchOperatePropsTow = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORRTNPICK_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }];
  }

  handleAuditModal = (record) => {
    this.props.dispatch({
      type: 'vendorRtnPick/showPage',
      payload: {
        showPage: 'audit',
        entityUuid: record.uuid
      }
    });
  }

  onBatchAudit = (value) => {
    this.setState({
      batchAction: commonLocale.auditLocale,
      auditModalVisible: false,
      picker: JSON.parse(value.picker),
      toBinCode: value.toBinCode,
      pickQty: value.pickQty
    })

    const that = this;
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchModifyPicker = (value) => {
    this.setState({
      batchAction: vendorRtnPickLocale.batchAlterPicker,
      pickerModalVisible: false,
      picker: JSON.parse(value.picker)
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchModifyMethod = (value) => {
    this.setState({
      batchAction: vendorRtnPickLocale.batchAlterMethod,
      methodModalVisible: false,
      method: value.method
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }


  handleMethodModalVisible = () => {
    if (this.state.selectedRows.length <= 0) {
      message.info('请先选择拣货单');
      return false;
    }
    this.setState({
      methodModalVisible: !this.state.methodModalVisible,
    })
  }

  handlePickerModalVisible = () => {
    if (this.state.selectedRows.length <= 0) {
      message.info('请先选择拣货单');
      return false;
    }
    this.setState({
      pickerModalVisible: !this.state.pickerModalVisible,
    })
  }

  handleAuditModalVisible = () => {
    if (this.state.selectedRows.length <= 0) {
      message.info('请先选择拣货单');
      return false;
    }

    this.setState({
      auditModalVisible: !this.state.auditModalVisible,
    })
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    const { selectedRows,
      pickerModalVisible, methodModalVisible, auditModalVisible
    } = this.state;

    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });
    return [
      <Button key={1} onClick={() => this.handleAuditModalVisible()}
              disabled={!havePermission(VENDORRTNPICK_RES.AUDIT)}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key={2} onClick={() => this.handleMethodModalVisible()}
              disabled={!havePermission(VENDORRTNPICK_RES.MODIFYMETHOD)}
      >
        {vendorRtnPickLocale.batchAlterMethod}
      </Button>,
      <Button key={3} onClick={() => this.handlePickerModalVisible()}
              disabled={!havePermission(VENDORRTNPICK_RES.MODIFYPICKER)}
      >
        {vendorRtnPickLocale.batchAlterPicker}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.VENDORPICKUPBILL.name} />,

      <ModifyMethodModal
        key='methodModal'
        ModalTitle={vendorRtnPickLocale.batchAlterMethod}
        methodModalVisible={methodModalVisible}
        handleMethodModalVisible={this.handleMethodModalVisible}
        handleSave={this.onBatchModifyMethod}

      />,
      <ModifyPickerModal
        key='pickerModal'
        ModalTitle={vendorRtnPickLocale.batchAlterPicker}
        pickerModalVisible={pickerModalVisible}
        handlePickerModalVisible={this.handlePickerModalVisible}
        handleSave={this.onBatchModifyPicker}
      />,
      <BatchAuditModal
        key='auditModal'
        ModalTitle={vendorRtnPickLocale.batchWholeAudit}
        batchAuditVisible={auditModalVisible}
        handleAuditModalVisible={this.handleAuditModalVisible}
        handleSave={this.onBatchAudit}
      />
    ];
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return (
      <VendorRtnPickBillSearchForm
        filterValue={this.state.pageFilter.searchKeyValues}
        refresh={this.onSearch}
      />
    );
  }
}
