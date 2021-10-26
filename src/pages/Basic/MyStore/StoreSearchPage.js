import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Switch } from 'antd';
import StoreSearchForm from './StoreSearchForm';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import {orgType} from '@/utils/OrgType';
import SearchPage from '@/pages/Component/Page/SearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { STORE_RES } from './StorePermission';
import { storeLocale } from './StoreLocale';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { strSeparatorEllipsis } from '@/utils/utils';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
@connect((state) => {
  const { store, loading } = state;
  return {
    store,
    loading: loading.models.store,
  }
})
export default class StoreSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: storeLocale.title,
      data: props.store.data,
      suspendLoading: false,
      key: 'store.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    if (!this.state.pageFilter.searchKeyValues.state)
      this.state.pageFilter.searchKeyValues.state = '';
  }

  componentDidMount() {
    console.log("props", this.props);
    if(this.props.store.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.store.data
    });
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
      type: 'store/query',
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
        ...pageFilter.searchKeyValues,
        ...data
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        state: ''
      }
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
      type: 'store/showPage',
      payload: {
        ...payload
      }
    });
  }
  /**
   * 显示门店类型管理界面
   */
  onShowTypeView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'store/onShowTypeView',
    });
  }

  /**
   * 显示门店经营类型管理界面
   */
  onShowOperatingTypeView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'store/onShowOperatingTypeView',
    });
  }
  /***
   * 显示门店区域界面
   */
  onShowStoreAreaView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'store/onShowStoreAreaView',
    });
  }
  /**
   * 批量启用
   */
  onBatchOnline = () => {
    this.setState({
      batchAction: basicState.ONLINE.caption
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }
  /**
   * 批量禁用
   */
  onBatchOffline = () => {
    this.setState({
      batchAction: basicState.OFFLINE.caption
    });
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
  /**
   * 单一启用
   */
  online = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'store/online',
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
  /**
   * 单一禁用
   */
  offline = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'store/offline',
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
  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'store/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }
  /**
   * 修改状态
   */
  onChangeState = (record) => {
    if (record.state === basicState.ONLINE.name) {
      this.offline(record, false);
    } else {
      this.online(record, false);
    }
  }

  // --- 批量导入相关 ---

  handleShowExcelImportPage = () => {
    this.props.dispatch({
      type: 'store/showPage',
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
      onClick: this.onView.bind(this, record),
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(STORE_RES.EDIT),
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
      render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>,
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: storeLocale.shortName,
      dataIndex: 'shortName',
      width: colWidth.codeColWidth,
      render: val => <span>{val ? val : <Empty />}</span>
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owners',
      width: colWidth.sourceBillNumberColWidth,
      render: (text, record, index) => {
        let names = [];
        if (record.owners) {
          record.owners.map((item) => {
            names.push(item.owner.name);
          });
        }
        let maxVisibleCount = 3;
        let res = strSeparatorEllipsis(names, maxVisibleCount, '、', true);
        let items = res.items;
        let allItems = res.allItems;
        return items ? <EllipsisCol colValue={allItems} /> : <Empty />
      },
    },
    {
      title: storeLocale.storeType,
      dataIndex: 'storeType',
      width: colWidth.enumColWidth,
      render: text => <EllipsisCol colValue={text} />
    },
    {
      title: storeLocale.operatingType,
      dataIndex: 'operatingType',
      width: colWidth.enumColWidth,
      render: text => <EllipsisCol colValue={text} />
    },
    {
      title: commonLocale.sourceWayLocale,
      dataIndex: 'sourceWay',
      width: colWidth.enumColWidth,
      render: val => (
        <span>
          {getSourceWayCaption(val)}
        </span>
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
            <IPopconfirm onConfirm={this.onChangeState.bind(this, record)} operate={confirm}
              disabled={!havePermission(STORE_RES.ONLINE)}
              object={storeLocale.title}>
              <Switch checked={record.state === basicState.ONLINE.name} size="small" />
            </IPopconfirm>
            &emsp; {getStateCaption(record.state)}
          </div> : <span>{getStateCaption(record.state)}</span>
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
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    const menus = [];
    if (loginOrg().type === 'COMPANY') {
      menus.push({
        disabled: !havePermission(STORE_RES.CREATE),
        name: commonLocale.importLocale,
        onClick: this.handleShowExcelImportPage
      });
      menus.push({
        disabled: !havePermission(STORE_RES.CREATE),
        name: storeLocale.typeTitle,
        onClick: this.onShowTypeView
      });
      menus.push({
        disabled: !havePermission(STORE_RES.CREATE),
        name: storeLocale.operatingTypeTitle,
        onClick: this.onShowOperatingTypeView
      });
    }
    return loginOrg().type === 'COMPANY' ?
      <Fragment>
        <Button onClick={this.onCreate.bind(this, '')} type='primary' icon='plus'
          disabled={!havePermission(STORE_RES.CREATE)}>
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
      : loginOrg().type === orgType['dispatchCenter'].name?<Button onClick={this.onShowStoreAreaView} disabled={!havePermission(STORE_RES.CREATE)}>
      {'管理门店区域'}
    </Button>:null
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return loginOrg().type === 'COMPANY' ? [
      <Button key={commonLocale.batchOnlineLocale} disabled={!havePermission(STORE_RES.ONLINE)} onClick={() => this.onBatchOnline()}>
        {commonLocale.batchOnlineLocale}
      </Button>,
      <Button key={commonLocale.batchOfflineLocale} disabled={!havePermission(STORE_RES.ONLINE)} onClick={() => this.onBatchOffline()}>
        {commonLocale.batchOfflineLocale}
      </Button>
    ] : null;
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return <StoreSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
  }
}
