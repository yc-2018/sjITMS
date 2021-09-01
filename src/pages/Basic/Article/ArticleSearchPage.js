import { Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Menu, Dropdown, Button, Switch, message } from 'antd';
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
import { articleLocale } from './ArticleLocale';
import { ARTICLE_IMPORT_TYPE } from './Constants';
import ArticleSearchForm from './ArticleSearchForm';
import {
  RESOURCE_IWMS_BASIC_ARTICLE_VIEW,
  RESOURCE_IWMS_BASIC_ARTICLE_CREATE,
  RESOURCE_IWMS_BASIC_ARTICLE_ONLINE,
  RESOURCE_IWMS_BASIC_ARTICLE_DELETE,
  RESOURCE_IWMS_BASIC_ARTICLE_EDIT
} from './Permission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { importTemplateType } from '@/utils/ImportTemplateType';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { CATEGORY_RES } from '@/pages/Basic/Category/CategoryPermission';
import { routerRedux } from 'dva/router';

@connect(({ article, loading }) => ({
  article,
  loading: loading.models.article,
}))
export default class ArticleSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: articleLocale.title,
      data: this.props.article.data,
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
      key: 'article.search.table'
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    // this.state.pageFilter.searchKeyValues.state = '';
    // this.state.pageFilter.searchKeyValues.owner = '';
    this.state.pageFilter.sortFields = { 'lastModified': true };
  }

  componentDidMount() {
    if(this.props.article.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.article.data
    });
    const currentShowPage = this.props.article.showPage;
    const nextShowPage = nextProps.article.showPage;
    if (currentShowPage !== nextShowPage && nextShowPage === 'query')
      this.refreshTable();
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'article/query',
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

  onCreate = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'article/showPage',
      payload: {
        showPage: 'create'
      }
    });
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


  menu = (
    <Menu>
      <Menu.Item>
        <a disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)}
          onClick={() => this.handleShowExcelImportPage(importTemplateType.ARTICLE.name)}>
          {articleLocale.importArticle}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)}
          onClick={() => this.handleShowExcelImportPage(importTemplateType.ARTICLEQPC.name)}>
          {articleLocale.importArticleQpc}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)}
          onClick={() => this.handleShowExcelImportPage(importTemplateType.ARTICLEBARCODE.name)}>
          {articleLocale.importArticleBarcode}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)}
          onClick={() => this.handleShowExcelImportPage(importTemplateType.ARTICLEVENDOR.name)}>
          {articleLocale.importArticleVendor}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)}
          onClick={() => this.handleShowExcelImportPage(importTemplateType.ARTICLEPICKQPC.name)}>
          {articleLocale.importStorePickQty}
        </a>
      </Menu.Item>
    </Menu>
  );

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
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(RESOURCE_IWMS_BASIC_ARTICLE_EDIT),
      onClick: this.onCreate.bind(this, record.uuid)
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
      title: commonLocale.nameLocale,
      sorter: true,
      dataIndex: 'name',
      width: colWidth.codeColWidth,
      render: (val,record) => <EllipsisCol colValue={record.name} />
    },
    {
      title: articleLocale.articleSpec,
      width: colWidth.codeColWidth,
      dataIndex: 'spec',
    },
    {
      title: articleLocale.articleCategory,
      width: colWidth.codeNameColWidth,
      render: record => <a onClick={this.onCategoryView.bind(this, record.category)}
        disabled={!havePermission(CATEGORY_RES.VIEW)}><EllipsisCol colValue={convertCodeName(record.category)} /></a>
    },
    {
      title: articleLocale.articleOwner,
      width: colWidth.codeNameColWidth,
      render: record => <a onClick={this.onViewOwner.bind(this, record.owner ? record.owner.uuid : undefined)}
        disabled={!havePermission(OWNER_RES.VIEW)}><EllipsisCol colValue={convertCodeName(record.owner)} /></a>
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      width: colWidth.enumColWidth,
      render: (text, record) => {
        confirm = record.state === basicState.ONLINE.name ? commonLocale.offlineLocale : commonLocale.onlineLocale;
        return (
          <div>
            <IPopconfirm onConfirm={this.handleOnlineOrOffline.bind(this, record)}
              operate={confirm}
              object={articleLocale.title}
              disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_ONLINE)}
            >
              {
                loginOrg().type === orgType.company.name &&
                <span>
                  <Switch
                    disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_ONLINE)}
                    checked={record.state === basicState.ONLINE.name}
                    size="small" />
                  &emsp;
                  </span>
              }
            </IPopconfirm>
            {getStateCaption(record.state)}
          </div>
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
        type: 'article/online',
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
        type: 'article/offline',
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
        if (batchAction === basicState.ONLINE.caption) {
          if (selectedRows[i].state === basicState.ONLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          } else {
            this.handleOnline(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          }
        } else {
          if (selectedRows[i].state === basicState.OFFLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          } else {
            that.handleOffline(selectedRows[i], true).then(res => {
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

  //  -------- 批处理相关 END -------

  onView = (uuid) => {
    this.props.dispatch({
      type: 'article/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'article/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid,
      }
    });
  }

  onShowUnloadAdviceView = () => {
    this.props.dispatch({
      type: 'article/showPage',
      payload: {
        showPage: 'unLoadAdvice'
      }
    });
  }

  drawActionButton() {
    return (
      <Fragment>
        {loginOrg().type === orgType.dc.name &&
          <Button onClick={this.onShowUnloadAdviceView}>
            {articleLocale.manageUnloadAdvice}
          </Button>
        }
        {loginOrg().type === orgType.company.name &&
          <div>
            <Dropdown overlay={this.menu} placement="bottomCenter">
              <Button disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)} icon="down">
                {commonLocale.importLocale}
              </Button>
            </Dropdown>
            <Button disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)} icon="plus"
              type="primary" onClick={() => this.onCreate()}>
              {commonLocale.createLocale}
            </Button>
          </div>
        }
      </Fragment>
    );
  }

  drawSearchPanel() {
    const { pageFilter } = this.state;
    return (<ArticleSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
  }

  drawToolbarPanel() {
    return loginOrg().type === 'COMPANY' ? [
      <Button key={commonLocale.batchOnlineLocale} disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_ONLINE)} onClick={() => this.handleBatchOnline()}>
        {commonLocale.batchOnlineLocale}
      </Button>,
      <Button key={commonLocale.batchOfflineLocale} disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_ONLINE)} onClick={() => this.handleBatchOffline()}>
        {commonLocale.batchOfflineLocale}
      </Button>
    ] : null;
  }

  // --- 批量导入相关 ---

  handleShowExcelImportPage = (type) => {
    this.props.dispatch({
      type: 'article/showPage',
      payload: {
        showPage: 'import',
        importType: type
      }
    });
  }

}
