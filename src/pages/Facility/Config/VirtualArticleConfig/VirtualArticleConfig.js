import React, { Component } from 'react';
import { Divider, Button, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import VirtualArticleConfigSearchForm from './VirtualArticleConfigSearchForm';
import VirtualArticleConfigCreateModal from './VirtualArticleConfigCreateModal';
import { packageVirtualArticleConfigLocale } from './VirtualArticleConfigLocale';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { havePermission } from '@/utils/authority';
import { RESOURCE_IWMS_BASIC_ARTICLE_VIEW } from '@/pages/Basic/Article/Permission';
import { routerRedux } from 'dva/router';


@connect(({ virtualArticleConfig, loading }) => ({
  virtualArticleConfig,
  loading: loading.models.virtualArticleConfig,
}))
export default class VirtualArticleConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: packageVirtualArticleConfigLocale.title,
      data: this.props.virtualArticleConfig.data,
      suspendLoading: false,
      entity: {},
      selectedRows: [],
      pageFilter: {
        page: 0,
        pageSize: 10,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
        sortFields: {},
        likeKeyValues: {},
      },
      createModalVisible: false,
      logCaption: 'VirtualArticleConfig'
    };
  }

  columns = [
    {
      title: packageVirtualArticleConfigLocale.owner,
      dataIndex: 'owner',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text) => (text == null ? <Empty /> : <EllipsisCol colValue={'[' + text.code + ']' + text.name} />),
    },
    {
      title: packageVirtualArticleConfigLocale.articleStorageArticle,
      dataIndex: 'virtualArticle',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text) => (text == null ? <Empty /> : <EllipsisCol colValue={'[' + text.code + ']' + text.name} />),
    },
    {
      title: commonLocale.operateLocale,
      key: 'action',
      width: colWidth.operateColWidth + 20,
      render: (text, record) => (
        <span>
          <a href="javascript:;" onClick={this.handleCreateModalVisible.bind(this, true, record.uuid)}>
            {commonLocale.editLocale}
          </a>
          <Divider type="vertical" />
          <IPopconfirm onConfirm={() => this.handleRemove(record.uuid, null)}
                       operate={commonLocale.deleteLocale}
                       object={packageVirtualArticleConfigLocale.title}>
            <a>{commonLocale.deleteLocale}</a>
          </IPopconfirm>
        </span>
      ),
    }
  ];
  componentDidMount = () => {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.virtualArticleConfig.data
    });
  }
  /**
   * 刷新主体页面
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if (filter) {
      pageFilter.ownerUuid = filter.owner && filter.owner.uuid ? filter.owner.uuid : '';
    }
    dispatch({
      type: 'virtualArticleConfig/query',
      payload: pageFilter,
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ownerUuid: data.owner && JSON.parse(data.owner) ? JSON.parse(data.owner).uuid : ''
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
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
      type: 'virtualArticleConfig/get',
      payload: {
        uuid: uuid
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


  handleRemove = (uuid, batch, record) => {
    const { dispatch } = this.props;
    let that = this;
    if (uuid) {
      return new Promise(function (resolve, reject) {
        dispatch({
          type: 'virtualArticleConfig/remove',
          payload: { uuid },
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
          that.handleRemove(selectedRows[i].uuid, true, selectedRows[i]).then(res => {
            bacth(i + 1)
          });
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

    return <VirtualArticleConfigCreateModal {...createModalProps} />
  }
  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<VirtualArticleConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
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
  handleSaveOrModify = (fieldsValue) => {
    const { entity } = this.state;

    let params = {
      owner: fieldsValue.owner ? JSON.parse(fieldsValue.owner) : undefined,
      virtualArticle: fieldsValue.virtualArticle && fieldsValue.virtualArticle.charAt(0)=== '{' ? JSON.parse(fieldsValue.virtualArticle) : fieldsValue.virtualArticle && fieldsValue.virtualArticle.charAt(0)!== '{' ? {uuid: entity.virtualArticle.uuid,
        code: entity.virtualArticle.code,
        name: entity.virtualArticle.name} : undefined,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,

    }

    let type = '';
    if (entity.uuid) {
      type = 'virtualArticleConfig/modify';
      params['uuid'] = entity.uuid;
    } else {
      type = 'virtualArticleConfig/save';
    }

    this.props.dispatch({
      type: type,
      payload: params,
      callback: (response) => {
        if (response && response.success) {
          if (type === 'virtualArticleConfig/save') {
            message.success(commonLocale.saveSuccessLocale);
          } else if (type === 'virtualArticleConfig/modify') {
            message.success(commonLocale.modifySuccessLocale);
          }
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
      },
    })
  }
}
