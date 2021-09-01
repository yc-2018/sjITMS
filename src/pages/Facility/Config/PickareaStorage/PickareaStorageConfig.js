import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Popconfirm, Icon, Divider, message } from 'antd';
import { formatMessage } from 'umi/locale';
import StandardTable from '@/components/StandardTable';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import SearchPanel from '@/components/MyComponent/SearchPanel';
import Page from '@/components/MyComponent/Page';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import { pickareaStorageConfigLocale } from './PickareaStorageConfigLocale';
import PickareaStorageConfigSearchForm from './PickareaStorageConfigSearchForm';
import PickareaStorageConfigCreateModal from './PickareaStorageConfigCreateModal';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { PICKAREA_RES } from '@/pages/Facility/PickArea/PickAreaPermission';
import { routerRedux } from 'dva/router';

@connect(({ pickareaStorageConfig, loading }) => ({
  pickareaStorageConfig,
  loading: loading.models.pickareaStorageConfig,
}))
@Form.create()
export default class PickareaStorageConfig extends ConfigSearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: pickareaStorageConfigLocale.pickareaStorageConfigTitle,
      data: this.props.pickareaStorageConfig.data,
      entity: {},
      createModalVisible: false,
      logCaption: 'PickareaStorageConfig',
      suspendLoading: false,
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {};
  }

  /**
   * 跳转到拣货分区详情页面
   */
  onPickareaView = (pickArea) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/pickArea',
      payload: {
        showPage: 'view',
        entityUuid: pickArea? pickArea.uuid : undefined
      }
    }));
  }



columns = [
  {
    title: pickareaStorageConfigLocale.pickareaStorageConfigPickarea,
    key: 'pickarea',
    dataIndex: 'pickareaCode',
    sorter: true,
    width: colWidth.codeNameColWidth,
    render: (val, record) => <a onClick={this.onPickareaView.bind(this, record.pickarea)}
      disabled={!havePermission(PICKAREA_RES.VIEW)}><EllipsisCol colValue={convertCodeName(record.pickarea)} /></a>
  },
  {
    title: pickareaStorageConfigLocale.pickareaStorageConfigBinRange,
    dataIndex: 'binRange',
    sorter: true,
    width: itemColWidth.qpcStrColWidth + 100,
    render: val => <EllipsisCol colValue={val} />
  }, {
    title: commonLocale.operateLocale,
    key: 'action',
    width: colWidth.operateColWidth,
    render: (text, record) => (
      <span>
        <a href="javascript:;" onClick={this.handleCreateModalVisible.bind(this, true, record.pickarea.uuid)}>
          {commonLocale.editLocale}
        </a>
        <Divider type="vertical" />
        <IPopconfirm onConfirm={() => this.handleRemove(record.uuid, null)}
          operate={commonLocale.deleteLocale}
          object={pickareaStorageConfigLocale.pickareaStorageConfigTitle}>
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
    data: nextProps.pickareaStorageConfig.data
  });
}

refreshTable = (filter) => {
  const { dispatch } = this.props;
  const { pageFilter } = this.state;

  let queryFilter = { ...pageFilter };
  if (filter) {
    let sortFields = filter.sortFields;
    if (sortFields) {
      if (sortFields.hasOwnProperty('pickarea.code')) {
        filter.sortFields['pickareaCode'] = sortFields['pickarea.code'];
        delete sortFields['pickarea.code'];
      }
      if (sortFields.hasOwnProperty('pickarea.name')) {
        filter.sortFields['pickareaName'] = sortFields['pickarea.name'];
        delete sortFields['pickarea.name'];
      }
    }

    queryFilter = { ...pageFilter, ...filter };
  }

  dispatch({
    type: 'pickareaStorageConfig/query',
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
      dcUuid: loginOrg().uuid,
    }
  }
  this.refreshTable();
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

fetchEntity = (uuid) => {
  this.props.dispatch({
    type: 'pickareaStorageConfig/getByDCUuidAndPickareaUuid',
    payload: {
      pickareaUuid: uuid,
      dcUuid: loginOrg().uuid
    },
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

// handleSave = (fieldsValue) => {
//   const { entity } = this.state;
//
//   let params = {
//     ...fieldsValue,
//     companyUuid: loginCompany().uuid,
//     dcUuid: loginOrg().uuid,
//     pickareaCode: JSON.parse(fieldsValue['pickarea']).code,
//   }
//
//   let type = 'pickareaStorageConfig/save';
//
//   this.props.dispatch({
//     type: type,
//     payload: params,
//     callback: (response) => {
//       if (response && response.success) {
//         message.success(formatMessage({ id: 'common.message.success.operate' }));
//         this.handleCreateModalVisible(false);
//         this.refreshTable();
//       }
//     },
//   })
// }

handleSaveOrModify = (fieldsValue) => {
  const { entity } = this.state;

  let params = {
    ...fieldsValue,
    companyUuid: loginCompany().uuid,
    dcUuid: loginOrg().uuid,
    pickareaCode: JSON.parse(fieldsValue['pickarea']).code,
  }

  let type = '';
  if (entity.uuid) {
    type = 'pickareaStorageConfig/modify';
    params['uuid'] = entity.uuid;
    if (fieldsValue.pickarea.indexOf('[') > -1 && fieldsValue.pickarea.indexOf(']') > -1) {
      params['pickareaCode'] = entity.pickarea.code;
    } else {
      params['pickareaCode'] = JSON.parse(fieldsValue['pickarea']).code;
    }
    params['version'] = entity.version;
  } else {
    type = 'pickareaStorageConfig/save';
    params['pickareaCode'] = JSON.parse(fieldsValue['pickarea']).code;
  }

  this.props.dispatch({
    type: type,
    payload: params,
    callback: (response) => {
      if (response && response.success) {
        if (type === 'pickareaStorageConfig/save') {
          message.success(commonLocale.saveSuccessLocale);
        } else if (type === 'pickareaStorageConfig/modify') {
          message.success(commonLocale.modifySuccessLocale);
        }
        this.handleCreateModalVisible(false);
        this.refreshTable();
      }
    },
  })
}

handleRemove = (uuid, batch) => {
  let that = this;
  if (uuid) {
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'pickareaStorageConfig/remove',
        payload: { uuid },
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, uuid);
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

onBatchRemove = () => {
  this.setState({
    batchAction: basicState.REMOVE.caption,
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
      if (batchAction === basicState.REMOVE.caption) {
        that.handleRemove(selectedRows[i].uuid, true).then(res => {
          bacth(i + 1);
        })
      }
    } else {
      this.setState({
        suspendLoading: false
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
  }

  return <PickareaStorageConfigCreateModal {...createModalProps} />
}

drawSearchPanel = () => {
  const { pageFilter } = this.state;
  return (<PickareaStorageConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
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
