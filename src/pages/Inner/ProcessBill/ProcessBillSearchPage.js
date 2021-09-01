import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { processBillLocale } from './ProcessBillLocale';
import { PROCESSBILL_RES } from './ProcessBillPermission';
import ProcessBillSearchForm from './ProcessBillSearchForm';
import { ProcessBillState } from './ProcessBillContants';
import { routerRedux } from 'dva/router';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ process, loading }) => ({
  process,
  loading: loading.models.process,
}))
@Form.create()
export default class ProcessBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: processBillLocale.title,
      data: props.process.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      suspendLoading: false,
      key: 'ProcessBill.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if (this.props.process.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.process.data
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
    dispatch({
      type: 'process/query',
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
      if (data.owner && data.owner != '') {
        data.ownerUuid = JSON.parse(data.owner).uuid
      }
      if (data.processScheme && data.processScheme != '') {
        data.processSchemeUuid = JSON.parse(data.processScheme).uuid
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ...data,
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
  onCreate = (uuid, billNumber) => {
    const payload = {
      showPage: 'create'
    }
    if (uuid != '') {
      payload.entityUuid = uuid;
      payload.processBillNumber = billNumber;
    }
    this.props.dispatch({
      type: 'process/showPage',
      payload: {
        ...payload
      }
    });
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

  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  // 批量操作
  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state == ProcessBillState.SAVED.name) {
            this.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1)
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          }
        }

        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state === ProcessBillState.SAVED.name) {
            that.onAudit(selectedRows[i], true).then(res => {
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
   * 审核
   */
  onAudit = (entity, batch) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'process/onAudit',
        payload: {
          uuid: entity.uuid,
          version: entity.version,
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, entity);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.auditSuccessLocale);
          }
        }
      });
    })
  }

  /**
   * 单一删除
   */
  onRemove = (record, batch) => {
    const { dispatch } = this.props;
    const that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'process/onRemove',
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
 * 跳转到加工方案详情页面
 */
  onProcessingSchemeView = (val) => {
    this.props.dispatch({
      type: 'processingScheme/getByUuid',
      payload: val.uuid,
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/inner/processingScheme',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'process/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid,
        processBillNumber: record.billNumber,
        state: record.state
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
      name: commonLocale.editLocale,
      disabled: !havePermission(PROCESSBILL_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid, record.billNumber)
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      confirmCaption: processBillLocale.title,
      disabled: !havePermission(PROCESSBILL_RES.REMOVE),
      onClick: this.onRemove.bind(this, record, false)
    }, {
      name: commonLocale.auditLocale,
      confirm: true,
      confirmCaption: processBillLocale.title,
      disabled: !havePermission(PROCESSBILL_RES.AUDIT),
      onClick: this.onAudit.bind(this, record, false)
    }];
  }


  renderOperateCol = (record) => {

    if (ProcessBillState[record.state].name == 'SAVED') {
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
        <a onClick={this.onView.bind(this, record)}>{record.billNumber}</a>
    },
    {
      title: processBillLocale.processScheme,
      width: colWidth.codeNameColWidth,
      dataIndex: 'processScheme',
      sorter: true,
      // render: record => record.processScheme ? <EllipsisCol colValue={convertCodeName(record.processScheme)} /> : <Empty />
      render: record => <a onClick={this.onProcessingSchemeView.bind(this, record.processScheme)}
      > <EllipsisCol colValue={convertCodeName(record.processScheme)} /></a>
    },
    {
      title: commonLocale.inOwnerLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'owner',
      sorter: true,
      render: record => record.owner ? <EllipsisCol colValue={convertCodeName(record.owner)} /> : <Empty />
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      sorter: true,
      render: record => <BadgeUtil value={record.state} />
    },
    {
      title: commonLocale.inUploadDateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'uploadDate',
      sorter: true,
      render: record => <span>{record.uploadDate ? moment(record.uploadDate).format('YYYY-MM-DD') : <Empty />}</span>,
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
        <Button icon="plus" type="primary" onClick={this.onCreate.bind(this, '')}
          disabled={!havePermission(PROCESSBILL_RES.CREATE)}
        >
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    )
  }

  /**
  * 绘制批量工具栏
  */
  drawToolbarPanel() {
    return [
      <Button key={1} onClick={() => this.onBatchRemove()}
        disabled={!havePermission(PROCESSBILL_RES.REMOVE)}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
      <Button key='2'
        disabled={!havePermission(PROCESSBILL_RES.AUDIT)}
        onClick={() => this.onBatchAudit()}
      >
        {commonLocale.batchAuditLocale}
      </Button>
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
        <ProcessBillSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          toggleCallback={this.toggleCallback}
        />
      </div>
    );
  }
}
