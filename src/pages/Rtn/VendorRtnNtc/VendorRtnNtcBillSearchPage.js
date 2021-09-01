import { Fragment } from 'react';
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
import { State } from './VendorRtnNtcBillContants';
import { vendorRtnNtcLocale } from './VendorRtnNtcBillLocale';
import VendorRtnNtcBillSearchForm from './VendorRtnNtcBillSearchForm';
import { VENDORRTNNTC_RES } from './VendorRtnNtcBillPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ vendorRtnNtc, loading }) => ({
  vendorRtnNtc,
  loading: loading.models.vendorRtnNtc,
}))
@Form.create()
export default class VendorRtnNtcBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: vendorRtnNtcLocale.title,
      data: props.vendorRtnNtc.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      suspendLoading: false,
      key: 'vendorRtnNtc.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    }
  }

  componentDidMount() {
    if(this.props.vendorRtnNtc.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.vendorRtnNtc.data
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
      type: 'vendorRtnNtc/query',
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
      let ownerUuid = undefined;
      var days = '';
      if (data.vendor) {
        vendorUuid = JSON.parse(data.vendor).uuid
      }
      if (data.owner)
        ownerUuid = JSON.parse(data.owner).uuid
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        vendorUuid: vendorUuid,
        ownerUuid: ownerUuid,
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
      type: 'vendorRtnNtc/showPage',
      payload: {
        showPage: 'create',
      }
    });
  }

  onEdit = (record) => {
    this.props.dispatch({
      type: 'vendorRtnNtc/showPage',
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
      type: 'vendorRtnNtc/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 批量完成
   */
  onBatchFinish = () => {
    this.setState({
      batchAction: commonLocale.finishLocale
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

  onBatchAbort = () => {
    this.setState({
      batchAction: commonLocale.abortLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchCopy = () => {
    this.setState({
      batchAction: vendorRtnNtcLocale.copy
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
    if (batchAction === vendorRtnNtcLocale.generate) {
      let billNumbers = [];
      selectedRows && selectedRows.forEach(function (e) {
        if (e.state === State.INITIAL.name)
          billNumbers.push(e.billNumbers)
      })

      that.onBatchGenerate(billNumbers);

    }

    let batch = (i) => {
      if (i < selectedRows.length) {
        let e = selectedRows[i];
        if (batchAction === commonLocale.finishLocale) {
          if (e.state !== State.INITIAL.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          } else {
            that.onFinish(e, true).then(res => { batch(i + 1) });
          }
        } else if (batchAction === commonLocale.deleteLocale) {
          if (e.state !== State.SAVED.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          } else {
            that.onRemove(e, true).then(res => { batch(i + 1) });
          }
        } else if (batchAction === commonLocale.abortLocale) {
          if (e.state !== State.INITIAL.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          } else {
            that.onAbort(e, true).then(res => { batch(i + 1) });
          }
        } else if (batchAction === vendorRtnNtcLocale.copy) {
          that.onCopy(e, true).then(res => { batch(i + 1) });
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
   * 单一生成拣货单
   */
  onBatchGenerate = () => {
    const { selectedRows } = this.state;

    let billNumbers = [];
    selectedRows && selectedRows.forEach(function (e) {
      if (e.state === State.INITIAL.name)
        billNumbers.push(e.billNumber)
    })
    if (billNumbers.length === 0) {
      message.success('当前无可生成拣货单的通知单')
      return;
    }

    this.props.dispatch({
      type: 'vendorRtnNtc/generatePickUpBill',
      payload: {
        billNumbers: billNumbers,
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(vendorRtnNtcLocale.generateSuccess + ':共生成' + response.data + '张供应商拣货单。')
        }
      }
    })

    this.setState({
      selectedRows: [],
    })
  }

  /**
   * 单一生成拣货单
   */
  onGenerate = (billNumber) => {
    this.props.dispatch({
      type: 'vendorRtnNtc/generatePickUpBill',
      payload: {
        billNumbers: [billNumber],
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(vendorRtnNtcLocale.generateSuccess + ':共生成' + response.data + '张供应商拣货单。')
        }
      }
    })
  }

  onCopy = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorRtnNtc/copy',
        payload: {
          uuid: record.uuid,
          isView: false
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(vendorRtnNtcLocale.copySuccess)
          }
        }
      })
    });
  }

  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const that = this
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorRtnNtc/remove',
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
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorRtnNtc/audit',
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

  onFinish = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorRtnNtc/finish',
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

  onAbort = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'vendorRtnNtc/abort',
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
            message.success(commonLocale.abortSuccessLocale)
          }
        }
      })
    })
  }


  onConfirm = (record) => {
    this.props.dispatch({
      type: 'vendorRtnNtc/confirm',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(vendorRtnNtcLocale.confirmSuccess)
        }
      }
    })
  }

  onRollback = (record, batch) => {
    this.props.dispatch({
      type: 'vendorRtnNtc/rollback',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(vendorRtnNtcLocale.rollbackSuccess)
        }
      }
    })
  }

  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth + 50,
      sorter: true,
      render: (text, record) =>
        <span>
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                    <br />
                </span>
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
      title: commonLocale.inWrhLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'wrh',
      sorter: true,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.wrh)} />,
    }, {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.owner)} />
    },
    {
      title: vendorRtnNtcLocale.sourceBillNumber,
      width: colWidth.billNumberColWidth,
      key: vendorRtnNtcLocale.sourceBillNumber,
      sorter: true,
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
    if (State[record.state].name == State.INITIAL.name) {
      return <OperateCol menus={this.fetchOperatePropsFour(record)} />
    }
    if (State[record.state].name == State.FINISHED.name
      || State[record.state].name == State.INPROGRESS.name
      || State[record.state].name == State.HANDOVERED.name
      || State[record.state].name == State.ABORTED.name
      || State[record.state].name == State.USED.name) {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    }
    if (State[record.state].name == State.INALC.name) {
      return <OperateCol menus={this.fetchOperatePropsTow(record)} />
    }
  }

  fetchOperatePropsFour = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORRTNNTC_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: vendorRtnNtcLocale.copy,
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      disabled: !havePermission(VENDORRTNNTC_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }, {
      name: vendorRtnNtcLocale.generate,
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      disabled: !havePermission(VENDORRTNNTC_RES.GENERATE),
      onClick: this.onGenerate.bind(this, record.billNumber)
    }, {
      name: commonLocale.abortLocale,
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      disabled: !havePermission(VENDORRTNNTC_RES.ABORTED),
      onClick: this.onAbort.bind(this, record, false)
    }, {
      name: commonLocale.finishLocale,
      disabled: !havePermission(VENDORRTNNTC_RES.FINISH),
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      onClick: this.onFinish.bind(this, record, false)
    }];
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORRTNNTC_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: vendorRtnNtcLocale.copy,
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      disabled: !havePermission(VENDORRTNNTC_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      disabled: !havePermission(VENDORRTNNTC_RES.EDIT),
      onClick: this.onEdit.bind(this, record)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(VENDORRTNNTC_RES.DELETE),
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      onClick: this.onRemove.bind(this, record, false)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(VENDORRTNNTC_RES.AUDIT),
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      onClick: this.onAudit.bind(this, record, false)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORRTNNTC_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: vendorRtnNtcLocale.copy,
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      disabled: !havePermission(VENDORRTNNTC_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }];
  }

  fetchOperatePropsTow = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDORRTNNTC_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: vendorRtnNtcLocale.confirm,
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      disabled: !havePermission(VENDORRTNNTC_RES.CONFIRM),
      onClick: this.onConfirm.bind(this, record)
    }, {
      name: vendorRtnNtcLocale.rollback,
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      disabled: !havePermission(VENDORRTNNTC_RES.ROLLBACK),
      onClick: this.onRollback.bind(this, record)
    }, {
      name: vendorRtnNtcLocale.copy,
      confirm: true,
      confirmCaption: vendorRtnNtcLocale.title,
      disabled: !havePermission(VENDORRTNNTC_RES.COPY),
      onClick: this.onCopy.bind(this, record, false)
    }];
  }

  /**
   * 批量导入
   */
  handleShowExcelImportPage = () => {
    this.props.dispatch({
      type: 'vendorRtnNtc/showPage',
      payload: {
        showPage: 'import',
      }
    });
  }

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    const menus = [];
      if(loginOrg().type != orgType.store.name){
        menus.push({
          disabled: !havePermission(VENDORRTNNTC_RES.CREATE),
          name: commonLocale.importLocale,
          onClick: this.handleShowExcelImportPage
          });
    }
    return (<Fragment>
      <Button icon="plus" type="primary"
              disabled={!havePermission(VENDORRTNNTC_RES.CREATE)}
              onClick={this.onCreate.bind(this, '')}>{commonLocale.createLocale}</Button>
      <SearchMoreAction menus={menus}/>
    </Fragment>)
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
      <Button key={1} onClick={() => this.onBatchFinish()}
              disabled={!havePermission(VENDORRTNNTC_RES.FINISH)}
      >
        {commonLocale.batchFinishLocale}
      </Button>,
      <Button key={2} onClick={() => this.onBatchRemove()}
              disabled={!havePermission(VENDORRTNNTC_RES.DELETE)}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
      <Button key={3} onClick={() => this.onBatchAbort()}
              disabled={!havePermission(VENDORRTNNTC_RES.ABORTED)}
      >
        {commonLocale.batchAbortLocale}
      </Button>,
      <Button key={4} onClick={() => this.onBatchCopy()}
              disabled={!havePermission(VENDORRTNNTC_RES.COPY)}
      >
        {commonLocale.batchCopyLocale}
      </Button>,
      <Button key={4} onClick={() => this.onBatchGenerate()}
              disabled={!havePermission(VENDORRTNNTC_RES.GENERATE)}
      >
        {vendorRtnNtcLocale.generate}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.VENDORRTNNTCBILL.name}
        />
    ];
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return (
      <VendorRtnNtcBillSearchForm
        filterValue={this.state.pageFilter.searchKeyValues}
        refresh={this.onSearch}
      />
    );
  }
}
