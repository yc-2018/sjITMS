import React, { Component } from 'react';
import { Button, message, Input, Modal, Badge } from 'antd';
import { Fragment } from 'react';
import { loginCompany } from '@/utils/LoginContext';
import { commonLocale } from '@/utils/CommonLocale';
import ConfigCreateModal from './ConfigCreateModal';
import ConfigSearchPage from './basic/ConfigSearchPage';
import ConfigSearchForm from './ConfigSearchForm';
import {
  getConfigData,
  saveOrUpdateConfigData,
  saveNewConfigData,
  deleteConfigData,
} from '@/services/sjconfigcenter/ConfigCenter';
import { dynamicQuery } from '@/services/quick/Quick';

export default class ConfigSearchPageE extends ConfigSearchPage {
  getColumnsConfig = columns => {
    if (columns) {
      let columnsConfigs = [
        {
          title: '调度中心UUID',
          dataIndex: 'dispatchcenteruuid',
          width: 120,
        },
        {
          title: '调度中心名称',
          dataIndex: 'dispatchcentername',
          width: 100,
        },
      ];
      for (let column of columns) {
        columnsConfigs.push({
          title: column.keyCn,
          dataIndex: column.keyEn,
          key: column.keyEn,
          width: 100,
          render: (val, record) => (
            <div>
              {record[`${column.keyEn}_ex`] ? (
                <Badge dot color="green">
                  <Input
                    style={{ width: 80 }}
                    defaultValue={val}
                    onBlur={event => this.onInputChange(record, column.keyEn, event.target.value)}
                    //   onChange={v => (record[column.keyEn] = v.target.value)}
                  />
                </Badge>
              ) : (
                <Input
                  style={{ width: 80 }}
                  defaultValue={val}
                  onBlur={event => this.onInputChange(record, column.keyEn, event.target.value)}
                  //   onChange={v => (record[column.keyEn] = v.target.value)}
                />
              )}
            </div>
          ),
        });
      }
      return columnsConfigs;
    } else return [];
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: props.contentProps.configName,
      data: [],
      entity: {},
      createModalVisible: false,
      hideLogTab: true,
      columns: this.getColumnsConfig(props.contentProps.columns),
      suspendLoading: true,
      sourceData: [],
      newScroll: { x: 'auto' },
      isEdit: false,
      isCopy: false,
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
  }

  componentDidMount = () => {
    this.initData();
    this.refreshTable();
  };

  initData = async () => {
    let sourceData = [];
    let queryParamsJson = {
      tableName: 'V_SYS_DICT_ITEM',
      condition: {
        params: [{ field: 'DICT_CODE', rule: 'eq', val: ['company'] }],
      },
    };
    const response = await dynamicQuery(queryParamsJson);
    if (!response || !response.success || !Array.isArray(response.result.records)) {
      sourceData = [];
    } else {
      sourceData = response.result.records;
    }
    this.setState({
      sourceData: sourceData,
    });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.contentProps.configNameEn != this.props.contentProps.configNameEn) {
      this.setState(
        {
          columns: this.getColumnsConfig(nextProps.contentProps.columns),
          title: nextProps.contentProps.configName,
        },
        () => {
          this.refreshTable();
        }
      );
    }
  }

  refreshTable = async filter => {
    const { contentProps } = this.props;
    let param = {
      configNameEn: contentProps.configNameEn,
      params: filter ? filter : {},
    };
    let res = await getConfigData(param);
    if (res.success) {
      this.setState({ data: res.data });
    }
  };

  onInputChange = async (record, keyEn, value) => {
    if (record[keyEn] == value) return;
    const { contentProps } = this.props;
    if (value) {
      let param = {
        ...contentProps,
        ...record,
        keyEn: keyEn,
        value: value,
        companyuuid: loginCompany().uuid,
      };
      let res = await saveOrUpdateConfigData(param);
      if (res.success) {
        message.success('修改成功!');
        // this.props.refreshAll({ key: contentProps.configNameEn });
        //this.refreshTable();
      } else message.error('修改失败');
    } else {
      message.error('保存失败,不允许为空值！');
    }
    this.props.refreshAll({ key: contentProps.configNameEn });

    // console.log(record, keyEn, value, contentProps);
  };

  onSearch = data => {
    this.refreshTable(data);
  };

  handleCreateModalVisible = (flag, uuid) => {
    this.setState({
      entity: {},
      isEdit: false,
      isCopy: false,
    });

    this.setState({
      createModalVisible: !!flag,
    });
  };

  handleEditModalVisible = (flag, uuid) => {
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.error('请选择具体数据修改！');
      return;
    }
    this.setState({
      entity: {},
      isEdit: true,
      isCopy: false,
    });

    this.setState({
      createModalVisible: !!flag,
    });
  };

  handleSave = async params => {
    let res = await saveNewConfigData(params);
    const { isEdit } = this.state;
    if (res.success) {
      message.success(isEdit ? '修改成功' : '新增成功!');
      this.setState({ createModalVisible: false });
      // this.refreshTable();
      this.props.refreshAll({ key: this.props.contentProps.configNameEn });
    } else message.error(isEdit ? '修改失败' + res.message : '新增失败!' + res.message);

    this.setState({ isEdit: false, selectedRows: [], isCopy: false });
  };

  onBatchRemove = () => {
    Modal.confirm({
      title: '提示',
      content: '确认删除吗?!',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const { selectedRows } = this.state;
        let params = {
          configNameEn: this.props.contentProps.configNameEn,
          body: selectedRows.map(e => e.dispatchcenteruuid),
        };
        let res = await deleteConfigData(params);
        if (res.success) {
          message.success('删除成功');
          this.refreshTable();
        } else message.error('删除失败');
      },
    });
  };

  onCopyData = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.error('请选择具体数据修改！');
      return;
    }
    this.setState({
      entity: {},
      isEdit: true,
      isCopy: true,
    });

    this.setState({
      createModalVisible: true,
    });
  };

  drawCreateModal = () => {
    const { entity, selectedRows, createModalVisible, sourceData, isEdit, isCopy } = this.state;
    const { contentProps } = this.props;
    const { columns } = contentProps;
    let exValue = {};
    if (isEdit) {
      columns.map(e => {
        exValue[e.keyEn] = selectedRows[0][`${e.keyEn}_ex`];
      });
    }
    const createModalProps = {
      entity: entity,
      modalVisible: createModalVisible,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleSave: this.handleSave,
      loading: this.props.loading,
      exValue: exValue,
      initData: isEdit ? selectedRows[0] : {},
      isEdit: isEdit,
      isCopy: isCopy,
    };

    return (
      <ConfigCreateModal
        {...createModalProps}
        contentProps={contentProps}
        sourceData={sourceData}
      />
    );
  };

  drawSearchPanel = () => {
    const { pageFilter, sourceData } = this.state;
    return (
      <ConfigSearchForm
        filterValue={pageFilter.searchKeyValues}
        refresh={this.onSearch}
        sourceData={sourceData}
      />
    );
  };

  drawActionButton() {
    return (
      <Fragment>
        <Button type="primary" icon="plus" onClick={() => this.handleCreateModalVisible(true)}>
          {commonLocale.createLocale}
        </Button>
        <Button type="primary" icon="plus" onClick={() => this.handleEditModalVisible(true)}>
          编辑
        </Button>
      </Fragment>
    );
  }

  drawToolbarPanel() {
    return (
      <Fragment>
        <Button onClick={() => this.onBatchRemove()}>{commonLocale.batchRemoveLocale}</Button>
        <Button onClick={() => this.onCopyData()}>复制</Button>
      </Fragment>
    );
  }
}
