/*
 * @Author: guankongjin
 * @Date: 2022-04-01 08:43:48
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-12 09:10:25
 * @Description: 嵌套子表格组件
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\CardTable.js
 */
import React, { Component } from 'react';
import { Table } from 'antd';
import cardTableStyle from './CardTableStyle.less';

export default class CardTable extends Component {
  state = {
    selectedRowKeys: [],
    childSelectedRowKeys: [],
  };

  //表格选择
  onParentSelectChange = (record, selected) => {
    const { selectedRowKeys, childSelectedRowKeys } = this.state;
    const { dataSource, childTable } = this.props;
    let patentArr = [...selectedRowKeys];
    let childArr = [...childSelectedRowKeys];
    //选中行下的所有子选项
    let setChildArr = childTable
      ? dataSource.find(d => d.UUID === record.UUID).items.map(item => item.UUID)
      : [];
    if (selected) {
      //父Table选中，子Table全选中
      patentArr.push(record.UUID);
      childArr = childTable ? childArr.concat(setChildArr) : [];
    } else {
      //父Table取消选中，子Table全取消选中
      patentArr.splice(patentArr.findIndex(item => item === record.UUID), 1);
      childArr = childTable ? childArr.filter(item => !setChildArr.some(e => e === item)) : [];
    }
    //设置父，子的SelectedRowKeys
    this.setState({ selectedRowKeys: patentArr, childSelectedRowKeys: childArr });
  };

  //表格全选
  onParentSelectAll = (selected, selectedRows, changeRows) => {
    const { selectedRowKeys, childSelectedRowKeys } = this.state;
    const { childTable } = this.props;
    let patentArr = [...selectedRowKeys];
    let childArr = [...childSelectedRowKeys];
    if (selected) {
      //父Table选中，子Table全选中，设置子Table的SelectedRowKeys
      patentArr = patentArr.concat(changeRows.map(item => item.UUID));
      if (childTable) {
        changeRows.forEach(row => {
          childArr = childArr.concat(row.items.map(item => item.UUID));
        });
      }
    } else {
      //父Table取消选中，子Table全取消选中，设置子Table的SelectedRowKeys
      patentArr = patentArr.filter(item => !changeRows.some(e => e.UUID === item));
      childArr = [];
    }
    //设置父，子的SelectedRowKeys
    this.setState({ selectedRowKeys: patentArr, childSelectedRowKeys: childArr });
  };

  //子表格选择
  onChildSelectChange = (record, selected, selectedRows) => {
    const { selectedRowKeys, childSelectedRowKeys } = this.state;
    const { dataSource } = this.props;
    let childArr = [...childSelectedRowKeys];
    let parentArr = [...selectedRowKeys];
    selected
      ? childArr.push(record.UUID)
      : childArr.splice(childArr.findIndex(item => item === record.UUID), 1);
    selectedRows = selectedRows.filter(a => a !== undefined);
    //找到子Table对应的父Table的所在行
    const parentRow = dataSource.find(x => x.items.find(d => d.UUID === record.UUID));
    if (parentRow.items.length === selectedRows.length) {
      parentArr.push(parentRow.UUID);
    } else {
      parentArr.splice(parentArr.findIndex(item => item === parentRow.UUID), 1);
    }
    //设置父，子的SelectedRowKeys
    this.setState({ selectedRowKeys: parentArr, childSelectedRowKeys: childArr });
  };

  //子表格全选
  onChildSelectAll = (selected, selectedRows, changeRows) => {
    const { selectedRowKeys, childSelectedRowKeys } = this.state;
    const { dataSource } = this.props;
    let childArr = [...childSelectedRowKeys];
    let parentArr = [...selectedRowKeys];
    //找到子Table对应的父Table的所在行
    const parentRow = dataSource.find(x => x.items.find(d => d.UUID === changeRows[0].UUID));
    if (selected) {
      childArr = childArr.concat(changeRows.map(item => item.UUID));
      parentArr.push(parentRow.UUID);
    } else {
      childArr = childArr.filter(item => !changeRows.some(e => e.UUID === item));
      parentArr.splice(parentArr.findIndex(item => item === parentRow.UUID), 1);
    }
    //设置父，子的SelectedRowKeys
    this.setState({ selectedRowKeys: parentArr, childSelectedRowKeys: childArr });
  };

  //表格行点击事件
  onClickRow = record => {
    this.onParentSelectChange(record, this.state.selectedRowKeys.indexOf(record.UUID) == -1);
  };

  //子表格行点击事件
  onChildClickRow = record => {
    const { selectedRowKeys, childSelectedRowKeys } = this.state;
    const { dataSource } = this.props;
    const selected = childSelectedRowKeys.indexOf(record.UUID) == -1;
    //找到子Table对应的父Table的所在行
    const parentRow = dataSource.find(x => x.items.find(d => d.UUID === record.UUID));
    let selectedRows = parentRow.items.filter(
      item => childSelectedRowKeys.indexOf(item.UUID) != -1
    );
    selected
      ? selectedRows.push(record)
      : selectedRows.splice(parentRow.items.findIndex(x => x.UUID == record.UUID), 1);
    this.onChildSelectChange(record, selected, selectedRows);
  };

  render() {
    const {
      scrollY,
      rowSelect,
      pagination,
      columns,
      nestColumns,
      childTable,
      dataSource,
    } = this.props;
    const { selectedRowKeys, childSelectedRowKeys } = this.state;
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
          rowSelection={rowSelect ? childRowSelection : ''}
          columns={nestColumns}
          size="small"
          rowKey={record => (record.UUID ? record.UUID : 'nestKey')}
          dataSource={mainRecord.items ? mainRecord.items : []}
          onRowClick={rowSelect ? this.onChildClickRow : ''}
          indentSize={10}
          scroll={{ y: false }}
          pagination={false}
        />
      );
    };
    return (
      <Table
        rowSelection={rowSelect ? parentRowSelection : ''}
        columns={columns}
        size="small"
        rowKey={record => record.UUID}
        dataSource={dataSource}
        onRowClick={rowSelect ? this.onClickRow : ''}
        expandedRowRender={childTable ? record => expandedRowRender(record) : ''}
        pagination={pagination || false}
        className={cardTableStyle.orderTable}
        scroll={{ y: scrollY, x: true }}
      />
    );
  }
}
