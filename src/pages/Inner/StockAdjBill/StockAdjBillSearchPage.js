import { connect } from 'dva';
import { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, message, Form } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { convertCodeName, convertDateToTime, convertDate } from '@/utils/utils';
import { getMethodCaption } from '@/utils/OperateMethod';
import { State, getAdjTypeCaption } from './StockAdjBillContants';
import { stockAdjBillLocale } from './StockAdjBillLocale';
import { PRODUCTIONBATCHADJBILL_RES } from './StockAdjBillPermission';
import StockAdjBillSearchForm from './StockAdjBillSearchForm';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';
const FormItem = Form.Item;

@connect(({ stockadj, loading }) => ({
  stockadj,
  loading: loading.models.stockadj,
}))
@Form.create()
export default class StockAdjBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: stockAdjBillLocale.title,
      data: props.stockadj.data,
      suspendLoading: false,
      key: 'stockAdj.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    };
  }

  componentDidMount() {
    if (this.props.stockadj.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.stockadj.data
    });
  }

  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
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
        type: 'stockadj/onRemove',
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
        type: 'stockadj/onAudit',
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

  onView = (record) => {
    this.props.dispatch({
      type: 'stockadj/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid,
        isApprove: false
      }
    });
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'stockadj/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  /**
   * 显示原因管理界面
   */
  onShowReasonView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'stockadj/onShowReasonView',
    });
  }


  onSearch = (data) => {
    const { pageFilter } = this.state;
    var days = '';
    pageFilter.searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      stateEquals: '',
      typeEquals: '',
      ownerUuidEquals: '',
      wrhUuidEquals: '',
      adjerUuidEquals: '',
      days: getQueryBillDays()
    }
    pageFilter.sortFields = {
      billNumber: false
    }

    if (data) {
      if (data.adjer) {
        data.adjerUuidEquals = JSON.parse(data.adjer).uuid
      }
      if (data.wrh) {
        data.wrhUuidEquals = JSON.parse(data.wrh).uuid
      }
      if (data.owner) {
        data.ownerUuidEquals = JSON.parse(data.owner).uuid
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        days: days
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
      type: 'stockadj/query',
      payload: queryFilter,
    });
  };

  /**
     * 绘制右上角按钮
     */
  drawActionButton = () => {
    const menus = [{
      name:stockAdjBillLocale.reasonTitle,
      onClick:this.onShowReasonView
    }];
    return (
      <Fragment>
        {/* <Button onClick={this.onShowReasonView}>
          {stockAdjBillLocale.reasonTitle}
        </Button> */}
        <Button disabled={!havePermission(PRODUCTIONBATCHADJBILL_RES.CREATE)} type="primary" icon='plus' onClick={this.onCreate.bind(this, '')} >
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    )
  }

  drawToolbarPanel() {
    return [
      <Button key="onBatchAudit" onClick={() => this.onBatchAudit()}
        disabled={!havePermission(PRODUCTIONBATCHADJBILL_RES.AUDIT)}>
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key="onBatchRemove" onClick={() => this.onBatchRemove()}
        disabled={!havePermission(PRODUCTIONBATCHADJBILL_RES.DELETE)}>
        {commonLocale.batchRemoveLocale}
      </Button>,
    ];
  }

  drawSearchPanel = () => {
    return <StockAdjBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
      refresh={this.onSearch} toggleCallback={this.toggleCallback} />;
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
          disabled: !havePermission(PRODUCTIONBATCHADJBILL_RES.CREATE),
          onClick: this.onCreate.bind(this, record.uuid)
        }
      );
    }

    if (record.state != State.AUDITED.name) {
      operateProps.push(
        {
          name: commonLocale.auditLocale,
          disabled: !havePermission(PRODUCTIONBATCHADJBILL_RES.AUDIT),
          confirm: true,
          confirmCaption: stockAdjBillLocale.title,
          onClick: this.onAudit.bind(this, record, false)
        }
      );
    }

    if (record.state === State.SAVED.name) {
      operateProps.push(
        {
          name: commonLocale.deleteLocale,
          disabled: !havePermission(PRODUCTIONBATCHADJBILL_RES.DELETE),
          confirm: true,
          confirmCaption: stockAdjBillLocale.title,
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
      render: (text, record) => {
        return (
          <a onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      }
    },
    {
      title: stockAdjBillLocale.adjType,
      dataIndex: 'adjType',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (text, record) => getAdjTypeCaption(record.adjType)
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.owner)} />
    },
    {
      title: commonLocale.inWrhLocale,
      dataIndex: 'wrh',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.wrh)} />
    },
    {
      title: stockAdjBillLocale.adjer,
      dataIndex: 'adjer',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.adjer)} />
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      sorter: true,
      render: (text, record) => {
        return (<BadgeUtil value={record.state} />)
      }
    },
    {
      key: 'operate',
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => {
        return <OperateCol menus={this.fetchOperateProps(record)} />
      }
    },
  ];
}
