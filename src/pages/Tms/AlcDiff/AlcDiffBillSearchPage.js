import { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { convertCodeName, convertDateToTime } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import AlcDiffBillSearchForm from './AlcDiffBillSearchForm';
import { State, AlcClassify } from './AlcDiffBillContants';
import { alcDiffLocal } from './AlcDiffBillLocale';
import { ALCDIFFBILL_RES } from './AlcDiffBillPremission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ alcDiff, loading }) => ({
  alcDiff,
  loading: loading.models.alcDiff,
}))
@Form.create()
export default class AlcDiffBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: alcDiffLocal.title,
      data: props.alcDiff.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      key: 'alcDiffBill.search.table',
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    }
  }

  componentDidMount() {
    if(this.props.alcDiff.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.alcDiff.data
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
      type: 'alcDiff/query',
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
    var days = '';

    if (data) {
      let storeUuid = undefined;
      let wrhUuid = undefined;
      if (data.store)
        storeUuid = JSON.parse(data.store).uuid;
      if (data.wrh)
        wrhUuid = JSON.parse(data.wrh).uuid;
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        storeUuid: storeUuid,
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
      type: 'alcDiff/showPage',
      payload: {
        showPage: 'create',
      }
    });
  }

  onEdit = (record) => {
    let showPage = State.SAVED.name === State[record.state].name ? 'create' : 'edit';

    this.props.dispatch({
      type: 'alcDiff/showPage',
      payload: {
        showPage: showPage,
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'alcDiff/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onViewStoreHandoverBill = (billNumber) => {
    this.props.dispatch({
      type: 'storeHandover/getByBillNumber',
      payload: {
        billNumber: billNumber,
        companyUuid: loginCompany().uuid
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          this.props.dispatch(routerRedux.push({
            pathname: '/tms/storeHandoverbill',
            payload: {
              showPage: 'view',
              entityUuid: response.data.uuid
            }
          }))
        }
      }
    })
  }

  onViewAlcNtcBill = (billNumber) => {
    this.props.dispatch({
      type: 'alcNtc/getByNumber',
      payload: billNumber,
      callback: (response) => {
        if (response && response.success && response.data) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/alcNtc',
            payload: {
              showPage: 'view',
              entityUuid: response.data.uuid
            }
          }))
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
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) =>
        <span>
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                    <br />
          {
            record.sourceBillNumber ? (
              <EllipsisCol colValue={alcDiffLocal.sourceBillNumber + ':' + record.sourceBillNumber} />
            ) : null
          }
                </span>
    },
    {
      title: alcDiffLocal.handoverBillNumber,
      dataIndex: 'storeHandoverBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) => <a onClick={this.onViewStoreHandoverBill.bind(true, text)}>
        {record.storeHandoverBillNumber}</a>
    }, {
      title: alcDiffLocal.alcNtcBillNumber,
      dataIndex: 'alcNtcBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) => <a onClick={this.onViewAlcNtcBill.bind(true, text)}>
        {record.alcNtcBillNumber}</a>
    }, {
      title: commonLocale.inOwnerLocale,
      width: colWidth.codeNameColWidth,
      sorter: true,
      dataIndex: 'owner',
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.owner)} />
    },
    {
      title: commonLocale.inStoreLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'store',
      sorter: true,
      render: (text, record) => <a onClick={this.onViewStore.bind(true, record.store ? record.store.uuid : undefined)}>
        {<EllipsisCol colValue={convertCodeName(record.store)} />}</a>
    },
    {
      title: commonLocale.inWrhLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'wrh',
      sorter: true,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.wrh)} />
    },
    {
      title: commonLocale.inUploadDateLocale,
      dataIndex: 'upLoadDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: (text, record) => <span>{record.uploadDate ? convertDateToTime(record.uploadDate) : <Empty />}</span>
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      sorter: true,
      render: (text, record) => <BadgeUtil value={record.state} />
    },
    {
      title: '配差单分类',
      width: colWidth.enumColWidth,
      dataIndex: 'alcDiffDutyType',
      sorter: true,
      render: (text, record) => AlcClassify[record.alcDiffDutyType].caption
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
    if (State[record.state].name == State.AUDITED.name) {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    } if (State[record.state].name == State.INITIAL.name) {
      return <OperateCol menus={this.fetchOperatePropsTow(record)} />
    } if (State[record.state].name == State.APPROVED.name) {
      return <OperateCol menus={this.fetchOperatePropsFour(record)} />
    } else {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    }
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(ALCDIFFBILL_RES.EDIT),
      onClick: this.onEdit.bind(this, record)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(ALCDIFFBILL_RES.AUDIT),
      confirm: true,
      confirmCaption: alcDiffLocal.title,
      onClick: this.onAudit.bind(this, record, false)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(ALCDIFFBILL_RES.DELETE),
      confirm: true,
      confirmCaption: alcDiffLocal.title,
      onClick: this.onRemove.bind(this, record, false)
    }];
  }

  fetchOperatePropsTow = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(ALCDIFFBILL_RES.EDIT),
      onClick: this.onEdit.bind(this, record)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }

  fetchOperatePropsFour = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(ALCDIFFBILL_RES.EDIT),
      onClick: this.onEdit.bind(this, record)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(ALCDIFFBILL_RES.AUDIT),
      confirm: true,
      confirmCaption: alcDiffLocal.title,
      onClick: this.onAudit.bind(this, record, false)
    }];
  }

  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
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
        if (batchAction === commonLocale.deleteLocale) {
          if (e.state === State.SAVED.name)
            that.onRemove(e, true).then(res => { batch(i + 1) });
          else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        } else if (batchAction === commonLocale.auditLocale) {
          if (e.state === State.SAVED.name
            || e.state === State.APPROVED.name)
            that.onAudit(e, true).then(res => { batch(i + 1) });
          else {
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

  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const that = this
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'alcDiff/remove',
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
   * 批准
   */
  onAudit = (record, batch) => {
    const that = this

    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'alcDiff/audit',
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
      <Button key={2} onClick={() => this.onBatchRemove()}
              disabled={!havePermission(ALCDIFFBILL_RES.DELETE)}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
      <Button key={3} onClick={() => this.onBatchAudit()}
              disabled={!havePermission(ALCDIFFBILL_RES.AUDIT)}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.ALCDIFFBILL.name} />

    ];
  }


  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return (
      <AlcDiffBillSearchForm
        filterValue={this.state.pageFilter.searchKeyValues}
        refresh={this.onSearch}
      />
    );
  }

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return (<Fragment>
      <Button icon="plus" type="primary"
              disabled={!havePermission(ALCDIFFBILL_RES.CREATE)}
              onClick={this.onCreate.bind(this, '')}>{commonLocale.createLocale}</Button>
    </Fragment>);
  }
    /**
    * 绘制搜索表格
    */
    drawSearchPanel = () => {
        return (
            <AlcDiffBillSearchForm
                filterValue={this.state.pageFilter.searchKeyValues}
                refresh={this.onSearch} toggleCallback={this.toggleCallback}
            />
        );
    }

    /**
 * 绘制右上角按钮
 */
    drawActionButton = () => {
        return (<Fragment>
            <Button icon="plus" type="primary"
                disabled={!havePermission(ALCDIFFBILL_RES.CREATE)}
                onClick={this.onCreate.bind(this, '')}>{commonLocale.createLocale}</Button>
        </Fragment>);
    }
}
