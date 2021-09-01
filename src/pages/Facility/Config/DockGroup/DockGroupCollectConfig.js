import { Button, message } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState } from '@/utils/BasicState';
import { dockGroupConfigLocale } from './DockGroupConfigLocale';
import { colWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { CONFIG_RES } from '../ConfigPermission';
import Empty from '@/pages/Component/Form/Empty';

import DockGroupCollectBinCreateModal from '@/pages/Facility/Config/DockGroup/DockGroupCollectBinCreateModal';
import DockGroupCollectBinSearchForm from '@/pages/Facility/Config/DockGroup/DockGroupCollectBinSearchForm';

@connect(({ dockGroupCollectConfig, loading }) => ({
  dockGroupCollectConfig,
  loading: loading.models.dockGroupConfig,
}))
export default class DockGroupCollectConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: '码头集集货位配置',
      selectedRows: [],
      data: this.props.dockGroupCollectConfig.data,
      addCollectBinModalVisible: false,
      entity: {},
      hideLogTab: true,
      suspendLoading: false,
      key: 'dockGroupCollectBinConfig.search.table',
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount = () => {
    this.refreshTable();
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dockGroupCollectConfig.data,
    });
  }

  refreshTable = (filter) => {
    const { pageFilter } = this.state;
    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }
    this.props.dispatch({
      type: 'dockGroupCollectConfig/queryCollectBinPage',
      payload: pageFilter,
      // callback: (response) => {
      //   if (response && response.success) {
      //     this.setState({
      //       data: response.data
      //     })
      //   }
      // }
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
      };
    }
    pageFilter.page = 0;
    pageFilter.pageSize = 20;

    this.refreshTable();
  };

  reset = () => {
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    };
    pageFilter.page = 0;
    pageFilter.pageSize = 20;
    this.refreshTable();
  };

  onCancel = () => {
    this.props.dispatch({
      type: 'dcConfig/chooseMenu',
      payload: {
        openKeys: ['outConfig'],
        selectedKeys: ['dockGroupConfig'],
      },
    });
  }

  // 新增按钮
  drawActionButton = () => {
    return (
      <Fragment>
        <Button onClick={this.onCancel}>
          {commonLocale.backLocale}
        </Button>
        <Button type='primary' icon="plus"
                onClick={() => this.handleAddCollectBinModalVisible(true)}
        >
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  };

  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (
      <DockGroupCollectBinSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch}
                                     reset={this.reset}/>);
  };

  /**
   *新增界面
   */
  drawCreateModal = () => {
    const { addCollectBinModalVisible } = this.state;
    const addCollectBinModalProps = {
      modalVisible: addCollectBinModalVisible,
      handleCreateModalVisible: this.handleAddCollectBinModalVisible,
      handleSave: this.handleSaveCollectBin,
    };
    return [
      <DockGroupCollectBinCreateModal {...addCollectBinModalProps} />,
    ];
  };

  /**
   * 批量删除
   */
  drawToolbarPanel() {
    return (
      <Fragment>
        <Button
          onClick={() => this.onBatchRemove()}
        >
          {commonLocale.batchRemoveLocale}
        </Button>
      </Fragment>
    );
  }

  onBatchRemove = () => {
    this.setState({
      batchAction: basicState.REMOVE.caption,
    });
    this.handleBatchProcessConfirmModalVisible(true);
  };

  onBatchProcess = () => {
    this.setState({
      suspendLoading: true,
    });
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === basicState.REMOVE.caption) {
          that.handleRemove(selectedRows[i], true).then(res => {
            bacth(i + 1);
          });
        } else {
          that.refs.batchHandle.calculateTaskSkipped();
          bacth(i + 1);
        }
      } else {
        this.setState({
          suspendLoading: false,
        });
      }
    };
    bacth(0);
  };

  handleAddCollectBinModalVisible = (flag, uuid) => {
    this.setState({
      addCollectBinModalVisible: !!flag,
    });
  };

  handleSaveCollectBin = (fieldsValue) => {
    let params = {
      ...fieldsValue,
      dockGroup: JSON.parse(fieldsValue.dockGroup),
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    };
    this.props.dispatch({
      type: 'dockGroupCollectConfig/saveCollectBinRange',
      payload: params,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.handleAddCollectBinModalVisible(false);
          this.refreshTable();
        }
      },
    });
  };

  handleRemove = (record, batch) => {
    const that = this;
    return new Promise(function(resolve, reject) {
      that.props.dispatch({
        type: 'dockGroupCollectConfig/removeDockConfigCollectBinRange',
        payload: {
          uuid: record.uuid
        },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.removeSuccessLocale);
          }
        },
      });
    });
  };

  columns = [{
    title: dockGroupConfigLocale.dockGroup,
    dataIndex: 'dockGroup',
    key: 'dockGroup',
    width: colWidth.codeNameColWidth,
    render: record => <EllipsisCol colValue={convertCodeName(record)}/>,
  }, {
    title: dockGroupConfigLocale.collectBinRange,
    dataIndex: 'collectBinRange',
    key: 'collectBinRange',
    width: colWidth.fixColWidth,
    render: val => val ? <EllipsisCol colValue={val}/> : <Empty/>,
  }, {
    title: commonLocale.operateLocale,
    key: 'action',
    width: colWidth.operateColWidth,
    render: (text, record) => (
      <span>
          <IPopconfirm onConfirm={() => this.handleRemove(record, false)}
                       operate={commonLocale.deleteLocale}
                       object={dockGroupConfigLocale.collectBintitle}>
            <a>{commonLocale.deleteLocale}</a>
          </IPopconfirm>
        </span>
    ),
  }];
}
