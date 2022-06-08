/*
 * @Author: Liaorongchang
 * @Date: 2022-05-31 17:46:43
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-07 15:16:28
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message, Modal, Table } from 'antd';
import { flow } from 'lodash-decorators';
import { dynamicDelete } from '@/services/quick/Quick';
import { getTableInfo, onSave, getUnAddInfo } from '@/services/sjtms/BasicSource';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class FormFieldSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
    isModalVisible: false,
    selectedRowKeys: [],
    dataSource: [],
    newColumn: [],
  };

  drawActionButton = () => {};

  drawToolbarPanel = () => {
    const { isModalVisible, selectedRowKeys, dataSource } = this.state;

    const columns = [
      {
        title: '字段名称',
        dataIndex: 'columnName',
        key: 'columnName',
      },
      {
        title: '字段备注',
        dataIndex: 'comments',
        key: 'comments',
      },
      {
        title: '字段类型',
        dataIndex: 'dataType',
        key: 'dataType',
      },
      {
        title: '字段长度',
        dataIndex: 'dataLength',
        key: 'dataLength',
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: e => this.onSelectChange(e),
    };
    return (
      <div style={{ margin: '10px 1px' }}>
        <Button type="primary" onClick={this.handleAdd.bind()}>
          新增
        </Button>
        <Popconfirm
          title="你确定要删除所选中的内容吗?"
          onConfirm={() => this.handleDelete()}
          okText="确定"
          cancelText="取消"
        >
          <Button style={{ marginLeft: '12px' }}>删除</Button>
        </Popconfirm>
        <Modal
          width={1000}
          title="新增费用配置明细"
          visible={isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
        >
          <Table rowSelection={rowSelection} dataSource={dataSource} columns={columns} />;
        </Modal>
      </div>
    );
  };

  onSelectChange = rows => {
    this.setState({
      selectedRowKeys: rows,
    });
  };

  handleOk = async () => {
    const { newColumn, selectedRowKeys } = this.state;
    const { selectedNodes } = this.props;
    const cc = newColumn.filter(x => selectedRowKeys.includes(x.columnName));
    let payload = {
      params: cc,
      formUuid: selectedNodes.key,
    };
    await onSave(payload).then(response => {
      if (response && response.success) {
        message.success('保存成功');
        this.queryCoulumns();
      }
    });
    this.setState({ isModalVisible: false });
  };

  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };

  handleDelete = async () => {
    const { selectedRows } = this.state;
    const params = [];
    if (selectedRows.length !== 0) {
      for (var i = 0; i < selectedRows.length; i++) {
        this.deleteById(selectedRows[i], params);
      }
      await dynamicDelete({ params: params }).then(result => {
        if (result.success) {
          message.success('删除成功！');
          this.queryCoulumns();
        } else {
          message.error('删除失败，请刷新后再操作');
        }
      });
    } else {
      message.error('请至少选中一条数据！');
    }
  };

  handleAdd = async () => {
    const { data } = this.state;
    const tableName = this.props.selectedNodes.props.tableName;
    let payload = {
      tableName: this.props.selectedNodes.props.tableName,
      formUuid: this.props.selectedNodes.key,
    };
    await getUnAddInfo(payload).then(response => {
      if (response.success && response.data) {
        const newColumn = response.data;
        let dataSource = [];
        newColumn.forEach(data => {
          dataSource.push({
            ...data,
            key: data.columnName,
          });
        });
        this.setState({ isModalVisible: true, dataSource, newColumn });
      } else {
        this.setState({ isModalVisible: true });
      }
    });
  };

  /**
   * 单一删除
   */
  deleteById = (record, paramsData) => {
    var val = record['UUID'];

    var params = {
      tableName: 'cost_form_field',
      condition: { params: [{ field: 'UUID', rule: 'eq', val: [val] }] },
      deleteAll: 'false',
    };
    paramsData.push(params);
  };

  onSearch = data => {
    const { selectedRows } = this.props;
    let UUID = typeof data == 'undefined' ? selectedRows : data;
    const pageFilters = {
      ...this.state.pageFilters,
      superQuery: {
        matchType: '',
        queryParams: [
          {
            field: 'formuuid',
            type: 'VarChar',
            rule: 'eq',
            val: UUID,
          },
        ],
      },
    };
    this.state.pageFilters = pageFilters;
    this.refreshTable();
  };

  drawSearchPanel = () => {};
}