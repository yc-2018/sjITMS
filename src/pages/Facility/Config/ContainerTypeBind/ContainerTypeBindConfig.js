import { Divider, Button, message, Popconfirm, Table } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import StandardTable from '@/components/StandardTable';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import ContainerTypeBindConfigSearchForm from './ContainerTypeBindConfigSearchForm';
import ContainerTypeBindConfigCreateModal from './ContainerTypeBindConfigCreateModal';
import { containerTypeBindLocale } from './ContainerTypeBindLocale';
@connect(({ containerTypeBindConfig, loading }) => ({
  containerTypeBindConfig,
  loading: loading.models.containerTypeBindConfig,
}))
export default class ContainerTypeBindConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: containerTypeBindLocale.title,
      selectedRows: [],
      data: this.props.containerTypeBindConfig.data,
      suspendLoading:false,
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
      logCaption:'ContainerTypeBindConfig'
    };
  }

  columns = [{
    title: containerTypeBindLocale.containerTypeCode,
    dataIndex: 'containerType.code',
    key: 'containerTypeCode',
    sorter:true,
    width: colWidth.codeColWidth,

  }, {
    title: containerTypeBindLocale.containerTypeName,
    dataIndex: 'containerType.name',
    key: 'containerTypeName',
    sorter:true,
    width: colWidth.codeColWidth,
  }, {
    title: containerTypeBindLocale.parentContainerTypeCode,
    dataIndex: 'parentContainerType.code',
    key: 'parentContainerTypeCode',
    sorter:true,
    width: colWidth.codeColWidth,

  }, {
    title: containerTypeBindLocale.parentContainerTypeName,
    dataIndex: 'parentContainerType.name',
    key: 'parentContainerTypeName',
    sorter:true,
    width: colWidth.codeColWidth,
  }, {
    title: commonLocale.operateLocale,
    key: 'action',
    width: colWidth.operateColWidth,
    render: (text, record) => (
      <span>
        <IPopconfirm onConfirm={() => this.handleRemove( record.containerType.uuid, record.parentContainerType.uuid, null)}
                operate={commonLocale.deleteLocale}
                object={containerTypeBindLocale.title}>
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
      data: nextProps.containerTypeBindConfig.data
    });
  }

  refreshTable = () => {
    const { pageFilter } = this.state;
    this.props.dispatch({
      type: 'containerTypeBindConfig/query',
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
    return (<ContainerTypeBindConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} reset={this.reset} />);
  }


  /**
   *新增界面
   */
  drawCreateModal = () => {
    const {
      createModalVisible
    } = this.state;
    const createModalProps = {
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleSaveOrModify: this.handleSaveOrModify,
    }
    return (
      <ContainerTypeBindConfigCreateModal {...createModalProps} />
    );
  }

  /**
   *
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
    let bacth=(i)=>{
      if(i<selectedRows.length){
        if (batchAction === basicState.REMOVE.caption) {
          that.handleRemove(selectedRows[i].containerType.uuid, selectedRows[i].parentContainerType.uuid, true, selectedRows[i]).then(res=>{
            bacth(i+1)
          });
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
    let arr = [];
    fieldsValue['parentContainerType'].forEach(element => {
      arr.push(JSON.parse(element).uuid)
    });
    let params = {
      containerTypeUuid: JSON.parse(fieldsValue['containerType']).uuid,
      parentContainerTypeUuid: arr,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
    }

    let type = 'containerTypeBindConfig/add';
    this.props.dispatch({
      type: type,
      payload: params,
      callback: (response) => {
        if (response && response.success) {
          if (type === 'containerTypeBindConfig/add') {
            message.success(commonLocale.saveSuccessLocale);
          }
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
      },
    })
  }

  handleRemove = (containerTypeUuid, parentContainerTypeUuid, batch, record) => {
    const { dispatch } = this.props;
    let that =this;
    if (containerTypeUuid && parentContainerTypeUuid) {
      return new Promise(function (resolve, reject) {
        dispatch({
          type: 'containerTypeBindConfig/remove',
          payload: {
            containerTypeUuid: containerTypeUuid,
            parentContainerTypeUuid: parentContainerTypeUuid
          },
          callback: response => {
            if (batch) {
              that.batchCallback(response, record);
              resolve({ success: response.success });
              return;
            }

            if (response && response.success) {
              that.refreshTable();
              message.success(commonLocale.removeSuccessLocale);
            }
          }
        });
      });
    }
  }

}
