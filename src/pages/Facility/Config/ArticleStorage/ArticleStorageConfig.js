import React, { Component } from 'react';
import { Divider, Button, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import ArticleStorageSearchForm from './ArticleStorageSearchForm';
import ArticleStorageConfigCreateModal from './ArticleStorageConfigCreateModal';
import { articleStorageLocale } from './ArticleStorageLocale';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { havePermission } from '@/utils/authority';
import { RESOURCE_IWMS_BASIC_ARTICLE_VIEW } from '@/pages/Basic/Article/Permission';
import { routerRedux } from 'dva/router';


@connect(({ articleStorageConfig, loading }) => ({
  articleStorageConfig,
  loading: loading.models.articleStorageConfig,
}))
export default class ArticleStorageConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: articleStorageLocale.articleStorageTitle,
      data: this.props.articleStorageConfig.data,
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
      logCaption: 'ArticleStorageConfig'
    };
  }

  /**
   * 跳转到商品详情页面
   */
  onArticleView = (article) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/article',
      payload: {
        showPage: 'view',
        entityUuid: article?article.uuid:undefined
      }
    }));
  }

  columns = [
    {
      title: articleStorageLocale.articleStorageArticle,
      dataIndex: 'article',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text) => (text == null ? <Empty /> : <a onClick={this.onArticleView.bind(this, text)} disabled={!havePermission(RESOURCE_IWMS_BASIC_ARTICLE_VIEW)} ><EllipsisCol colValue={'[' + text.code + ']' + text.name} /></a>),
    },
    {
      title: articleStorageLocale.articleStorageQpcStr,
      dataIndex: 'qpcStr',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    },
    {
      title: articleStorageLocale.articleStorageBinRange,
      dataIndex: 'binRange',
      sorter: true,
      width: itemColWidth.qpcStrColWidth,
    },
    {
      title: commonLocale.operateLocale,
      key: 'action',
      width: colWidth.operateColWidth,
      render: (text, record) => (
        <span>
          <a href="javascript:;" onClick={this.handleCreateModalVisible.bind(this, true, record.uuid)}>
            {commonLocale.editLocale}
          </a>
          <Divider type="vertical" />
          <IPopconfirm onConfirm={() => this.handleRemove(record.uuid, null)}
            operate={commonLocale.deleteLocale}
            object={articleStorageLocale.articleStorageTitle}>
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
      data: nextProps.articleStorageConfig.data
    });
  }
  /**
   * 刷新主体页面
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'articleStorageConfig/query',
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
      type: 'articleStorageConfig/get',
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


  handleRemove = (uuid, batch, record) => {
    const { dispatch } = this.props;
    let that = this;
    if (uuid) {
      return new Promise(function (resolve, reject) {
        dispatch({
          type: 'articleStorageConfig/remove',
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

    return <ArticleStorageConfigCreateModal {...createModalProps} />
  }
  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<ArticleStorageSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
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
      ...fieldsValue,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,

    }

    let type = '';
    if (entity.uuid) {
      type = 'articleStorageConfig/modify';
      params['uuid'] = entity.uuid;
      if (fieldsValue.article.indexOf('[') > -1 && fieldsValue.article.indexOf(']') > -1) {
        params['articleUuid'] = entity.article.uuid;
      } else {
        params['articleUuid'] = JSON.parse(fieldsValue['article']).uuid;
      }
      params['version'] = entity.version;
    } else {
      type = 'articleStorageConfig/save';
      params['articleUuid'] = JSON.parse(fieldsValue['article']).uuid;
    }

    this.props.dispatch({
      type: type,
      payload: params,
      callback: (response) => {
        if (response && response.success) {
          if (type === 'articleStorageConfig/save') {
            message.success(commonLocale.saveSuccessLocale);
          } else if (type === 'articleStorageConfig/modify') {
            message.success(commonLocale.modifySuccessLocale);
          }
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
        // else {
        //   message.error(response.message);
        // }
      },
    })
  }
}
