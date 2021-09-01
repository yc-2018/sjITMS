import { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, message} from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { lockType, state } from './StockLockContants';
import { stockLockBillLocale } from './StockLockBillLocale';
import { STOCKLOCKBILL_RES } from './StockLockBillPermission';
import StockLockBillSearchForm from './StockLockBillSearchForm';
import OperateCol from '@/pages/Component/Form/OperateCol';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ stocklock, loading }) => ({
  stocklock,
  loading: loading.models.stocklock,
}))
@Form.create()
export default class StockLockBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: stockLockBillLocale.title,
      data: props.stocklock.data,
      suspendLoading: false,
      selectedRows: [],
      record: {},
      entityUuid: '',
      key: 'stockLock.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.stocklock.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.stocklock.data
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
      type: 'stocklock/query',
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
      let ownerUuid = undefined;
      let lockerUuid = undefined;
      if (data.owner) {
        ownerUuid = JSON.parse(data.owner).uuid
      }
      if (data.locker) {
        lockerUuid = JSON.parse(data.locker).uuid
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        ownerUuid: ownerUuid,
        lockerUuid: lockerUuid,
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
  * 显示新建/编辑界面
  */
  onCreate = (uuid) => {
    const payload = {
      showPage: 'create'
    }
    if (uuid != '') {
      payload.entityUuid = uuid;
    }
    this.props.dispatch({
      type: 'stocklock/showPage',
      payload: {
        ...payload
      }
    });
  }
  /**
   * 显示原因管理界面
   */
  onShowReasonView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'stocklock/onShowReasonView',
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

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state == state.SAVED.name) {
            this.onAudit(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        } else if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state == state.SAVED.name) {
            this.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
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
  /**
   * 单一审核
   */
  onAudit = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'stocklock/audit',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: response => {
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
   * 单一删除
   */
  onRemove = (record, batch) => {
    const that = this
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'stocklock/onRemove',
        payload: {
          uuid: record.uuid,
          version: record.version
        },
        callback: (response) => {
          if (batch) {
            resolve({ success: response.success });
            that.batchCallback(response, record);
            return;
          }
          if (response && response.success) {
            message.success(commonLocale.removeSuccessLocale)
          }
          that.refreshTable();
        }
      })
    });
  }

  /**
   * 单一完成
   */
  onFinish = (record, batch) => {
    const that = this;
    this.props.dispatch({
      type: 'stocklock/finish',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: (response) => {
        if (batch) {
          that.batchCallback(response, record);
          return;
        }
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.finishSuccessLocale)
        }
      }
    })
  }
  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'stocklock/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
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
      disabled: !havePermission(STOCKLOCKBILL_RES.AUDIT),
      confirm: true,
      confirmCaption: stockLockBillLocale.title,
      onClick: this.onAudit.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(STOCKLOCKBILL_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(STOCKLOCKBILL_RES.DELETE),
      confirm: true,
      confirmCaption: stockLockBillLocale.title,
      onClick: this.onRemove.bind(this, record, false)
    }];
  }

  renderOperateCol = (record) => {
    if (state[record.state].name == 'SAVED') {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    } else {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    }
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
      render: (val, record) =>
        <a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
    },
    {
      title: stockLockBillLocale.type,
      dataIndex: 'type',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => lockType[val].caption
    },
    {
      title: commonLocale.inOwnerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: stockLockBillLocale.locker,
      dataIndex: 'locker',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
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

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    const menus = [{
      name:stockLockBillLocale.reasonButton,
      onClick:this.onShowReasonView
    }];
    return (
      <Fragment>
        {/* <Button onClick={this.onShowReasonView} disabled={!havePermission(STOCKLOCKBILL_RES.CREATE)}>
          {stockLockBillLocale.reasonButton}
        </Button> */}
        <Button type="primary" icon='plus' onClick={this.onCreate.bind(this, '')} disabled={!havePermission(STOCKLOCKBILL_RES.CREATE)}>
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    )
  }

  /**
  * 绘制批量工具栏
  */
  drawToolbarPanel() {
    return [
      <Button key={1} onClick={() => this.onBatchAudit()}
        disabled={!havePermission(STOCKLOCKBILL_RES.AUDIT)}>
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key={2} onClick={() => this.onBatchRemove()}
        disabled={!havePermission(STOCKLOCKBILL_RES.DELETE)}>
        {commonLocale.batchRemoveLocale}
      </Button>,
    ];
  }

  /**
  * 绘制搜索表格
  */
  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <div>
        <StockLockBillSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          toggleCallback={this.toggleCallback}
        />
      </div>

    );
  }
}
