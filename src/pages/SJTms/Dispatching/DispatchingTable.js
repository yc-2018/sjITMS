/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-05-17 11:50:49
 * @Description: 可伸缩表格
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\DispatchingTable.js
 */
import React, { Component } from 'react';
import { Resizable } from 'react-resizable';
import { Table } from 'antd';
import dispatchingTableStyles from './DispatchingTable.less';

const ResizeableTitle = props => {
  const { onResize, width, ...restProps } = props;

  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

export default class DispatchingTable extends Component {
  state = { columns: this.props.columns };
  components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  //表格行点击事件
  onClickRow = record => {
    if (this.props.clickRow == undefined) return;
    this.onSelectChange(record, this.props.selectedRowKeys.indexOf(record.uuid) == -1);
  };

  //选中一行
  onSelectChange = (record, selected) => {
    const { selectedRowKeys } = this.props;
    selected
      ? selectedRowKeys.push(record.uuid)
      : selectedRowKeys.splice(selectedRowKeys.findIndex(item => item == record.uuid), 1);
    this.props.changeSelectRows(selectedRowKeys);
  };

  //全选
  onSelectAll = (selected, selectedRows, changeRows) => {
    const { selectedRowKeys } = this.props;
    let newSelectedRowKeys = [...selectedRowKeys];
    selected
      ? (newSelectedRowKeys = newSelectedRowKeys.concat(changeRows.map(item => item.uuid)))
      : (newSelectedRowKeys = []);
    this.props.changeSelectRows(newSelectedRowKeys);
  };

  //修改宽度
  handleResize = index => (e, { size }) => {
    this.setState(({ columns }) => {
      const nextColumns = [...columns];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return { columns: nextColumns };
    });
  };

  render() {
    const { selectedRowKeys, pagination } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onSelect: this.onSelectChange,
      onSelectAll: this.onSelectAll,
    };
    const columns = this.state.columns.map((col, index) => ({
      ...col,
      onHeaderCell: column => ({
        width: column.width,
        onResize: this.handleResize(index),
      }),
    }));

    return (
      <Table
        {...this.props}
        size="small"
        components={this.components}
        rowClassName={record => {
          if (record.clicked) {
            return 'clickedStyle';
          }
        }}
        columns={columns}
        onRowClick={this.props.onClickRow || this.onClickRow}
        rowKey={record => record.uuid}
        rowSelection={rowSelection}
        style={{ height: this.props.scrollY }}
        bodyStyle={{ height: this.props.scrollY }}
        scroll={{ y: this.props.scrollY, x: '100%' }}
        className={dispatchingTableStyles.dispatchingTable}
      />
    );
  }
}
