import { Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Menu, Dropdown, Button, Popconfirm, Switch, Divider, message } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { domRender } from '@/utils/utils';
import { STATUS, STATE } from '@/utils/constants';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { colWidth } from '@/utils/ColWidth';
import { basicState, getStateCaption } from '@/utils/BasicState';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import SearchPanel from '@/components/MyComponent/SearchPanel';
import ToolbarPanel from '@/components/MyComponent/ToolbarPanel';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import Empty from '@/pages/Component/Form/Empty';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { WRH_RES } from './WrhPermission';
import WrhSearchForm from './WrhSearchForm';
import { WrhLocale } from './WrhLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';

@connect(({ wrh, loading }) => ({
  wrh,
  loading: loading.models.wrh,
}))
export default class WrhSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: `${formatMessage({ id: 'wrh.title' })}`,
      data: this.props.wrh.data,
      suspendLoading: false,
      key: 'wrh.search.table'
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    if (loginOrg().type && loginOrg().type === 'DC')
      this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    if (!this.state.pageFilter.searchKeyValues.state)
      this.state.pageFilter.searchKeyValues.state = '';
    this.state.pageFilter.sortFields = {
      dcCode: false,
      code: false,
    }
  }

  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.wrh.data
    });
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
    }
    if (loginOrg().type && loginOrg().type === 'DC')
      this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'wrh/query',
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
    }
    this.refreshTable();
  }

  onCreate = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'wrh/showPage',
      payload: {
        showPage: 'create'
      }
    });
  }

  columns = [
    {
      title: formatMessage({ id: 'wrh.index.table.column.code' }),
      dataIndex: 'code',
      key: 'code',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (text, record) => {
        return (
          <a onClick={() => this.onView(record)}>
            <EllipsisCol colValue={text} />
          </a>
        );
      }
    },
    {
      title: formatMessage({ id: 'wrh.index.table.column.name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      width: colWidth.nameColWidth,
      render: record => <EllipsisCol colValue={record} />
    },
    {
      title: formatMessage({ id: 'wrh.index.table.column.dc' }),
      dataIndex: 'dc',
      key: 'dc',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: text => (text == null ? <Empty /> : <EllipsisCol colValue={convertCodeName(text)} />)
    },
    {
      title: formatMessage({ id: 'wrh.index.table.column.sourceWrhCode' }),
      dataIndex: 'sourceWrhCode',
      key: 'sourceWrhCode',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (text) => (text ? text : <Empty />)
    },
    {
      title: formatMessage({ id: 'wrh.index.table.column.sourceWrhName' }),
      dataIndex: 'sourceWrhName',
      key: 'sourceWrhName',
      sorter: true,
      width: colWidth.nameColWidth,
      render: (text) => (text ? text : <Empty />)
    },
    {
      title: formatMessage({ id: 'company.index.table.column.status' }),
      dataIndex: 'state',
      key: 'state',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (text, record) => {
        confirm = record.state === basicState.ONLINE.name ? commonLocale.offlineLocale : commonLocale.onlineLocale;
        return (
          <div>
            <IPopconfirm onConfirm={this.changeState.bind(this, record)}
                         operate={confirm}
                         disabled={loginOrg().type !== 'COMPANY' || !havePermission(WRH_RES.ONLINE)}
                         object={WrhLocale.title}
            >
              <Switch
                disabled={loginOrg().type !== 'COMPANY' || !havePermission(WRH_RES.ONLINE)}
                checked={record.state === basicState.ONLINE.name}
                size="small" />
            </IPopconfirm>
            &emsp; {getStateCaption(record.state)}
          </div>
        )
      },
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      key: 'action',
      render: record => (this.fetchOperateProps(record)),
    },
  ];

  fetchOperateProps = (record) => {
    if (loginOrg().type === 'COMPANY')
      return <OperateCol menus={this.fetchOperateOne(record)} />;
    else
      return <OperateCol menus={this.fetchOperateTow(record)} />;
  }

  fetchOperateOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record),
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(WRH_RES.CREATE),
      onClick: this.onEdit.bind(this, record)
    }];
  }

  fetchOperateTow = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record),
    }];
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'wrh/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onEdit = (record) => {
    this.props.dispatch({
      type: 'wrh/showPage',
      payload: {
        showPage: 'create',
        entity: record,
        entityUuid: record.uuid
      }
    });
  }

  changeState = (record) => {
    if (record.state === basicState.ONLINE.name)
      this.offline(record, false);
    else
      this.online(record, false);
  }

  drawActionButton() {
    return (
      loginOrg().type === 'COMPANY' &&
      <Fragment>
        <Button onClick={this.onCreate} icon="plus" type="primary">
          {formatMessage({ id: 'common.button.new' })}</Button>
      </Fragment>
    );
  }

  drawSearchPanel() {
    const { pageFilter } = this.state;
    return (<WrhSearchForm toggleCallback={this.toggleCallback} filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
  }

  drawToolbarPanel() {
    return loginOrg().type === 'COMPANY' && [
      <Button key="onLine"
              disabled={!havePermission(WRH_RES.ONLINE)}
              onClick={() => this.onBatchOnline()}>
        {commonLocale.batchOnlineLocale}
      </Button>,
      <Button key="offLine"
              disabled={!havePermission(WRH_RES.ONLINE)}
              onClick={() => this.onBatchOffline()}>
        {commonLocale.batchOfflineLocale}
      </Button>
    ]
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


  online = (record, batch) => {
    const { dispatch } = this.props;
    let that = this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'wrh/enable',
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
        type: 'wrh/disable',
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
}
