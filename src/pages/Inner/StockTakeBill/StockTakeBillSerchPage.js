import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Dropdown, Menu } from 'antd';
import { formatMessage } from 'umi/locale';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { stockTakeBillLocal } from './StockTakeBillLocal';
import { STATE, SCHEMA, METHOD, State } from './StockTakeBillConstants';
import StockTakeBillSearchForm from './StockTakeBillSearchForm';
import ModifyTakeMethodModal from './ModifyTakeMethodModal';
import ModifyTakeSchemaModal from './ModifyTakeSchemaModal';
import ModifyTakerModal from './ModifyTakerModal';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { StockTakeBill_RES } from './StockTakeBillPermission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ stockTakeBill, loading }) => ({
  stockTakeBill,
  loading: loading.models.stockTakeBill,
}))
export default class StockTakeBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: stockTakeBillLocal.title,
      data: props.stockTakeBill.data,
      takerModalVisible: false,
      methodModalVisible: false,
      takeSchemaModalVisible: false,
      method: '',
      schema: '',
      taker: {},
      suspendLoading: false,
      key: 'stocktake.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    };

  }

  componentDidMount() {
    if (this.props.stockTakeBill.fromView) {
      return
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.stockTakeBill.data
    });
  }

  onViewStockTakePlan = (planBillNumber) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/inner/stockTakePlanBill',
      payload: {
        showPage: 'view',
        billNumber: planBillNumber
      }
    }));
  }

  onViewSouceBill = (record) => {
    this.props.dispatch({
      type: 'stockTakeBill/getByBillNumber',
      payload: {
        dcUuid: record.dcUuid,
        billNumber: record.sourceBillNumber
      },
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/inner/stockTakeBill',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }


  onView = (record) => {
    this.props.dispatch({
      type: 'stockTakeBill/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onEdit = (record) => {
    this.props.dispatch({
      type: 'stockTakeBill/showPage',
      payload: {
        showPage: 'create',
        entityUuid: record.uuid
      }
    });
  }

  onSnap = (record) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'stockTakeBill/snap',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success("操作成功");
        }
      }
    })
  }

  onRepeatTake = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'stockTakeBill/repeatTake',
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
            message.success('复盘成功')
          }
        }
      });
    })
  }

  onFinish = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'stockTakeBill/finish',
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
      });
    })
  }

  onAbort = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'stockTakeBill/abort',
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
            message.success(commonLocale.abortLocale)
          }
        }
      });
    });
  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      let ownerUuid = undefined;
      let takerUuid = undefined;
      if (data.owner)
        ownerUuid = JSON.parse(data.owner).uuid;
      if (data.taker)
        takerUuid = JSON.parse(data.taker).uuid;
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        ownerUuid: ownerUuid,
        takerUuid: takerUuid,
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
      type: 'stockTakeBill/query',
      payload: queryFilter,
    });
  };


  handleModifyMethod = (value, batch) => {
    const { method } = this.state;

    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'stockTakeBill/modifyStockTakeMethod',
        payload: {
          uuid: value.uuid,
          version: value.version,
          method: method
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, value);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.modifySuccessLocale)
          }
        }
      });
    });
  }

  handleModifySchema = (value, batch) => {
    const { schema } = this.state;

    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'stockTakeBill/modifyStockTakeSchema',
        payload: {
          uuid: value.uuid,
          version: value.version,
          schema: schema
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, value);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.modifySuccessLocale)
          }
        }
      });
    });
  }

  handleModifyTaker = (value, batch) => {
    const { taker } = this.state;

    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'stockTakeBill/modifyStockTaker',
        payload: {
          uuid: value.uuid,
          version: value.version,
          taker: taker
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, value);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.modifySuccessLocale)
          }
        }
      });
    });
  }

  onBatchFinish = () => {
    this.setState({
      batchAction: "完成"
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchAbort = () => {
    this.setState({
      batchAction: "作废"
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  onBatchRepeatTake = () => {
    this.setState({
      batchAction: "复盘"
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchModifyTaker = (value) => {
    this.setState({
      batchAction: "修改盘点员",
      takerModalVisible: false,
      taker: value.taker
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchModifyMethod = (value) => {
    this.setState({
      batchAction: "修改盘点方式",
      methodModalVisible: false,
      method: value.method
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchModifySchema = (value) => {
    this.setState({
      batchAction: "修改盘点模式",
      takeSchemaModalVisible: false,
      schema: value.schema
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
        if (batchAction === "修改盘点员") {
          if (State[e.state].name == State.INITIAL.name) {
            that.handleModifyTaker(e, true).then(res => { batch(i + 1) });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        } else if (batchAction === "修改盘点模式") {
          if (State[e.state].name == State.INITIAL.name) {
            that.handleModifySchema(e, true).then(res => { batch(i + 1) });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        } else if (batchAction === "修改盘点方式") {
          if (State[e.state].name == State.INITIAL.name) {
            that.handleModifyMethod(e, true).then(res => { batch(i + 1) });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        } else if (batchAction === "完成") {
          if (State[e.state].name === State.TAKED.name) {
            that.onFinish(e, true).then(res => { batch(i + 1) });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        } else if (batchAction === "作废") {
          if (State[e.state].name !== State.FINISHED.name
            && State[e.state].name !== State.ABORTED.name) {
            that.onAbort(e, true).then(res => { batch(i + 1) });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            batch(i + 1);
          }
        } else if (batchAction === "复盘") {
          if (State[e.state].name === State.TAKED.name) {
            that.onRepeatTake(e, true).then(res => { batch(i + 1) });
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

  onClickMune = ({ key }) => {
    const { selectedRows } = this.state;
    if (selectedRows.length < 1)
      return message.warn('请先勾选,再进行批量操作');

    if (key === '1') {
      this.setState({
        takerModalVisible: true,
      })
    }
    else if (key === '2') {
      this.setState({
        takeSchemaModalVisible: true,
      })
    }
    else if (key === '3') {
      this.setState({
        methodModalVisible: true,
      })
    }
  }

  handleMethodModalVisible = () => {
    this.setState({
      methodModalVisible: !this.state.methodModalVisible,
    })
  }

  handleTakerModalVisible = () => {
    this.setState({
      takerModalVisible: !this.state.takerModalVisible,
    })
  }

  handleSchemaModalVisible = () => {
    this.setState({
      takeSchemaModalVisible: !this.state.takeSchemaModalVisible,
    })
  }

  drawToolbarPanel() {
    const { selectedRows,
      takerModalVisible, methodModalVisible, takeSchemaModalVisible
    } = this.state;

    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });

    const menuNew = () => (
      <Menu onClick={this.onClickMune} >
        <Menu.Item disabled={!havePermission(StockTakeBill_RES.MODIFYTAKER)}
          key="1">{stockTakeBillLocal.modifyTaker}</Menu.Item>
        <Menu.Item disabled={!havePermission(StockTakeBill_RES.MODIFYSCHEMA)}
          key="2">{stockTakeBillLocal.modifySchema}</Menu.Item>
        <Menu.Item disabled={!havePermission(StockTakeBill_RES.MODIFYMETHOD)}
          key="3">{stockTakeBillLocal.modifyMethod}</Menu.Item>
      </Menu>
    );

    return [
      <Fragment key='toolFragment'>
        <Button key="finish"
          disabled={!havePermission(StockTakeBill_RES.FINISH)}
          onClick={() => this.onBatchFinish()}>
          {commonLocale.batchFinishLocale}
        </Button>
        <Button key="abort"
          disabled={!havePermission(StockTakeBill_RES.ABORT)}
          onClick={() => this.onBatchAbort()}>
          {commonLocale.batchAbortLocale}
        </Button>
        <Button key="repeaettake"
          disabled={!havePermission(StockTakeBill_RES.REPEATTAKE)}
          onClick={() => this.onBatchRepeatTake()}>
          {stockTakeBillLocal.repeatTake}
        </Button>

        <Dropdown overlay={menuNew}
          placement="bottomCenter">
          <Button icon="down"
            type="primary">{stockTakeBillLocal.takeModify}</Button>
        </Dropdown>
        <PrintButton
          key='printButton'
          reportParams={batchPrintParams}
          moduleId={PrintTemplateType.STOCKTAKEBILL.name} />

        <ModifyTakeMethodModal
          ModalTitle={stockTakeBillLocal.modifyMethod}
          methodModalVisible={methodModalVisible}
          handleMethodModalVisible={this.handleMethodModalVisible}
          handleSave={this.onBatchModifyMethod}

        />
        <ModifyTakeSchemaModal
          ModalTitle={stockTakeBillLocal.modifySchema}
          takeSchemaModalVisible={takeSchemaModalVisible}
          handleSchemaModalVisible={this.handleSchemaModalVisible}
          handleSave={this.onBatchModifySchema}/>
        <ModifyTakerModal
          ModalTitle={stockTakeBillLocal.modifyTaker}
          takerModalVisible={takerModalVisible}
          handleTakerModalVisible={this.handleTakerModalVisible}
          handleSave={this.onBatchModifyTaker}
        />
      </Fragment>
    ];
  }

  drawSearchPanel = () => {
    return <StockTakeBillSearchForm
      filterValue={this.state.pageFilter.searchKeyValues}
      refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
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
      title: stockTakeBillLocal.stockTakePlan,
      dataIndex: 'takePlanBill',
      width: colWidth.billNumberColWidth,
      render: (text) => <a onClick={this.onViewStockTakePlan.bind(true, text)}
        disabled={!text}>{text}</a>
    },
    {
      title: stockTakeBillLocal.serialNum,
      dataIndex: 'serialNum',
      width: itemColWidth.qtyStrColWidth,
    },
    {
      title: stockTakeBillLocal.owner,
      dataIndex: 'owner',
      width: colWidth.codeNameColWidth,
      render: (text, record) => (record.owner && record.owner.uuid ?
        <EllipsisCol colValue={convertCodeName(record.owner)} /> : <Empty />)
    }, {
      title: stockTakeBillLocal.schema,
      dataIndex: 'takeSchema',
      width: colWidth.enumColWidth,
      render: (text, record) => (SCHEMA[record.takeSchema].caption)
    }, {
      title: stockTakeBillLocal.method,
      dataIndex: 'method',
      width: colWidth.enumColWidth,
      render: (text) => (METHOD[text].caption)
    },
    {
      title: stockTakeBillLocal.taker,
      dataIndex: 'taker',
      width: colWidth.codeNameColWidth,
      render: (text, record) => (record.taker && record.taker.uuid ?
        <EllipsisCol colValue={convertCodeName(record.taker)} /> : <Empty />)
    }, {
      title: commonLocale.inSourceBillLocale,
      dataIndex: 'sourceBillNumber',
      width: colWidth.sourceBillNumberColWidth,
      render: (text, record) => <a onClick={this.onViewSouceBill.bind(true, record)}>{text}</a>
    }, {
      title: stockTakeBillLocal.repeatCount,
      dataIndex: 'repeatTimes',
      width: itemColWidth.qpcStrColWidth,
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
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
      )
    },
  ];

  renderOperateCol = (record) => {
    if (METHOD.MANUAL.name == METHOD[record.method].name) {
      if (State[record.state].name == State.INITIAL.name) {
        return <OperateCol menus={this.fetchOperatePropsOne(record)} />
      }
      if (State[record.state].name == State.TAKED.name) {
        return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
      }
    }
    if (METHOD.RF.name == METHOD[record.method].name) {
      if (State[record.state].name == State.INITIAL.name) {
        return <OperateCol menus={this.fetchOperatePropsSix(record)} />
      }
      if (State[record.state].name == State.TAKED.name) {
        return <OperateCol menus={this.fetchOperatePropsThree(record)} />
      }
    }
    if (State[record.state].name == 'FINISHED' || State[record.state].name == 'ABORTED') {
      return <OperateCol menus={this.fetchOperatePropsFour(record)} />
    } if (State[record.state].name == State.INPROGRESS.name) {
      return <OperateCol menus={this.fetchOperatePropsFive(record)} />
    }
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(StockTakeBill_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: stockTakeBillLocal.snap,
      disabled: !havePermission(StockTakeBill_RES.SNAP),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onSnap.bind(this, record)
    }, {
      name: commonLocale.abortLocale,
      disabled: !havePermission(StockTakeBill_RES.ABORT),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onAbort.bind(this, record, undefined)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(StockTakeBill_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(StockTakeBill_RES.CHECK),
      onClick: this.onEdit.bind(this, record)
    }, {
      name: stockTakeBillLocal.repeatTake,
      disabled: !havePermission(StockTakeBill_RES.REPEATTAKE),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onRepeatTake.bind(this, record, undefined)
    },
    {
      name: commonLocale.abortLocale,
      disabled: !havePermission(StockTakeBill_RES.ABORT),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onAbort.bind(this, record, undefined)
    }, {
      name: commonLocale.finishLocale,
      disabled: !havePermission(StockTakeBill_RES.FINISH),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onFinish.bind(this, record, undefined)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(StockTakeBill_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: stockTakeBillLocal.repeatTake,
      disabled: !havePermission(StockTakeBill_RES.REPEATTAKE),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onRepeatTake.bind(this, record, undefined)
    }, {
      name: commonLocale.abortLocale,
      disabled: !havePermission(StockTakeBill_RES.ABORT),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onAbort.bind(this, record, undefined)
    }, {
      name: commonLocale.finishLocale,
      disabled: !havePermission(StockTakeBill_RES.FINISH),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onFinish.bind(this, record, undefined)
    }];
  }

  fetchOperatePropsFour = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(StockTakeBill_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }];
  }

  fetchOperatePropsFive = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(StockTakeBill_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.abortLocale,
      disabled: !havePermission(StockTakeBill_RES.ABORT),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onAbort.bind(this, record, undefined)
    }];
  }

  fetchOperatePropsSix = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(StockTakeBill_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.abortLocale,
      disabled: !havePermission(StockTakeBill_RES.ABORT),
      confirm: true,
      confirmCaption: stockTakeBillLocal.title,
      onClick: this.onAbort.bind(this, record, undefined)
    }];
  }
}
