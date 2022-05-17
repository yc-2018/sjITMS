/*
 * @Author: guankongjin
 * @Date: 2022-04-01 08:43:48
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-14 14:44:08
 * @Description: 嵌套子表格组件
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\DispatchingChildTable.js
 */
import React, { Component } from 'react';
import { Table } from 'antd';
import dispatchingTableStyles from './DispatchingTable.less';

export default class DispatchingChildTable extends Component {
  //表格选择
  onParentSelectChange = (record, selected) => {
    const {
      dataSource,
      hasChildTable,
      selectedRowKeys,
      childSelectedRowKeys,
      changeSelectRows,
    } = this.props;
    let patentArr = [...selectedRowKeys];
    let childArr = childSelectedRowKeys ? [...childSelectedRowKeys] : [];
    //选中行下的所有子选项
    const details = dataSource.find(d => d.uuid === record.uuid).details;
    let setChildArr = hasChildTable && details ? details.map(item => item.uuid) : [];
    if (selected) {
      //父Table选中，子Table全选中
      patentArr.push(record.uuid);
      childArr = hasChildTable ? childArr.concat(setChildArr) : [];
    } else {
      //父Table取消选中，子Table全取消选中
      patentArr.splice(patentArr.findIndex(item => item === record.uuid), 1);
      childArr = hasChildTable ? childArr.filter(item => !setChildArr.some(e => e === item)) : [];
    }
    //设置父，子的SelectedRowKeys
    changeSelectRows({ selectedRowKeys: patentArr, childSelectedRowKeys: childArr });
  };

  //表格全选
  onParentSelectAll = (selected, selectedRows, changeRows) => {
    const { hasChildTable, selectedRowKeys, childSelectedRowKeys, changeSelectRows } = this.props;
    let patentArr = [...selectedRowKeys];
    let childArr = childSelectedRowKeys ? [...childSelectedRowKeys] : [];
    if (selected) {
      //父Table选中，子Table全选中，设置子Table的SelectedRowKeys
      patentArr = patentArr.concat(changeRows.map(item => item.uuid));
      if (hasChildTable) {
        changeRows.forEach(row => {
          childArr = childArr.concat(row.details.map(item => item.uuid));
        });
      }
    } else {
      //父Table取消选中，子Table全取消选中，设置子Table的SelectedRowKeys
      patentArr = patentArr.filter(item => !changeRows.some(e => e.uuid === item));
      childArr = [];
    }
    //设置父，子的SelectedRowKeys
    changeSelectRows({ selectedRowKeys: patentArr, childSelectedRowKeys: childArr });
  };

  //子表格选择
  onChildSelectChange = (record, selected, selectedRows) => {
    const { dataSource, selectedRowKeys, childSelectedRowKeys, changeSelectRows } = this.props;
    let childArr = [...childSelectedRowKeys];
    let parentArr = [...selectedRowKeys];
    selected
      ? childArr.push(record.uuid)
      : childArr.splice(childArr.findIndex(item => item === record.uuid), 1);
    selectedRows = selectedRows.filter(a => a !== undefined);
    //找到子Table对应的父Table的所在行
    const parentRow = dataSource.find(x => x.details.find(d => d.uuid === record.uuid));
    if (parentRow.details.length === selectedRows.length) {
      parentArr.push(parentRow.uuid);
    } else {
      parentArr.splice(parentArr.findIndex(item => item === parentRow.uuid), 1);
    }
    //设置父，子的SelectedRowKeys
    changeSelectRows({ selectedRowKeys: parentArr, childSelectedRowKeys: childArr });
  };

  //子表格全选
  onChildSelectAll = (selected, selectedRows, changeRows) => {
    const { dataSource, selectedRowKeys, childSelectedRowKeys, changeSelectRows } = this.props;
    let childArr = [...childSelectedRowKeys];
    let parentArr = [...selectedRowKeys];
    //找到子Table对应的父Table的所在行
    const parentRow = dataSource.find(x => x.details.find(d => d.uuid === changeRows[0].uuid));
    if (selected) {
      childArr = childArr.concat(changeRows.map(item => item.uuid));
      parentArr.push(parentRow.uuid);
    } else {
      childArr = childArr.filter(item => !changeRows.some(e => e.uuid === item));
      parentArr.splice(parentArr.findIndex(item => item === parentRow.uuid), 1);
    }
    //设置父，子的SelectedRowKeys
    changeSelectRows({ selectedRowKeys: parentArr, childSelectedRowKeys: childArr });
  };

  //表格行点击事件
  onClickRow = record => {
    if (this.props.clickRow == undefined) return;
    this.onParentSelectChange(record, this.props.selectedRowKeys.indexOf(record.uuid) == -1);
  };

  //子表格行点击事件
  onChildClickRow = record => {
    if (this.props.clickRow == undefined) return;
    const { dataSource, selectedRowKeys, childSelectedRowKeys } = this.props;
    const selected = childSelectedRowKeys.indexOf(record.uuid) == -1;
    //找到子Table对应的父Table的所在行
    const parentRow = dataSource.find(x => x.details.find(d => d.uuid === record.uuid));
    let selectedRows = parentRow.details.filter(
      item => childSelectedRowKeys.indexOf(item.uuid) != -1
    );
    selected
      ? selectedRows.push(record)
      : selectedRows.splice(parentRow.details.findIndex(x => x.uuid == record.uuid), 1);
    this.onChildSelectChange(record, selected, selectedRows);
  };

  render() {
    const {
      scrollY,
      pagination,
      columns,
      nestColumns,
      hasChildTable,
      dataSource,
      loading,
      selectedRowKeys,
      childSelectedRowKeys,
    } = this.props;
    const childRowSelection = {
      selectedRowKeys: childSelectedRowKeys,
      onSelect: this.onChildSelectChange,
      onSelectAll: this.onChildSelectAll,
    };
    const parentRowSelection = {
      selectedRowKeys: selectedRowKeys,
      onSelect: this.onParentSelectChange,
      onSelectAll: this.onParentSelectAll,
    };

    //子表格
    const expandedRowRender = mainRecord => {
      return (
        <Table
          rowSelection={childSelectedRowKeys ? childRowSelection : ''}
          columns={nestColumns}
          size="small"
          rowKey={record => (record.uuid ? record.uuid : 'nestKey')}
          dataSource={mainRecord.details ? mainRecord.details : []}
          onRowClick={childSelectedRowKeys ? this.onChildClickRow : ''}
          indentSize={10}
          scroll={{ y: false }}
          pagination={false}
        />
      );
    };
    return (
      <Table
        rowSelection={selectedRowKeys ? parentRowSelection : ''}
        columns={columns}
        loading={loading}
        size="small"
        rowKey={record => record.uuid}
        dataSource={dataSource}
        onRowClick={selectedRowKeys ? this.onClickRow : ''}
        expandedRowRender={hasChildTable ? record => expandedRowRender(record) : ''}
        pagination={pagination || false}
        className={dispatchingTableStyles.dispatchingTable}
        scroll={{ y: scrollY, x: '100%' }}
        footer={this.props.footer}
      />
    );
  }
}
