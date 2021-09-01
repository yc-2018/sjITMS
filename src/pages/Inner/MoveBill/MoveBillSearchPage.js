import { connect } from 'dva';
import { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, message, Form } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { convertCodeName, convertDateToTime } from '@/utils/utils';
import { getMethodCaption } from '@/utils/OperateMethod';
import { State } from './MoveBillContants';
import { moveBillLocale } from './MoveBillLocale';
import { MOVEBILL_RES } from './MoveBillPermission';
import MoveBillSearchForm from './MoveBillSearchForm';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import moment from 'moment';
import { getQueryBillDays } from '@/utils/LoginContext';

const FormItem = Form.Item;

@connect(({ movebill, loading }) => ({
  movebill,
  loading: loading.models.movebill,
}))
@Form.create()
export default class MoveBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: moveBillLocale.title,
      data: props.movebill.data,
      suspendLoading: false,
      key: 'move.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    };
  }

  componentDidMount() {
    if (this.props.movebill.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.movebill.data
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
        type: 'movebill/onRemove',
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
        type: 'movebill/onAudit',
        payload: {
          uuid: record.uuid,
          version: record.version,
          itemQtys: []
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
      type: 'movebill/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid,
        isApprove: false
      }
    });
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'movebill/showPage',
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
      type: 'movebill/onShowReasonView',
    });
  }


  onSearch = (data) => {
    const { pageFilter } = this.state;
    var days = '';
    if (data) {
      if (data.mover) {
        data.moverUuidEquals = JSON.parse(data.mover).uuid
      }
      if (data.fromWrh) {
        data.fromWrhUuidEquals = JSON.parse(data.fromWrh).uuid
      }
      if (data.toWrh) {
        data.toWrhUuidEquals = JSON.parse(data.toWrh).uuid
      }
      if (data.days) {
        days = data.days
      }
      if (data.uploadDate && data.uploadDate[0] && data.uploadDate[1]) {
        data.uploadDateStart = moment(data.uploadDate[0]).format('YYYY-MM-DD');
        data.uploadDateEnd = moment(data.uploadDate[1]).format('YYYY-MM-DD');
        delete data.uploadDate;
      } else if (pageFilter.searchKeyValues.uploadDateStart && pageFilter.searchKeyValues.uploadDateEnd) {
        delete pageFilter.searchKeyValues.uploadDateStart;
        delete pageFilter.searchKeyValues.uploadDateEnd;
      }

      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        days: days
      },
        pageFilter.likeKeyValues = {
          ...pageFilter.likeKeyValues,
          ...data
        }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        stateEquals: '',
        moverUuidEquals: '',
        fromWrhUuidEquals: '',
        days: getQueryBillDays()
      },
        pageFilter.likeKeyValues = {
          billNumberLike: '',
          articleCodeContain: '',
          fromContainerContain: '',
          toContainerContain: '',
          fromBinContain: '',
          toBinContain: ''
        },
        pageFilter.sortFields = {
          billNumber: false
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
      type: 'movebill/query',
      payload: queryFilter,
    });
  };

  /**
     * 绘制右上角按钮
     */
  drawActionButton = () => {
    const menus = [{
      name: moveBillLocale.moveTypeTitle,
      onClick: this.onShowReasonView
    }];
    return (
      <Fragment>
        {/* <Button onClick={this.onShowReasonView}>
          {moveBillLocale.moveTypeTitle}
        </Button> */}
        <Button disabled={!havePermission(MOVEBILL_RES.CREATE)} type="primary" icon='plus' onClick={this.onCreate.bind(this, '')} >
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    )
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
      <Button key="onBatchAudit" onClick={() => this.onBatchAudit()}
        disabled={!havePermission(MOVEBILL_RES.AUDIT)}>
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key="onBatchRemove" onClick={() => this.onBatchRemove()}
        disabled={!havePermission(MOVEBILL_RES.DELETE)}>
        {commonLocale.batchRemoveLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.MOVEBILL.name} />
    ];
  }

  drawSearchPanel = () => {
    return <MoveBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
      filterLikeValue={this.state.pageFilter.likeKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
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
          disabled: !havePermission(MOVEBILL_RES.CREATE),
          onClick: this.onCreate.bind(this, record.uuid)
        }
      );
    }

    if (record.state != State.AUDITED.name) {
      operateProps.push(
        {
          name: commonLocale.auditLocale,
          disabled: !havePermission(MOVEBILL_RES.AUDIT),
          confirm: true,
          confirmCaption: moveBillLocale.title,
          onClick: this.onAudit.bind(this, record, false)
        }
      );
    }

    if (record.state === State.SAVED.name) {
      operateProps.push(
        {
          name: commonLocale.deleteLocale,
          disabled: !havePermission(MOVEBILL_RES.DELETE),
          confirm: true,
          confirmCaption: moveBillLocale.title,
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
      render: (val, record) =>
        <span>
          <a onClick={this.onView.bind(this,record)}>{record.billNumber}</a>
          <br/>
        </span>
    },
    {
      title: '来源单号',
      dataIndex: 'sourceBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (val, record) =>
        record.sourceBillNumber ?
          <EllipsisCol colValue={record.sourceBillNumber} /> : <Empty />
    },
    {
      title: commonLocale.operateMethodLocale,
      dataIndex: 'method',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (text, record) => getMethodCaption(record.method)
    },
    {
      title: '移库类型',
      dataIndex: 'type',
      sorter: true,
      width: colWidth.enumColWidth,
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.owner)} />
    },
    {
      title: moveBillLocale.fromWrh,
      dataIndex: 'fromWrh',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.fromWrh)} />
    },
    {
      title: moveBillLocale.toWrh,
      dataIndex: 'toWrh',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.toWrh)} />
    },
    {
      title: moveBillLocale.mover,
      dataIndex: 'mover',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.mover)} />
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
