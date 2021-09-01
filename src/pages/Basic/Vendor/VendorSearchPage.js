import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Switch, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import VendorSearchForm from './VendorSearchForm';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { VENDOR_RES } from './VendorPermission';
import { vendorLocale } from './VendorLocale';
import { addressToStr, convertCodeName } from '@/utils/utils';
import { colWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';

@connect(({ vendor, loading }) => ({
  vendor,
  loading: loading.models.vendor,
}))
export default class VendorSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: vendorLocale.title,
      data: props.vendor.data,
      suspendLoading: false,
      key: 'vendor.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    if (!this.state.pageFilter.searchKeyValues.state)
      this.state.pageFilter.searchKeyValues.state = '';
  }

  componentDidMount() {
    if(this.props.vendor.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.vendor.data
    });
  }

  onCreate = () => {
    this.props.dispatch({
      type: 'vendor/showPage',
      payload: {
        showPage: 'create'
      }
    });
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'vendor/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onEdit = (record) => {
    this.props.dispatch({
      type: 'vendor/showPage',
      payload: {
        showPage: 'create',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 显示卸货方管理界面
   */
  onShowUnLoaderView = () => {
    let { dispatch } = this.props;
    dispatch({
      type: 'vendor/onShowUnLoaderView',
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
        type: 'vendor/enable',
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
        type: 'vendor/disable',
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

  onSearch = (data) => {
    const { pageFilter } = this.state;
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

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'vendor/query',
      payload: queryFilter,
    });
  };

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

  handleShowExcelImportPage = () => {
    this.props.dispatch({
      type: 'vendor/showPage',
      payload: {
        showPage: 'import',
      }
    });
  }

  drawActionButton = () => {
    const menus = [];
    if (loginOrg().type === 'COMPANY') {
      menus.push({
        disabled: !havePermission(VENDOR_RES.CREATE),
        name: commonLocale.importLocale,
        onClick: this.handleShowExcelImportPage
      });
      menus.push({
        disabled: !havePermission(VENDOR_RES.CREATE),
        name: vendorLocale.unLoaderTitle,
        onClick: this.onShowUnLoaderView
      });
    }
    return (
      loginOrg().type === 'COMPANY' && <Fragment>
        <Button icon="plus" disabled={!havePermission(VENDOR_RES.CREATE)} type="primary" onClick={this.onCreate}>
          {commonLocale.createLocale}
        </Button>
        <SearchMoreAction menus={menus}/>
      </Fragment>
    );
  }

  drawToolbarPanel() {
    return loginOrg().type === 'COMPANY' && [
      <Button key='onLine' disabled={!havePermission(VENDOR_RES.ONLINE)} onClick={() => this.onBatchOnline()}>
        {commonLocale.batchOnlineLocale}
      </Button>,
      <Button key='offLine' disabled={!havePermission(VENDOR_RES.ONLINE)} onClick={() => this.onBatchOffline()}>
        {commonLocale.batchOfflineLocale}
      </Button>
    ];
  }

  drawSearchPanel = () => {
    return <VendorSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDOR_RES.VIEW),
      onClick: this.onView.bind(this, record)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      disabled: !havePermission(VENDOR_RES.VIEW),
      onClick: this.onView.bind(this, record),
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(VENDOR_RES.EDIT),
      onClick: this.onEdit.bind(this, record)
    }];
  }

  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (text, record) => {
        return (
          <a onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      }
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: commonLocale.shortNameLocale,
      dataIndex: 'shortName',
      width: colWidth.codeColWidth,
      render: val => <span>{val ? val : <Empty />}</span>
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      width: colWidth.codeColWidth,
      render: val => <a onClick={this.onViewOwner.bind(this, val ? val.uuid : undefined)}
        disabled={!havePermission(OWNER_RES.VIEW)}><EllipsisCol colValue={convertCodeName(val)} /></a>
    },
    {
      title: formatMessage({ id: 'common.address' }),
      dataIndex: 'address',
      width: colWidth.sourceBillNumberColWidth,
      render: val => <EllipsisCol colValue={addressToStr(val)} />
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
        confirm = record.state === basicState.ONLINE.name ? commonLocale.offlineLocale : commonLocale.onlineLocale;
        return (loginOrg().type === 'COMPANY' ?
          <div>
            <IPopconfirm onConfirm={this.onChangeState.bind(this, record)}
              operate={confirm}
              disabled={!havePermission(VENDOR_RES.ONLINE)}
              object={vendorLocale.title}>
              <Switch disabled={!havePermission(VENDOR_RES.ONLINE)} checked={record.state === basicState.ONLINE.name} size="small" />
            </IPopconfirm>
            &emsp; {getStateCaption(record.state)}
          </div>
          : <span>{getStateCaption(record.state)}</span>
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
}
