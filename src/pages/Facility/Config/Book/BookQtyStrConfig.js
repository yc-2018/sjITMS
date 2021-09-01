import React, { Component } from 'react';
import { Divider, Button, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import BookQtyStrConfigCreateModal from './BookQtyStrConfigCreateModal';
import { bookConfigLocale } from './BookConfigLocale';
import BookQtyStrConfigSearchForm from './BookQtyStrConfigSearchForm';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { State } from '../../../In/Order/OrderContants';
@connect(({ receiveConfig, loading }) => ({
  receiveConfig,
  loading: loading.models.receiveConfig,
}))
export default class BookQtyStrConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: bookConfigLocale.bookQtyStrConfigTitle,
      data: this.props.receiveConfig.data?this.props.receiveConfig.data:{
        list:[]
      },
      suspendLoading:false,
      entity: {},
      createModalVisible: false,
      logCaption: 'ReceiveConfig'
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount = () => {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {

    if(nextProps.receiveConfig.data){
      this.setState({
        data: nextProps.receiveConfig.data
      });
    }
  }

  columns = [{
    title: bookConfigLocale.bookQtyStrConfigDockGroupCode,
    dataIndex: 'dockGroup.code',
    key: 'dockGroupCode',
    sorter:true,
    width: colWidth.codeColWidth,
    // render: text => <a href="javascript:;">{text}</a>,
  }, {
    title: bookConfigLocale.bookQtyStrConfigDockGroupName,
    dataIndex: 'dockGroup.name',
    sorter:true,
    width: colWidth.codeColWidth,
    key: 'dockGroupName',
  }, {
    title: bookConfigLocale.bookQtyStrConfigMaxReceiveQtyStr,
    dataIndex: 'maxReceiveQtyStr',
    key: 'maxReceiveQtyStr',
    sorter:true,
    width: itemColWidth.qtyStrColWidth,
  }, {
    title: bookConfigLocale.bookQtyStrConfigMaxReceiveArticleCount,
    dataIndex: 'maxReceiveArticleCount',
    key: 'maxReceiveArticleCount',
    sorter:true,
    width: itemColWidth.qtyStrColWidth,
  }, {
    title: bookConfigLocale.bookQtyStrConfigExceedRatio,
    dataIndex: 'exceedRatio',
    key: 'exceedRatio',
    sorter:true,
    width: itemColWidth.qtyStrColWidth,
    render: text => <span>{text * 100}%</span>
  }, {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'receiveConfig/query',
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
        dcUuid:loginOrg().uuid,
        owner: '',
        state: ''
      }
    }
    this.refreshTable();
  };

  renderOperateCol = (record) => {
    return <OperateCol menus={this.fetchOperatePropsOne(record)} />
  };

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.editLocale,
      onClick: this.handleCreateModalVisible.bind(this, true, record.uuid)
    }, {
      name: commonLocale.deleteLocale,
      confirm: true,
      confirmCaption: bookConfigLocale.bookQtyStrConfigTitle,
      onClick: this.handleRemove.bind(this, record, false)
    }];
  };

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

  fetchEntity = (uuid) => {
    this.props.dispatch({
      type: 'receiveConfig/get',
      payload: uuid,
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          if (data) {
            this.setState({
              entity: data,
            })
          }
        }
      }
    });
  }

  handleSaveOrModify = (fieldsValue) => {
    const { entity } = this.state;
    if(fieldsValue.maxReceiveQtyStr<=0){
      message.error(`最多可预约件数必须大于0！`);
      return false;
    }
    if(fieldsValue.maxReceiveArticleCount<=0){
      message.error(`最多可预品项数必须大于0！`);
      return false;
    }
    let params = {
      ...fieldsValue,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      dockUuid: JSON.parse(fieldsValue['dockGroup']).uuid,
      exceedRatio: fieldsValue['exceedRatio'] / 100,
    }

    delete params['dockGroup'];

    let type = 'receiveConfig/add';
    if (entity.uuid) {
      type = 'receiveConfig/modify';
      params['uuid'] = entity.uuid;
      params['version'] = entity.version;
    }

    this.props.dispatch({
      type: type,
      payload: params,
      callback: (response) => {
        if (response && response.success) {
          if (type === 'receiveConfig/add') {
            message.success(commonLocale.saveSuccessLocale);
          } else if (type === 'receiveConfig/modify') {
            message.success(commonLocale.modifySuccessLocale);
          }
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
      },
    })
  }

  handleRemove = (record, batch) => {
    const { dispatch } = this.props;
    let that =this;

    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'receiveConfig/remove',
        payload: { uuid: record.uuid },
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
          that.handleRemove(selectedRows[i], true).then(res=>{
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

  drawCreateModal = () => {
    const {
      entity,
      selectedRows,
      createModalVisible,
    } = this.state;

    const createModalProps = {
      entity: entity,
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleSaveOrModify: this.handleSaveOrModify,
      loading: this.props.loading,
    }

    return <BookQtyStrConfigCreateModal {...createModalProps} />
  }

  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<BookQtyStrConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
  }

  drawActionButton() {
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
}
