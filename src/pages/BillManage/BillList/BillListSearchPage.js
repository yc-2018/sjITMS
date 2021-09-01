import { Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Menu, Dropdown, Button, Popconfirm, Switch, Divider, message } from 'antd';
import SearchPanel from '@/components/MyComponent/SearchPanel';
import ToolbarPanel from '@/components/MyComponent/ToolbarPanel';
import Ellipsis from '@/components/Ellipsis';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import SearchPage from '@/pages/Component/Page/SearchPage';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { havePermission } from '@/utils/authority';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { orgType } from '@/utils/OrgType';
import { colWidth } from '@/utils/ColWidth';
import { articleLocale } from '@/pages/Basic/Article/ArticleLocale';
import { ARTICLE_IMPORT_TYPE } from '@/pages/Basic/Article/Constants';
import BillListSearchForm from './BillListSearchForm';
import {
  RESOURCE_IWMS_BASIC_ARTICLE_VIEW,
  RESOURCE_IWMS_BASIC_ARTICLE_CREATE,
  RESOURCE_IWMS_BASIC_ARTICLE_ONLINE,
  RESOURCE_IWMS_BASIC_ARTICLE_DELETE,
  RESOURCE_IWMS_BASIC_ARTICLE_EDIT
} from '@/pages/Basic/Article/Permission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { importTemplateType } from '@/utils/ImportTemplateType';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { CATEGORY_RES } from '@/pages/Basic/Category/CategoryPermission';
import { routerRedux } from 'dva/router';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import {BillListLocal} from './BillListLocal'

@connect(({ billList, loading }) => ({
  billList,
  loading: loading.models.billList,
}))
export default class BillListSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: '费用单',
      data: this.props.billList.data,
      suspendLoading: false,
      selectedRows: [],
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      taskInfo: {
        total: 0,
        type: '',
      },
      failedTasks: [],
      importTemplateUrl: '',
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.sortFields = { 'lastModified': true };
  }

  componentDidMount() {
    if(this.props.billList.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.billList.data
    });
    const currentShowPage = this.props.billList.showPage;
    const nextShowPage = nextProps.billList.showPage;
    if (currentShowPage !== nextShowPage && nextShowPage === 'query')
      this.refreshTable();
  }

  drawActionButton = () => {
    return (
      <Fragment>
        {loginOrg().type === orgType.company.name &&
          <div>
            <Button disabled={false} icon="plus"
              type="primary" onClick={() => this.onCreate()}>
              {commonLocale.createLocale}
            </Button>
          </div>
        }
      </Fragment>
    );
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'billList/showPage',
      payload: {
        showPage: 'create',
        // entityUuid: uuid?uuid:''
      }
    });
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    
    dispatch({
      type: 'billList/page',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        state: ''
      }
      pageFilter.sortFields = { 'lastModified': true }
    }
    this.refreshTable();
  }

  /**
   * 跳转到类别详情页面
   */
  onCategoryView = (category) => {
    this.props.dispatch({
      type: 'category/get',
      payload: category.uuid,
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/basic/category',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(RESOURCE_IWMS_BASIC_ARTICLE_VIEW),
      onClick: this.onView.bind(this, record.uuid)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(RESOURCE_IWMS_BASIC_ARTICLE_VIEW),
      onClick: this.onView.bind(this, record.uuid),
    }];
  }

  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (val, record) => <a disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_VIEW)}
        onClick={this.onView.bind(this, record.uuid)}>
        {val}
      </a>,
    },
    {
      title: BillListLocal.billNumber,
      dataIndex: 'billNumber',
      width: colWidth.codeColWidth,
      render: (val,record) => <EllipsisCol colValue={record.billNumber} />
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      width: colWidth.enumColWidth,
      render: (text, record) => {
        return (
            <BadgeUtil value={record.state} />
        )
      },
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,

      render: record => (
        loginOrg().type === 'COMPANY' ?
          <OperateCol menus={this.fetchOperatePropsTwo(record)} />
          :
          <OperateCol menus={this.fetchOperatePropsOne(record)} />
      ),
    },
  ];

  /**
   * 国际化 - 表格中启用禁用确认文字
   */
  confirmEnableDisableTips = (state) => {
    let text = state === basicState.ONLINE.name
      ? formatMessage({ id: 'common.operate.disable' })
      : formatMessage({ id: 'common.operate.enable' });
    return formatMessage({ id: 'common.operate.confirm' }) + " " + text.toLowerCase() + "?";
  }

  /**
   * 启用或者禁用处理
   */
  handleOnlineOrOffline = (record) => {
    if (record.state == basicState.ONLINE.name) {
      this.handleOffline(record, false);
    } else if (record.state == basicState.OFFLINE.name) {
      this.handleOnline(record, false);
    }
  };

  /**
   * 启用处理
   *
   * @param {boolean} batch 是否为批量
   */
  handleOnline = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'billList/online',
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
            message.success(commonLocale.onlineSuccessLocale);
          }
        }
      });
    });
  };

  /**
   * 禁用处理
   *
   * @param {boolean} batch 是否为批量
   */
  handleOffline = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'billList/offline',
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
            message.success(commonLocale.offlineSuccessLocale);
          }
        }
      });
    });
  };

  handleOneAudit = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'billList/offline',
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
            message.success(commonLocale.offlineSuccessLocale);
          }
        }
      });
    });
  }

  //  -------- 批处理相关 START -------

  /**
   * 批量启用
   */
  handleBatchOnline = () => {
    this.setState({
      batchAction: basicState.ONLINE.caption
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量禁用
   */
  handleBatchOffline = () => {
    this.setState({
      batchAction: basicState.OFFLINE.caption
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  handleAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  /**
   * 批量处理统一入口
   */
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state != 'INIT') {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          } else {
            this.handleOneAudit(selectedRows[i], true).then(res => {
              bacth(i + 1)
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

  //  -------- 批处理相关 END -------

  onView = (uuid) => {
    this.props.dispatch({
      type: 'billList/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  onShowUnloadAdviceView = () => {
    this.props.dispatch({
      type: 'billList/showPage',
      payload: {
        showPage: 'unLoadAdvice'
      }
    });
  }


  drawSearchPanel() {
    const { pageFilter } = this.state;
    return (<BillListSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
  }

  drawToolbarPanel() {
    return (
      <Fragment>
        {loginOrg().type === orgType.company.name &&
          <div>
            <Button
              // disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_ONLINE)}
              onClick={() =>
                this.handleAudit()
              }
            >
              {commonLocale.auditLocale}
            </Button>
          </div>
        }
      </Fragment>
    );
  }

}
