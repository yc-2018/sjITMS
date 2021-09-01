import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, Popconfirm, Switch, Divider, message, Dropdown,Menu } from 'antd';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import OwnerSearchForm from './OwnerSearchForm';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { OWNER_RES } from './OwnerPermission';
import { ownerLocale } from './OwnerLocale';
import { colWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import Empty from '@/pages/Component/Form/Empty';
import { importTemplateType } from '@/utils/ImportTemplateType';

@connect(({ owner, loading }) => ({
  owner,
  loading: loading.models.owner,
}))
export default class OwnerSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: ownerLocale.title,
      data: props.owner.data,
      suspendLoading: false,
      key: 'owner.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    if (!this.state.pageFilter.searchKeyValues.state)
      this.state.pageFilter.searchKeyValues.state = '';
  }

  componentDidMount() {
    if(this.props.owner.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.owner.data
    });
  }

  onCreate = () => {
    this.props.dispatch({
      type: 'owner/showPage',
      payload: {
        showPage: 'create'
      }
    });
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'owner/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onEdit = (record) => {
    this.props.dispatch({
      type: 'owner/showPage',
      payload: {
        showPage: 'create',
        entityUuid: record.uuid
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
        type: 'owner/onLine',
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
        type: 'owner/offLine',
        payload: record,
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
      type: 'owner/query',
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


  menu = (
    <Menu>
      <Menu.Item>
        <a 
        // disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)}
          onClick={() => this.handleShowExcelImportPage(importTemplateType.OWNERSTORE.name)}>
          {'导入货主门店对应关系'}
        </a>
      </Menu.Item>
      <Menu.Item>
        <a 
        // disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)}
          onClick={() => this.handleShowExcelImportPage(importTemplateType.OWNERVENDOR.name)}>
          {'导入货主供应商对应关系'}
        </a>
      </Menu.Item>
    </Menu>
  );

  drawActionButton = () => {
    return (
      loginOrg().type === 'COMPANY' && <Fragment>
          <div>
            <Dropdown overlay={this.menu} placement="bottomCenter">
              <Button 
              // disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_CREATE)} 
              icon="down">
                {commonLocale.importLocale}
              </Button>
            </Dropdown>
            <Button icon="plus" disabled={!havePermission(OWNER_RES.CREATE)} type="primary" onClick={this.onCreate}>
              {commonLocale.createLocale}
            </Button>
          </div>
      </Fragment>

      
    );
  }

  drawToolbarPanel() {
    return loginOrg().type === 'COMPANY' && [
      <Button key='onLine' disabled={!havePermission(OWNER_RES.ONLINE)} onClick={() => this.onBatchOnline()}>
        {commonLocale.batchOnlineLocale}
      </Button>,
      <Button key='offLine' disabled={!havePermission(OWNER_RES.ONLINE)} onClick={() => this.onBatchOffline()}>
        {commonLocale.batchOfflineLocale}
      </Button>
    ];
  }

  drawSearchPanel = () => {
    return <OwnerSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
  }



  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(OWNER_RES.CREATE),
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
      render: val => val ? val : <Empty />
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
      render: (text, record) => {
        confirm = record.state === basicState.ONLINE.name ? commonLocale.offlineLocale : commonLocale.onlineLocale;
        return (loginOrg().type === 'COMPANY' && record.def === false ?
          <div>
            <IPopconfirm onConfirm={this.onChangeState.bind(this, record)}
              disabled={!havePermission(OWNER_RES.ONLINE)}
              operate={confirm}
              object={ownerLocale.title}>
              <Switch checked={record.state === basicState.ONLINE.name} size="small" />
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
        loginOrg().type === 'COMPANY' && record.def === false ?
          <OperateCol menus={this.fetchOperatePropsOne(record)} />
          :
          <OperateCol menus={this.fetchOperatePropsTwo(record)} />
      ),
    },
  ];

    // --- 批量导入相关 ---

    handleShowExcelImportPage = (type) => {
      this.props.dispatch({
        type: 'owner/showPage',
        payload: {
          showPage: 'import',
          importType: type
        }
      });
    }
}
