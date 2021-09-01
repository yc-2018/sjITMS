import { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import PutawaySearchForm from './PutawaySearchForm';
import { PutawayBillState, OperateMethod, PutawayBillType } from './PutawayContants';
import { putawayLocale } from './PutawayLocale';
import { PUTAWAY_RES } from './PutawayPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ putaway, loading }) => ({
  putaway,
  loading: loading.models.putaway,
}))
@Form.create()
export default class PutawaySearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: putawayLocale.title,
      data: props.putaway.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      suspendLoading: false,
      key: 'putaway.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.putaway.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.putaway.data
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
      type: 'putaway/query',
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
      let putawayerUuid = undefined;
      if (data.owner && data.owner != '') {
        ownerUuid = JSON.parse(data.owner).uuid
      }

      if (data.putawayer && data.putawayer != '') {
        putawayerUuid = JSON.parse(data.putawayer).uuid
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        ownerUuid: ownerUuid,
        putawayerUuid: putawayerUuid,
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
  onCreate = (record) => {
    const payload = {
      showPage: 'create'
    }
    if (record.uuid != '') {
      payload.entityUuid = record.uuid;
    }
    if (record) {
      payload.ownerUuid = record.owner.uuid;
    }

    this.props.dispatch({
      type: 'putaway/showPage',
      payload: {
        ...payload
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
    const that = this;
    this.setState({
      suspendLoading: true
    })
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state === PutawayBillState.SAVED.name) {
            that.onAudit(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state === PutawayBillState.SAVED.name) {
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
  /**
   * 单一审核
   */
  onAudit = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'putaway/audit',
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
   * 单一删除
   */
  onRemove = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'putaway/delete',
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
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'putaway/showPage',
      payload: {
        showPage: 'view',
        billNumber: record.billNumber
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
      disabled: !havePermission(PUTAWAY_RES.AUDIT),
      confirm: true,
      confirmCaption: putawayLocale.title,
      onClick: this.onAudit.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(PUTAWAY_RES.CREATE),
      onClick: this.onCreate.bind(this, record)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(PUTAWAY_RES.DELETE),
      confirm: true,
      confirmCaption: putawayLocale.title,
      onClick: this.onRemove.bind(this, record, false)
    }];
  }

  renderOperateCol = (record) => {
    if (PutawayBillState[record.state].name == 'SAVED') {
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
      sorter: true,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth,
      render: (val, record) =>
        <span>
          <a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
        </span>
    },
    {
      title: commonLocale.inOwnerLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'owner',
      sorter: true,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: putawayLocale.putawayBillType,
      width: colWidth.enumColWidth,
      sorter: true,
      dataIndex:'putawayBillType',
      render: val => PutawayBillType[val].caption
    },
    {
      title: commonLocale.operateMethodLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'type',
      sorter: true,
      render: val => OperateMethod[val].caption
    },
    {
      title: putawayLocale.putawayer,
      width: colWidth.codeNameColWidth,
      dataIndex: 'putawayer',
      sorter: true,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex:'state',
      sorter: true,
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
    return (
      <Fragment>
        <Button icon="plus" type="primary" onClick={this.onCreate.bind(this, '')} disabled={!havePermission(PUTAWAY_RES.CREATE)}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    )
  }

  /**
  * 绘制批量工具栏
  */
  drawToolbarPanel() {
    return [<Button key={1} onClick={() => this.onBatchAudit()} disabled={!havePermission(PUTAWAY_RES.AUDIT)}>
      {commonLocale.batchAuditLocale}
    </Button>, <Button key={2} onClick={() => this.onBatchRemove()} disabled={!havePermission(PUTAWAY_RES.DELETE)}>
      {commonLocale.batchRemoveLocale}
    </Button>];
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
        <PutawaySearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          toggleCallback={this.toggleCallback}
        />
      </div>

    );
  }
}
