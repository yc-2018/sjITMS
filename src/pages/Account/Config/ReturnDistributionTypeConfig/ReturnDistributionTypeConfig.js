import React, { Component } from 'react';
import { Divider, Button, message, Popconfirm, Form, Input, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
// import { dispatcherConfigLocale } from './DispatcherConfigLocale';
import ReturnDistributionTypeConfigCreateModal from './ReturnDistributionTypeConfigCreateModal';
import ConfigSearchPage from '@/pages/Component/Page/inner/ConfigSearchPage';
import ReturnDistributionTypeConfigSearchForm from './ReturnDistributionTypeConfigSearchForm';
import { convertCodeName } from '@/utils/utils';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import { returnDistributionTypeConfigLocal } from './ReturnDistributionTypeConfigLocal';

const FormItem = Form.Item;
const Search = Input.Search;
@connect(({ pretype, loading }) => ({
  pretype,
  loading: loading.models.pretype,
}))
export default class ReturnDistributionTypeConfig extends ConfigSearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: returnDistributionTypeConfigLocal.title,
      data: this.props.pretype.data,
      record: {},
      createModalVisible: false,
      hideLogTab: true
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
  }


  columns = [
    {
      title: formatMessage({ id: 'pretype.name' }),
      dataIndex: 'name',
      width: colWidth.codeColWidth,
    },
    {
      title: formatMessage({ id: 'pretype.note' }),
      dataIndex: 'note',
      width: itemColWidth.noteEditColWidth,
      render: (text) => <Tooltip placement="topLeft" title={text}>{text ? text : <Empty />}</Tooltip>
    },
    {
      title: formatMessage({ id: 'pretype.index.column.operate' }),
      width: colWidth.operateColWidth,
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.onView(record)}>
            {formatMessage({ id: 'common.operate.edit' })}
          </a>
          <Divider type="vertical" />
          <IPopconfirm onConfirm={this.handleRemove.bind(this, record, false)}
            operate={commonLocale.deleteLocale}
            object={returnDistributionTypeConfigLocal.title}
          >
            <a>{commonLocale.deleteLocale}</a>
          </IPopconfirm>
        </Fragment>
      ),
    },
  ];

  componentDidMount = () => {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.pretype.data
    });
  }

  refreshTable = (filter) => {
    let { pageFilter } = this.state;

    pageFilter.searchKeyValues = {
      'orgUuid': loginOrg().uuid,
      'preType': 'RETURNDISTRIBUTIONTYPE'
    };
    const { dispatch } = this.props;

    dispatch({
      type: 'pretype/query',
      payload: pageFilter,
    });
  };

  onSearch = data => {
    const { pageFilter } = this.state;
    const { dispatch } = this.props;

    pageFilter.page = 0;
    pageFilter.searchKeyValues = {
      ...data,
      'orgUuid': loginOrg().uuid,
      'preType': 'RETURNDISTRIBUTIONTYPE'
    };

    this.setState({
      pageFilter: pageFilter,
    });

    dispatch({
      type: 'pretype/query',
      payload: pageFilter,
    });
  }

  handleCreateModalVisible = (flag, uuid) => {
    this.setState({
      record: {},
    })

    this.setState({
      createModalVisible: !!flag,
    })
  }

  onView = (record) => {
    this.setState({
      record: record,
      createModalVisible: true,
    });
  }

  handleSave = (fieldsValue) => {
    const { record } = this.state;

    let type = 'pretype/add';
    if (record.uuid) {
      type = 'pretype/modify';
      fieldsValue.uuid = record.uuid
    }
    let params = {
      ...fieldsValue,
      preType: 'RETURNDISTRIBUTIONTYPE',
      orgUuid: loginOrg().uuid,
      // version: record.version
    }

    this.props.dispatch({
      type: type,
      payload: params,
      callback: (response) => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.operate' }));
          this.handleCreateModalVisible(false);
          this.refreshTable();
        } else {
          this.handleCreateModalVisible(false);
          this.refreshTable();
        }
      },
    })
  }

  handleRemove = (record, callback) => {

    if (record) {
      this.props.dispatch({
        type: 'pretype/delete',
        payload: record,
        callback: callback ? callback : (response) => {
          if (response && response.success) {
            this.refreshTable();
            message.success(commonLocale.removeSuccessLocale);
          }
        }
      })
    }
  }

  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale,
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    const { selectedRows, batchAction } = this.state;

    const that = this;
    selectedRows.forEach(item => {
      if (batchAction === commonLocale.deleteLocale) {
        that.handleRemove(item, that.batchCallback);
      }
    });
  }

  drawCreateModal = () => {
    const {
      record,
      selectedRows,
      createModalVisible,
    } = this.state;

    const createModalProps = {
      record: record,
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleSave: this.handleSave,
      loading: this.props.loading,
    }

    return <ReturnDistributionTypeConfigCreateModal {...createModalProps} />
  }

  drawSearchPanel = () => {
    const { pageFilter } = this.state;
    return (<ReturnDistributionTypeConfigSearchForm filterValue={pageFilter.searchKeyValues} refresh={this.onSearch} />);
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