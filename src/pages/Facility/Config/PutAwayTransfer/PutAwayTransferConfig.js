import { Divider, Button, message, Popconfirm, Table } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import PutAwayTransferConfigSearchForm from './PutAwayTransferConfigSearchForm';
import PutAwayTransferConfigCreateModal from './PutAwayTransferConfigCreateModal';
import { putAwayTransferLocale } from './PutAwayTransferLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
@connect(({ putAwayTransferConfig, loading }) => ({
  putAwayTransferConfig,
  loading: loading.models.putAwayTransferConfig,
}))
export default class PutAwayTransferConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: putAwayTransferLocale.title,
      selectedRows: [],
      data: this.props.putAwayTransferConfig.data,
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
      logCaption: 'PutAwayTransferConfig',
      suspendLoading:false
    };
  }

  columns = [{
    title: putAwayTransferLocale.binCode,
    dataIndex: 'binCode',
    key: 'binCode',
    sorter: true,
    width: colWidth.codeColWidth,
  }, {
    title: putAwayTransferLocale.binRange,
    dataIndex: 'binRange',
    key: 'binRange',
    sorter: true,
    width: itemColWidth.qpcStrColWidth,
  }, {
    title: commonLocale.operateLocale,
    key: 'action',
    width: colWidth.operateColWidth,
    render: (text, record) => (
      <span>
        <a href="javascript:;" onClick={this.handleCreateModalVisible.bind(this, true, record.uuid)}>
          {commonLocale.editLocale}
        </a>
        <Divider type="vertical" />
        <IPopconfirm onConfirm={() => this.handleRemove(record.dcUuid, record.binCode, null)}
          operate={commonLocale.deleteLocale}
          object={putAwayTransferLocale.title}>
          <a>{commonLocale.deleteLocale}</a>
        </IPopconfirm>
      </span>
    ),
  }];



  componentDidMount = () => {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.putAwayTransferConfig.data
    });
  }

  refreshTable = () => {
    const { pageFilter } = this.state;
    this.props.dispatch({
      type: 'putAwayTransferConfig/query',
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
          onClick={() => this.handleCreateModalVisible(true)}
        >
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<PutAwayTransferConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} reset={this.reset} />);
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
      handleSaveOrModify: this.handleSaveOrModify,
      entity: entity,
    }
    return (
      <PutAwayTransferConfigCreateModal {...createModalProps} />
    );
  }

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
          that.handleRemove(selectedRows[i].dcUuid, selectedRows[i].binCode, true).then(res => {
            bacth(i + 1);
          })
        }
      }else{
        this.setState({
          suspendLoading:false
        })
      }
    }
    bacth(0);
  }

  fetchEntity = uuid => {
    const { dispatch } = this.props;
    const type = 'putAwayTransferConfig/get';
    dispatch({
      type: type,
      payload: uuid,
      callback: response => {
        this.setState({
          entity: response.data
        });
      }
    });
  }

  handleCreateModalVisible = (flag, uuid) => {
    if (flag && uuid) {
      this.fetchEntity(uuid);
    } else if (!uuid) {
      this.setState({
        entity: {},
      })
    }

    this.setState({
      createModalVisible: !!flag,
    })
  }

  handleSaveOrModify = (fieldsValue) => {
    let { entity } = this.state;
    let params = {
      ...fieldsValue,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      version: entity ? entity.version : 0,
    }
    let type = 'putAwayTransferConfig/saveOrUpdate';
    this.props.dispatch({
      type: type,
      payload: params,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
      },
    })
  }

  handleRemove = (dcUuid, binCode, batch) => {
    if (dcUuid && binCode) {
      let that = this;
      return new Promise(function (resolve, reject) {
        that.props.dispatch({
          type: 'putAwayTransferConfig/remove',
          payload: {
            dcUuid: dcUuid,
            binCode: binCode
          },
          callback: (response) => {
            if (batch) {
              that.batchCallback(response, binCode);
              resolve({ success: response.success });
              return;
            }
            if (response && response.success) {
              that.refreshTable();
              message.success(commonLocale.removeSuccessLocale);
            }
          }
        })
      })
    }
  }
}
