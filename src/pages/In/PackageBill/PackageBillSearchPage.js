import { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, message } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import PackageBillSearchForm from './PackageBillSearchForm';
import { State } from './PackageBillContants';
import { orderLocale } from './PackageBillLocale';
import { PACKAGE_RES } from './PackageBillPermission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { getQueryBillDays } from '@/utils/LoginContext';
@connect(({ packageBill, loading }) => ({
  packageBill,
  loading: loading.models.packageBill,
}))
@Form.create()
export default class PackageBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: orderLocale.title,
      data: props.packageBill.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      operate: '',
      modalVisible: false,
      suspendLoading: false,
      key: 'packageBill.search.table'
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    };
  }

  componentDidMount() {
    if(this.props.packageBill.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.packageBill.data
    });
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

  /**
   * 刷新/重置
   */
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
      type: 'packageBill/query',
      payload: queryFilter,
    });
  };
  /**
   * 搜索
   */
  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    let ownerUuid = undefined;
    var days = '';
    if (data) {
      if (data.owner && data.owner != '') {
        ownerUuid = JSON.parse(data.owner).uuid;
      }
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        ownerUuid: ownerUuid,
        billNumberAndSource: data.billNumberAndSource,
        state:data.state,
        customerCodeAndName:data.customerCodeAndName,
        days: days
      }
      pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        days: getQueryBillDays()
      }
      pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
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
      type: 'packageBill/showPage',
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
      batchAction: commonLocale.deleteLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量审核
   */
  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量完成
   */
  onBatchFinish = () => {
    this.setState({
      batchAction: commonLocale.finishLocale,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  // 批量操作
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state === State.SAVED.name) {
            that.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state === State.SAVED.name) {
            that.onAudit(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        }
        else if (batchAction === commonLocale.finishLocale) {
          if (selectedRows[i].state === State.INITIAL.name) {
            that.onFinish(selectedRows[i], true).then(res => {
              bacth(i + 1);
            })
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
   * 单一完成
   */
  onFinish = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'packageBill/finish',
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

  /**
   * 单一审核
   */
  onAudit= (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'packageBill/audit',
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
        type: 'packageBill/delete',
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
      type: 'packageBill/showPage',
      payload: {
        showPage: 'view',
        billNumber: record.billNumber
      }
    });
  }

  /**
   * 批量导入
   */
  handleShowExcelImportPage = () => {
    this.props.dispatch({
      type: 'packageBill/showPage',
      payload: {
        showPage: 'import',
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
      disabled: !havePermission(PACKAGE_RES.AUDIT),
      confirm: true,
      confirmCaption: orderLocale.title,
      onClick: this.onAudit.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(PACKAGE_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(PACKAGE_RES.DELETE),
      confirm: true,
      confirmCaption: orderLocale.title,
      onClick: this.onRemove.bind(this, record, false)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.finishLocale,
      disabled: !havePermission(PACKAGE_RES.FINISH),
      confirm: true,
      confirmCaption: orderLocale.title,
      onClick: this.onFinish.bind(this, record, false)
    }];
  }

  fetchOperatePropsFour = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(PACKAGE_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }];
  }

  renderOperateCol = (record) => {
    if (State[record.state].name == 'SAVED') {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    } else if(State[record.state].name == 'INITIAL') {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    } else if(State[record.state].name == 'FINISHED') {
      return <OperateCol menus={this.fetchOperatePropsFour(record)} />
    } else{
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
      render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>
    },
    {
      title: commonLocale.inOwnerLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'owner',
      sorter: true,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: '客户',
      width: colWidth.codeNameColWidth,
      dataIndex: 'customer',
      sorter: true,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: '客户地址',
      width: colWidth.codeNameColWidth,
      dataIndex: 'customerAddress',
      sorter: true,
      render: val => val ? <EllipsisCol colValue={val} /> : <Empty />
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'state',
      sorter: true,
      render: val => <BadgeUtil value={val} />
    },
    {
      title: '收货人',
      dataIndex: 'receiver',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
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
    return (<Fragment>
      <Button disabled={!havePermission(PACKAGE_RES.CREATE)}
              onClick={() => this.handleShowExcelImportPage()}>
        {commonLocale.importLocale}
      </Button>
      <Button id="createButton" icon="plus" type="primary" disabled={!havePermission(PACKAGE_RES.CREATE)}
              onClick={this.onCreate.bind(this, '')}>
        {commonLocale.createLocale}
      </Button>
    </Fragment>);
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return [
      <Button key={2} onClick={() => this.onBatchRemove()}
              disabled={!havePermission(PACKAGE_RES.DELETE)}>
        {commonLocale.batchRemoveLocale}
      </Button>,
      <Button key={3} onClick={() => this.onBatchAudit()} disabled={!havePermission(PACKAGE_RES.AUDIT)}>
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key={4} onClick={() => this.onBatchFinish()}
              disabled={!havePermission(PACKAGE_RES.FINISH)}
      >
        {commonLocale.batchFinishLocale}
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
        <PackageBillSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
          toggleCallback={this.toggleCallback}
        />
      </div>

    );
  }
}
