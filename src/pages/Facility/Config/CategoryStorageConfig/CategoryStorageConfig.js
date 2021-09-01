import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Divider, Button, message, Popconfirm } from 'antd';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import StandardTable from '@/components/StandardTable';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { categoryStorageConfigLocale } from './CategoryStorageConfigLocale';
import CategoryStorageConfigCreateModal from './CategoryStorageConfigCreateModal';
import CSSearchForm from './CSSearchForm';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { havePermission } from '@/utils/authority';
import { CATEGORY_RES } from '@/pages/Basic/Category/CategoryPermission';
import { routerRedux } from 'dva/router';

@connect(({ categoryStorageConfig, loading }) => ({
  categoryStorageConfig,
  loading: loading.models.categoryStorageConfig,
}))
export default class CategoryStorageConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: categoryStorageConfigLocale.categoryStorageConfigTitle,
      data: this.props.categoryStorageConfig.data,
      suspendLoading:false,
      entity: {},
      createModalVisible: false,
      logCaption: 'CategoryStorageConfig'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {};
  }

  /**
   * 跳转到类别详情页面
   */
  onCategoryView = (category) => {
    this.props.dispatch({
      type: 'category/get',
      payload: category.uuid,
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/basic/category',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }


  columns = [{
    title: categoryStorageConfigLocale.categoryStorageConfigCategoryCode,
    dataIndex: 'category.code',
    key: 'categoryCode',
    sorter: true,
    width: colWidth.codeColWidth,
    render: (val, record) => <a onClick={this.onCategoryView.bind(this, record.category) }
    disabled={!havePermission(CATEGORY_RES.VIEW)}><EllipsisCol colValue={val} /></a>
  }, {
    title: categoryStorageConfigLocale.categoryStorageConfigCategoryName,
    dataIndex: 'category.name',
    key: 'categoryName',
    sorter: true,
    width: colWidth.codeColWidth,
  }, {
    title: categoryStorageConfigLocale.categoryStorageConfigBinRange,
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
         <a onClick={this.handleCreateModalVisible.bind(this, true, record.category.uuid)}>
            {commonLocale.editLocale}
          </a>
          <Divider type="vertical" />
        <IPopconfirm onConfirm={() => this.handleRemove(record.uuid, null)}
          operate={commonLocale.deleteLocale}
          object={categoryStorageConfigLocale.categoryStorageConfigTitle}>
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
      data: nextProps.categoryStorageConfig.data
    });
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter, data } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'categoryStorageConfig/query',
      payload: queryFilter,

      callback: (response) => {
        if (response && response.success && response.data) {
          data.list = response.data && response.data.records;
          data.pagination = {
            total: response.data && response.data.paging && response.data.paging.recordCount ? response.data.paging.recordCount : 0,
            pageSize: response.data && response.data.paging && response.data.paging.pageSize ? response.data.paging.pageSize : 20,
            current: response.data && response.data.page ? response.data.page + 1 : 1,
            showTotal: total => `共 ${total} 条`,
          },
            this.setState({
              data: {...data}
            })
        }
      },
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

  /**
 * 表格内容改变时，调用此方法
 */
  // handleStandardTableChange = (pagination, filtersArg, sorter) => {
  //   const { dispatch } = this.props;
  //   const { pageFilter } = this.state;
  //
  //   pageFilter.page = pagination.current - 1;
  //   pageFilter.pageSize = pagination.pageSize;
  //
  //   // 判断是否有过滤信息
  //   const filters = Object.keys(filtersArg).reduce((obj, key) => {
  //     const newObj = { ...obj };
  //     newObj[key] = getValue(filtersArg[key]);
  //     return newObj;
  //   }, {});
  //
  //   if (sorter.field) {
  //     // 如果有排序字段，则需要将原来的清空
  //     if (sorter.field === 'category.code') {
  //       var sortField = 'categorycode';
  //
  //     }
  //
  //     if (sorter.field === 'category.name') {
  //       var sortField = 'categoryname';
  //
  //     }
  //
  //     pageFilter.sortFields = {};
  //
  //     var sortType = sorter.order === 'descend' ? true : false;
  //     pageFilter.sortFields[sortField] = sortType;
  //   }
  //
  //   if (this.refreshTable)
  //     this.refreshTable(pageFilter);
  //
  //   dispatch({
  //     type: 'categoryStorageConfig/query',
  //     payload: pageFilter,
  //   });
  // };

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
      type: 'categoryStorageConfig/getByCategoryUuidAndDcUuid',
      payload: {
        categoryUuid: uuid,
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

  handleSaveOrModify = (fieldsValue) => {
    const { entity } = this.state;

    let params = {
      ...fieldsValue,
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      categoryCode: JSON.parse(fieldsValue['category']).code,
    }

    let type = '';
    if (entity.uuid) {
      type = 'categoryStorageConfig/modify';
      params['uuid'] = entity.uuid;
      if (fieldsValue.category.indexOf('[') > -1 && fieldsValue.category.indexOf(']') > -1) {
        params['categoryCode'] = entity.category.code;
      } else {
        params['categoryCode'] = JSON.parse(fieldsValue['category']).code;
      }
      params['version'] = entity.version;
    } else {
      type = 'categoryStorageConfig/add';
      params['categoryCode'] = JSON.parse(fieldsValue['category']).code;
    }

    this.props.dispatch({
      type: type,
      payload: params,
      callback: (response) => {
        if (response && response.success) {
          if (type === 'categoryStorageConfig/add') {
            message.success(commonLocale.saveSuccessLocale);
          } else if (type === 'categoryStorageConfig/modify') {
            message.success(commonLocale.modifySuccessLocale);
          }
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
      },
    })
  }

  handleRemove = (uuid, batch, record) => {
    const { dispatch } = this.props;
    let that =this;
    if (uuid) {
      return new Promise(function (resolve, reject) {
        dispatch({
          type: 'categoryStorageConfig/remove',
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
    const { selectedRows, batchAction } = this.state;
    const that = this;
    let bacth=(i)=>{
      if(i<selectedRows.length){
        if (batchAction === basicState.REMOVE.caption) {
          that.handleRemove(selectedRows[i].uuid, true, selectedRows[i]).then(res=>{
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
    }

    return <CategoryStorageConfigCreateModal {...createModalProps} />
  }

  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<CSSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
  }

  drawActionButton() {
    return (
      <Fragment>
        <Button type='primary' icon='plus'
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
