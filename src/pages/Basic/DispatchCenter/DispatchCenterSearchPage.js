import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Switch, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import DispatchCenterSearchForm from './DispatchCenterSearchForm';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { DISPATCHCENTER_RES } from './DispatchCenterPermission';
import { dispatchCenterLocale } from './DispatchCenterLocale';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';

@connect(({ dispatchCenter, loading }) => ({
  dispatchCenter,
  loading: loading.models.dispatchCenter,
}))
export default class DispatchCenterSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: dispatchCenterLocale.title,
      data: props.dispatchCenter.data ? props.dispatchCenter.data : { list: [] },
      suspendLoading: false,
      key: 'dispatchCenter.search.table',
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    if (!this.state.pageFilter.searchKeyValues.state)
      this.state.pageFilter.searchKeyValues.state = '';
  }
  componentDidMount() {
    this.refreshTable();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.dispatchCenter.data) {
      this.setState({
        data: nextProps.dispatchCenter.data,
      });
    }
  }
  onCreate = record => {
    const payload = {
      showPage: 'create',
    };
    if (record && record.uuid != '') {
      payload.entityUuid = record.uuid;
    }
    this.props.dispatch({
      type: 'dispatchCenter/showPage',
      payload: {
        ...payload,
      },
    });
  };
  onView = record => {
    this.props.dispatch({
      type: 'dispatchCenter/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid,
      },
    });
  };

  onChangeState = record => {
    if (record.state === basicState.ONLINE.name) {
      this.offline(record, false);
    } else {
      this.online(record, false);
    }
  };
  online = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function(resolve, reject) {
      dispatch({
        type: 'dispatchCenter/online',
        payload: {
          uuid: record.uuid,
          version: record.version,
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
        },
      });
    });
  };
  offline = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function(resolve, reject) {
      dispatch({
        type: 'dispatchCenter/offline',
        payload: {
          uuid: record.uuid,
          version: record.version,
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
        },
      });
    });
  };
  onSearch = data => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
      };
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        state: '',
      };
    }
    this.refreshTable();
  };
  refreshTable = filter => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'dispatchCenter/query',
      payload: queryFilter,
    });
  };
  onBatchOnline = () => {
    this.setState({
      batchAction: basicState.ONLINE.caption,
    });
    this.handleBatchProcessConfirmModalVisible(true);
  };
  onBatchOffline = () => {
    this.setState({
      batchAction: basicState.OFFLINE.caption,
    });
    this.handleBatchProcessConfirmModalVisible(true);
  };
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true,
    });
    const { selectedRows, batchAction } = this.state;
    const that = this;
    let bacth = i => {
      if (i < selectedRows.length) {
        if (batchAction === basicState.ONLINE.caption) {
          if (selectedRows[i].state === basicState.ONLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          } else {
            this.online(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          }
        } else {
          if (selectedRows[i].state === basicState.OFFLINE.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          } else {
            that.offline(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          }
        }
      } else {
        this.setState({
          suspendLoading: false,
        });
      }
    };
    bacth(0);
  };
  drawActionButton = () => {
    return (
      <Fragment>
        <Button
          icon="plus"
          disabled={!havePermission(DISPATCHCENTER_RES.CREATE)}
          type="primary"
          onClick={this.onCreate}
        >
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  };
  drawToolbarPanel() {
    return [
      <Button
        key="onLine"
        disabled={!havePermission(DISPATCHCENTER_RES.ONLINE)}
        onClick={() => this.onBatchOnline()}
      >
        {commonLocale.batchOnlineLocale}
      </Button>,
      <Button
        key="offLine"
        disabled={!havePermission(DISPATCHCENTER_RES.ONLINE)}
        onClick={() => this.onBatchOffline()}
      >
        {commonLocale.batchOfflineLocale}
      </Button>,
    ];
  }
  drawSearchPanel = () => {
    return (
      <DispatchCenterSearchForm
        filterValue={this.state.pageFilter.searchKeyValues}
        refresh={this.onSearch}
      />
    );
  };

  fetchOperateProps = record => {
    return [
      {
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record),
      },
      {
        name: commonLocale.editLocale,
        disabled: !havePermission(DISPATCHCENTER_RES.CREATE),
        onClick: this.onCreate.bind(this, record),
      },
    ];
  };

  columns = [
    {
      title: commonLocale.codeLocale,
      dataIndex: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (text, record) => {
        return <a onClick={() => this.onView(record)}>{text}</a>;
      },
    },
    {
      title: commonLocale.nameLocale,
      dataIndex: 'name',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: commonLocale.sourceWayLocale,
      dataIndex: 'sourceWay',
      width: colWidth.enumColWidth,
      render: val => <span>{getSourceWayCaption(val)}</span>,
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      render: (text, record) => {
        confirm =
          record.state === basicState.ONLINE.name
            ? commonLocale.offlineLocale
            : commonLocale.onlineLocale;
        return (
          <div>
            <IPopconfirm
              onConfirm={this.onChangeState.bind(this, record)}
              operate={confirm}
              disabled={!havePermission(DISPATCHCENTER_RES.ONLINE)}
              object={dispatchCenterLocale.title}
            >
              <Switch
                disabled={!havePermission(DISPATCHCENTER_RES.ONLINE)}
                checked={record.state === basicState.ONLINE.name}
                size="small"
              />
            </IPopconfirm>
            &emsp; {getStateCaption(record.state)}
          </div>
        );
      },
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => <OperateCol menus={this.fetchOperateProps(record)} />,
    },
  ];
}
