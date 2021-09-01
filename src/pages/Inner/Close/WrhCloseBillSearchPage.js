import { Button, message } from 'antd';
import { Fragment } from 'react';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import SearchPage from '@/pages/Component/Page/SearchPage';
import WrhCloseBillSearchForm from './WrhCloseBillSearchForm';
import { wrhCloseState } from './WrhCloseBillState';
import { closeLocale } from './WrhCloseBillLocale';
import { getTypeCaption } from './WrhCloseBillType';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { havePermission } from '@/utils/authority';
import { WRH_RES } from './WrhCloseBillPermission';
import { getActiveKey } from '@/utils/LoginContext';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ close, loading }) => ({
  close,
  loading: loading.models.close,
}))
export default class WrhCloseBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: closeLocale.title,
      data: props.close.queryData,
      suspendLoading: false,
      key: 'wrhClose.search.table'
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.close.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.close.queryData
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
      type: 'close/query',
      payload: queryFilter,
    });
  };

  drawActionButton = () => {
    const menus = [{
      name: closeLocale.closeReason,
      onClick:this.onMangeCloseReason
    }];
    return (
      <Fragment>
        {/* <Button
          onClick={() => this.onMangeCloseReason(null)}
          disabled={!havePermission(WRH_RES.CREATE)}
        >
          {closeLocale.closeReason}
        </Button> */}
        <Button icon="plus" type="primary"
          disabled={!havePermission(WRH_RES.CREATE)}
          onClick={() => this.onCreate(null)}>
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    );
  }

  onMangeCloseReason = () => {
    this.props.dispatch({
      type: 'close/showPage',
      payload: {
        showPage: 'closeReason'
      }
    });
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'close/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  drawSearchPanel = () => {
    return <WrhCloseBillSearchForm
      filterValue={this.state.pageFilter.searchKeyValues}
      refresh={this.onSearch}
      toggleCallback={this.toggleCallback}
    />
  }

  drawToolbarPanel = () => {
    return [
      <Button key='1' disabled={!havePermission(WRH_RES.AUDIT)}
        onClick={() => this.onBatchAudit()}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key='2' disabled={!havePermission(WRH_RES.REMOVE)}
        onClick={() => this.onBatchRemove()}
      >
        {commonLocale.batchRemoveLocale}
      </Button>
    ];
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record.uuid)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record.uuid)
    }, {
      name: commonLocale.auditLocale,
      confirm: true,
      confirmCaption: closeLocale.title,
      disabled: !havePermission(WRH_RES.AUDIT),
      onClick: this.onAudit.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(WRH_RES.CREATE),
      onClick: this.onEdit.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      confirmCaption: closeLocale.title,
      disabled: !havePermission(WRH_RES.REMOVE),
      onClick: this.onDelete.bind(this, record, false)
    }];
  }

  renderOperateCol = (record) => {
    if (record.state === wrhCloseState.SAVED.name) {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    } else {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
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
      title: closeLocale.reason,
      dataIndex: 'reason',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => <EllipsisCol colValue={val} />
    },
    {
      title: closeLocale.type,
      dataIndex: 'type',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => <span>{getTypeCaption(val)}</span>,
    },
    {
      title: closeLocale.closer,
      dataIndex: 'closer',
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

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      let closerUuid = undefined;
      if (data.closer) {
        closerUuid = JSON.parse(data.closer).uuid;
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        closerUuid: closerUuid,
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
      type: 'close/showPage',
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
      type: 'close/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  /**
   * 审核
   */
  onAudit = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'close/onAudit',
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
            message.success(commonLocale.auditSuccessLocale);
            that.refreshTable();
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
        type: 'close/onRemove',
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
    const { selectedRows, batchAction } = this.state;
    this.setState({
      suspendLoading: true
    })
    const that = this;

    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state != wrhCloseState.SAVED.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          } else {
            this.onAudit(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          }
        } else if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state != wrhCloseState.SAVED.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          } else {
            that.onDelete(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
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
