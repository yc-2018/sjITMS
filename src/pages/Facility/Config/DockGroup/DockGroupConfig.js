import { Divider, Button, message, Popconfirm, Table } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import DockGroupConfigSearchForm from './DockGroupConfigSearchForm';
import DockGroupConfigCreateModal from './DockGroupConfigCreateModal';
import { dockGroupConfigLocale } from './DockGroupConfigLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { LogisticMode } from './DockGroupContants';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import DockGroupCollectBinCreateModal from '@/pages/Facility/Config/DockGroup/DockGroupCollectBinCreateModal';
import Empty from '@/pages/Component/Form/Empty';

@connect(({ dockGroupConfig, loading }) => ({
  dockGroupConfig,
  loading: loading.models.dockGroupConfig,
}))
export default class DockGroupConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: dockGroupConfigLocale.title,
      selectedRows: [],
      data: this.props.dockGroupConfig.data,
      createModalVisible: false,
      entity: {},
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {},
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
        likeKeyValues: {},
      },
      logCaption: 'DockGroupConfig',
      suspendLoading:false,
    };
  }

  columns = [{
    title: dockGroupConfigLocale.logisticsType,
    dataIndex: 'logisticsType',
    key: 'logisticsType',
    sorter: true,
    width: itemColWidth.qpcStrColWidth,
    render: (val) => {
      return val ? LogisticMode[val].caption : <Empty />;
    }
  }, {
    title: dockGroupConfigLocale.pickarea,
    dataIndex: 'pickareaCode',
    key: 'pickarea',
    sorter: true,
    width: itemColWidth.qpcStrColWidth,
    render: (val, record) => {
      return <EllipsisCol colValue={convertCodeName(record.pickarea)} />;
    }
  }, {
    title: dockGroupConfigLocale.sourceRange,
    dataIndex: 'sourceRange',
    key: 'sourceRange',
    sorter: true,
    width: itemColWidth.qpcStrColWidth,
    render: (val) => {
      return val ? <EllipsisCol colValue={val} /> : <Empty />;
    }
  }, {
    title: dockGroupConfigLocale.dockGroup,
    dataIndex: 'dockGroup',
    key: 'dockGroup',
    sorter: true,
    width: colWidth.codeColWidth,
    render: record => <EllipsisCol colValue={convertCodeName(record)} />
  }, {
    title: dockGroupConfigLocale.collectBinRange,
    dataIndex: 'collectBinRange',
    key: 'collectBinRange',
    sorter: true,
    width: itemColWidth.qpcStrColWidth,
    render:val=>val? <EllipsisCol colValue={val} /> :<Empty/>
  }];

  componentDidMount = () => {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dockGroupConfig.data
    });
  }

  refreshTable = () => {
    const { pageFilter } = this.state;
    this.props.dispatch({
      type: 'dockGroupConfig/query',
      payload: pageFilter
    })
  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data
      }
    }
    this.refreshTable();
  }

  reset = () => {
    const { pageFilter } = this.state;
    pageFilter.searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid

    }
    this.refreshTable();
  }

  //新增按钮
  drawActionButton = () => {
    return (
      <Fragment>
        <Button type='primary' icon="plus"
                onClick={() => this.jumpToCollectConfig()}
                // disabled={true}
        >
          {'码头集配置'}
        </Button>
        <Button type='primary' icon="plus"
          onClick={() => this.handleCreateModalVisible(true)}
        >
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<DockGroupConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} reset={this.reset} />);
  }


  /**
   *新增界面
   */
  drawCreateModal = () => {
    const {
      createModalVisible,
      entity
    } = this.state;
    const createModalProps = {
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleSave: this.handleSave,
      entity: entity,
    }
    const { addCollectBinModalVisible } = this.state;
    const addCollectBinModalProps = {
      modalVisible: addCollectBinModalVisible,
      handleCreateModalVisible: this.handleAddCollectBinModalVisible,
      handleSave: this.handleSaveCollectBin,
    };
    return [
      <DockGroupConfigCreateModal {...createModalProps} />,
      <DockGroupCollectBinCreateModal {...addCollectBinModalProps} />
    ];
  };

  /**
   *批量删除
   */
  drawToolbarPanel() {
    return (
      <Fragment>
        <Button
          onClick={() =>
            this.onBatchRemove()
          }
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
  }

  onBatchProcess = () => {
    this.setState({
      suspendLoading:true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === basicState.REMOVE.caption) {
          that.handleRemove(selectedRows[i],true).then(res => {
            bacth(i + 1);
          })
        } else {
          that.refs.batchHandle.calculateTaskSkipped();
          bacth(i + 1);
        }
      }else{
        this.setState({
          suspendLoading:false
        })
      }
    }
    bacth(0);
  }


  handleCreateModalVisible = (flag, uuid) => {
    this.setState({
      createModalVisible: !!flag,
    })
  }

  handleAddCollectBinModalVisible = (flag, uuid) => {
    this.setState({
      addCollectBinModalVisible: !!flag,
    });
  };

  jumpToCollectConfig = () => {
    this.props.dispatch({
      type: 'dcConfig/chooseMenu',
      payload: {
        openKeys: ['outConfig'],
        selectedKeys: ['dockGroupCollectConfig'],
      },
    });
  };

  handleSave = (fieldsValue) => {
    let { entity } = this.state;
    let pickAreas = [];
    if (fieldsValue.pickarea != undefined) {
      pickAreas = fieldsValue.pickarea.map((val) => {
        let obj = JSON.parse(val);
        return obj;
      })
    }
    let params = {
      ...fieldsValue,
      dockGroup: JSON.parse(fieldsValue.dockGroup),
      pickarea: pickAreas,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      version: entity ? entity.version : 0,
    }
    let type = 'dockGroupConfig/save';
    let that = this;

    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: type,
        payload: params,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            that.handleCreateModalVisible(false);
            resolve({ success: response.success });
            that.refreshTable();
          }else{
            reject({ success: response.success });
          }
        },
      })
    })
  }

  handleSaveCollectBin = (fieldsValue) => {
    let params = {
      ...fieldsValue,
      dockGroup: JSON.parse(fieldsValue.dockGroup),
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    };
    this.props.dispatch({
      type: 'dockGroupConfig/saveCollectBin',
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
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'dockGroupConfig/remove',
        payload: {
          uuid: record.uuid,
          version: 0,
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

}
