import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Switch} from 'antd';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { sourceWay } from '@/utils/SourceWay';
import { convertCodeName } from '@/utils/utils';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { colWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import CategorySearchForm from './CategorySearchForm';
import { CATEGORY_RES } from './CategoryPermission';
import { categoryLocale } from './CategoryLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import {VENDOR_RES} from "../Vendor/VendorPermission";
import {vendorLocale} from "../Vendor/VendorLocale";
@connect(({ category, loading }) => ({
  category,
  loading: loading.models.category,
}))
export default class CategorySearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: categoryLocale.smallTitle,
      data: props.category.data,
      suspendLoading: false,
      key: 'category.search.table',
      entity: {}
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
  }

  componentDidMount() {
    if(this.props.category.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.category.data,
    });
  }

  drawSearchPanel = () => {
    return <CategorySearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
  }
  drawToolbarPanel = () => {
    return loginOrg().type === 'COMPANY' && [
      <Button key='onLine' disabled={!havePermission(CATEGORY_RES.ONLINE)}
        onClick={() => this.onBatchOnline()}
      >
        {commonLocale.batchOnlineLocale}
      </Button>,
      <Button key='offLine' disabled={!havePermission(CATEGORY_RES.ONLINE)}
        onClick={() => this.onBatchOffline()}
      >
        {commonLocale.batchOfflineLocale}
      </Button>
    ]
  }

  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'category/query',
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
    if (data) {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        ...data
      };
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
      }
    }
    this.refreshTable();
  }
  /**
   * 删除
   */
  onRemove = (record, callback) => {
    this.props.dispatch({
      type: 'category/remove',
      payload: {
        uuid: record.uuid,
        version: record.version
      },
      callback: callback ? callback : (response) => {
        if (response && response.success) {
          this.onSearch();
          message.success(commonLocale.removeSuccessLocale);
        }
      }
    });
  }
  /**
   * 显示商品类别级别管理界面
   */
  onShowLevelView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'category/onShowLevelView',
    });
  }
  // --- 批量导入相关 ---

  handleShowExcelImportPage = () => {
    this.props.dispatch({
      type: 'category/showPage',
      payload: {
        showPage: 'import',
      }
    });
  }

  fetchOperateProps = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record),
    }, {
      name: categoryLocale.createSubCategory,
      disabled: !havePermission(CATEGORY_RES.CREATE),
      onClick: this.onCreateSub.bind(this, record.code)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(CATEGORY_RES.EDIT),
      onClick: this.onCreate.bind(this, record.uuid)
    }];
  }

  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: commonLocale.ownerLocale,
      width: colWidth.codeNameColWidth,
      render: record => (
        <EllipsisCol colValue={convertCodeName(record.owner)} />
      )
    },
    {
      title: categoryLocale.level,
      dataIndex: 'level',
      width: colWidth.enumColWidth,
    },
    {
      title: categoryLocale.upperCategory,
      width: colWidth.codeNameColWidth,
      render: record => (
        record.upper.code ? <a onClick={this.onView.bind(this, record.upper)}><EllipsisCol colValue={convertCodeName(record.upper)} /></a> : <Empty />
      )
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      width: colWidth.enumColWidth,
      render: (text, record) => {
        confirm = record.state == basicState.ONLINE.name ? commonLocale.offlineLocale :
          commonLocale.onlineLocale;
        return loginOrg().type === 'COMPANY' ?
          <div>
            <IPopconfirm onConfirm={this.onChangeState.bind(this, record)}
              operate={confirm}
              disabled={!havePermission(CATEGORY_RES.ONLINE)} 
              object={categoryLocale.title}>
              <Switch disabled={!havePermission(CATEGORY_RES.ONLINE)} checked={record.state === basicState.ONLINE.name} size="small" />
            </IPopconfirm>
            &emsp; {getStateCaption(record.state)}
          </div> : <span>{getStateCaption(record.state)}</span>
      },
    },
    loginOrg().type === 'COMPANY' ?
      {
        title: commonLocale.operateLocale,
        width: colWidth.operateColWidth,

        render: record => (
          <OperateCol menus={this.fetchOperateProps(record)} />
        ),
      } : {}
  ];

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    const menus = [];
    if (loginOrg().type === 'COMPANY') {
      menus.push({
        disabled: !havePermission(CATEGORY_RES.CREATE),
        name: commonLocale.importLocale,
        onClick: this.handleShowExcelImportPage
      });
      menus.push({
        name: categoryLocale.levelTitle,
        onClick: this.onShowLevelView
      });
    }
    return loginOrg().type === 'COMPANY' ?
      <Fragment>
        <Button icon='plus' type='primary'
          onClick={() => this.onCreate(null)} disabled={!havePermission(CATEGORY_RES.CREATE)}>
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment> : null
  }

  onCreateSub = (code) => {
    this.props.dispatch({
      type: 'category/showPage',
      payload: {
        showPage: 'create',
        upperCode: code
      }
    });
  }
  /**
   * 查看详情
   * @param record
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'category/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }
  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'category/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  onChangeState = (record) => {
    if (record.state === basicState.ONLINE.name) {
      this.offline(record, false);
    } else {
      this.online(record, false);
    }
  }

  online = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'category/online',
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
  }

  offline = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'category/offline',
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

  onBatchOnline = () => {
    this.setState({
      batchAction: basicState.ONLINE.caption
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchOffline = () => {
    this.setState({
      batchAction: basicState.OFFLINE.caption
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
        if (batchAction === basicState.ONLINE.caption) {
          if (selectedRows[i].state === basicState.ONLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          } else {
            this.online(selectedRows[i], true).then(res => {
              bacth(i + 1)
            });
          }
        } else {
          if (selectedRows[i].state === basicState.OFFLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1)
          } else {
            that.offline(selectedRows[i], true).then(res => {
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
}
