import { Button, message } from 'antd';
import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Empty from '@/pages/Component/Form/Empty';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import IncInvBillSearchForm from './IncInvBillSearchForm';
import { State } from './IncInvBillContants';
import { incLocale } from './IncInvBillLocale';
import { INC_RES } from './IncInvBillPermission';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ inc, loading }) => ({
  inc,
  loading: loading.models.inc,
}))
export default class IncInvBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: incLocale.title,
      data: props.inc.data,
      suspendLoading: false,
      key: 'incinv.search.table'
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.inc.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.inc.data
    });
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
        reportParams: []
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
      type: 'inc/query',
      payload: queryFilter,
    });
  };

  handleShowExcelImportPage = () => {
    this.props.dispatch({
      // type: 'inc/getImportTemplateUrl',
      // callback: response => {
      //   if (response && response.success) {
      //     let importTemplateUrl = response.data;
      //     this.props.dispatch({
      //       type: 'inc/showPage',
      //       payload: {
      //         showPage: 'import',
      //         importTemplateUrl: importTemplateUrl,
      //       }
      //     });
      //   }
      // }
      type: 'inc/showPage',
      payload: {
        showPage: 'import',
      }
    });
  }

  drawActionButton = () => {
    const menus = [{
      name: incLocale.manageType,
      onClick: this.onIncType
    },
  {
    name: commonLocale.importLocale,
    onClick: this.handleShowExcelImportPage
  }];
    return (
      <Fragment>
        {/* <Button
          onClick={() => this.onIncType()}
          disabled={!havePermission(INC_RES.CREATE)}>
          {incLocale.manageType}
        </Button>
        <Button
          onClick={() => this.handleShowExcelImportPage()}
          disabled={!havePermission(INC_RES.CREATE)}>
          {commonLocale.importLocale}
        </Button> */}
        <Button icon="plus" type="primary"
          onClick={() => this.onCreate(null)} disabled={!havePermission(INC_RES.CREATE)}>
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    );
  }

  drawSearchPanel = () => {
    return <IncInvBillSearchForm
      filterValue={this.state.pageFilter.searchKeyValues}
      refresh={this.onSearch}
      toggleCallback={this.toggleCallback}
    />
  }

  drawToolbarPanel = () => {
    return [
      <Button key='batchAudit'
        disabled={!havePermission(INC_RES.AUDIT)}
        onClick={() => this.onBatchAudit()}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key='batchRemove'
        disabled={!havePermission(INC_RES.REMOVE)}
        onClick={() => this.onBatchRemove()}
      >
        {commonLocale.batchRemoveLocale}
      </Button>,
      <PrintButton
        key='printButton'
        reportParams={this.state.reportParams ? this.state.reportParams : []}
        moduleId={PrintTemplateType.INCINVBILL.name} />
    ];
  }

  changeSelectedRows = (selectedRows) => {
    let param = [];
    for (let i = 0; i < selectedRows.length; i++) {
      param.push({
        billNumber: selectedRows[i].billNumber
      })
    }
    this.setState({
      reportParams: param
    }, () => { })
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
      confirmCaption: incLocale.title,
      disabled: !havePermission(INC_RES.AUDIT),
      onClick: this.onAudit.bind(this, record)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record.uuid)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(INC_RES.AUDIT),
      confirm: true,
      confirmCaption: incLocale.title,
      onClick: this.onSimpleAudit.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(INC_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(INC_RES.REMOVE),
      confirm: true,
      confirmCaption: incLocale.title,
      onClick: this.onRemove.bind(this, record, false)
    }];
  }

  renderOperateCol = (record) => {
    if (record.state === State.SAVED.name) {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    }
    if (record.state === State.APPROVED.name) {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    }
    if (record.state === State.AUDITED.name) {
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
      title: incLocale.type,
      dataIndex: 'type',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => <EllipsisCol colValue={val} />
    },
    {
      title: commonLocale.inWrhLocale,
      dataIndex: 'wrh',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: incLocale.incer,
      dataIndex: 'incer',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: commonLocale.inUploadDateLocale,
      dataIndex: 'uploadDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: (val) => {
        return val ? moment(val).format('YYYY-MM-DD') : <Empty />;
      }
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
      let ownerUuid = undefined;
      let wrhUuid = undefined;
      let incerUuid = undefined;
      let containerBarcodes = undefined;
      let articleCodes = undefined;
      let binCodes = undefined;
      if (data.owner) {
        ownerUuid = JSON.parse(data.owner).uuid;
      }
      if (data.wrh) {
        wrhUuid = JSON.parse(data.wrh).uuid;
      }
      if (data.days) {
        days = data.days
      }
      if (data.uploadDate && data.uploadDate[0] && data.uploadDate[1]) {
        data.beginUploadDate = moment(data.uploadDate[0]).format('YYYY-MM-DD');
        data.endUploadDate = moment(data.uploadDate[1]).format('YYYY-MM-DD');
      } else if (pageFilter.searchKeyValues.beginUploadDate && pageFilter.searchKeyValues.endUploadDate) {
        delete pageFilter.searchKeyValues.beginUploadDate;
        delete pageFilter.searchKeyValues.endUploadDate;
      }
      if (data.incer) {
        incerUuid = JSON.parse(data.incer).uuid;
      }

      if (data.containerBarcodes) {
        containerBarcodes = data.containerBarcodes.split(',');
      }
      if (data.articleCodes) {
        articleCodes = data.articleCodes.split(',');
      }
      if (data.binCodes) {
        binCodes = data.binCodes.split(',');
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        ownerUuid: ownerUuid,
        wrhUuid: wrhUuid,
        incerUuid: incerUuid,
        containerBarcodes: containerBarcodes,
        articleCodes: articleCodes,
        binCodes: binCodes,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        days: getQueryBillDays()
      };
    }

    this.refreshTable();
  }

  /**
   * 跳转到详情页面
   */
  onView = (uuid) => {
    this.props.dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }
  onIncType = () => {
    this.props.dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'type'
      }
    });
  }
  /**
   * 跳转到编辑页面
   */
  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  onSimpleAudit = (record, callback) => {
    const { dispatch } = this.props;
    let that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'inc/onAudit',
        payload: record,
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
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
  };

  /**
   * 审核
   */
  onAudit = (entity) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'inc/showPage',
      payload: {
        showPage: 'audit',
        entityUuid: entity.uuid,
      }
    });
  }

  onRemove = (record, callback) => {
    const { dispatch } = this.props;
    let that = this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'inc/onRemove',
        payload: record,
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.removeSuccessLocale);
          }
        }
      });
    })
  };

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
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state === State.AUDITED.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          } else {
            that.onSimpleAudit(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          }
        } else if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state !== State.SAVED.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          } else {
            that.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
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
