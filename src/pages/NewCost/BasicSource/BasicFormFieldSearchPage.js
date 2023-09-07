/*
 * @Author: Liaorongchang
 * @Date: 2022-05-31 17:46:43
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-25 16:16:31
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message, Modal, Table, Input, Checkbox } from 'antd';
import { dynamicDelete } from '@/services/quick/Quick';
import { addDtl, getUnAddInfo, updateDtl, getNewUnAddInfo } from '@/services/cost/BasicSource';

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
    canDragTable: true,
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
        <Button onClick={this.handleOnSave.bind()}>保存</Button>
        <Popconfirm
          title="你确定要删除所选中的内容吗?"
          onConfirm={() => this.handleDelete()}
          okText="确定"
          cancelText="取消"
        >
          <Button>删除</Button>
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

  drawcell = e => {
    if (e.column.fieldName == 'SHOW') {
      const component = (
        <Checkbox
          defaultChecked={e.val}
          onChange={v => (e.record.SHOW = v.target.checked ? 1 : 0)}
        />
      );
      e.component = component;
    } else if (e.column.fieldName == 'QUERY') {
      const component = (
        <Checkbox
          defaultChecked={e.val}
          onChange={v => (e.record.QUERY = v.target.checked ? 1 : 0)}
        />
      );
      e.component = component;
    } else if (e.column.fieldName == 'SUBJECT_FIELD') {
      const component = (
        <Checkbox
          defaultChecked={e.val != '<空>' && e.val == e.record.DB_FIELD_NAME ? true : false}
          onChange={v => {
            e.record.SUBJECT_FIELD = v.target.checked ? e.record.DB_FIELD_NAME : null;
          }}
        />
      );
      e.component = component;
    } else if (e.column.fieldName == 'PERIOD_FIELD') {
      const component = (
        <Checkbox
          defaultChecked={e.val != '<空>' && e.val == e.record.DB_FIELD_NAME ? true : false}
          onChange={v => {
            e.record.PERIOD_FIELD = v.target.checked ? e.record.DB_FIELD_NAME : null;
          }}
        />
      );
      e.component = component;
    } else if (e.column.fieldName == 'ONLY_CONDITION') {
      const component = (
        <Checkbox
          defaultChecked={e.val == 1 ? true : false}
          onChange={v => {
            e.record.ONLY_CONDITION = v.target.checked ? 1 : 0;
          }}
        />
      );
      e.component = component;
    } else if (e.column.fieldName == 'ALLOWUPDATE') {
      const component = (
        <Checkbox
          defaultChecked={e.val == 1 ? true : false}
          onChange={v => {
            e.record.ALLOWUPDATE = v.target.checked ? 1 : 0;
          }}
        />
      );
      e.component = component;
    } else if (e.column.fieldName != 'LINE') {
      const component = (
        <Input
          defaultValue={e.val}
          onChange={v => (e.record[e.column.fieldName] = v.target.value)}
        />
      );
      e.component = component;
    }
  };

  handleOk = async () => {
    const { newColumn, selectedRowKeys } = this.state;
    const { selectedNodes } = this.props;
    const cc = newColumn.filter(x => selectedRowKeys.includes(x.columnName));
    let payload = {
      params: cc,
      formUuid: selectedNodes.key,
    };
    await addDtl(payload).then(response => {
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
    let payload = {
      tableName: this.props.selectedNodes.props.dataRef.tableName,
      formUuid: this.props.selectedNodes.key,
      database: this.props.system.system,
    };
    await getNewUnAddInfo(payload).then(response => {
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

  handleOnSave = async () => {
    const payload = this.state.data.list;
    const response = await updateDtl(payload);
    if (response && response.success) {
      message.success('保存成功');
      this.queryCoulumns();
    }
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
    let UUID = typeof data == 'undefined' || data == 'first' ? selectedRows : data;
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

  drapTableChange = list => {
    const { data, pageFilters } = this.state;
    let pageSize = (pageFilters.page - 1) * pageFilters.pageSize;
    let size = isNaN(pageSize) ? 0 : pageSize;
    data.list = list.map((record, index) => {
      record.LINE = size + index + 1;
      return record;
    });
    this.setState(data);
  };

  drawSearchPanel = () => {};
}
