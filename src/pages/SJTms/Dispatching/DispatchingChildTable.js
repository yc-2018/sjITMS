/*
 * @Author: guankongjin
 * @Date: 2022-04-01 08:43:48
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-07-20 14:10:38
 * @Description: 嵌套子表格组件
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\DispatchingChildTable.js
 */
import React, { Component } from 'react';
import { Resizable } from 'react-resizable';
import { Table, Row, Col } from 'antd';
import dispatchingTableStyles from './DispatchingTable.less';
import RyzeSettingDrowDown from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeSettingDrowDown/RyzeSettingDrowDown';
import { orderBy } from 'lodash';

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

export default class DispatchingChildTable extends Component {
  state = { columns: [...this.props.columns], nestColumns: [...this.props.nestColumns] };

  components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  //表格选择
  onParentSelectChange = (record, selected) => {
    const { dataSource, selectedRowKeys, childSelectedRowKeys, changeSelectRows } = this.props;
    let patentArr = [...selectedRowKeys];
    let childArr = childSelectedRowKeys ? [...childSelectedRowKeys] : [];
    //选中行下的所有子选项
    const details = dataSource.find(d => d.uuid === record.uuid).details;
    let setChildArr = details ? details.map(item => item.uuid) : [];
    if (selected) {
      //父Table选中，子Table全选中
      patentArr.push(record.uuid);
      childArr = childArr.concat(setChildArr);
    } else {
      //父Table取消选中，子Table全取消选中
      patentArr.splice(patentArr.findIndex(item => item === record.uuid), 1);
      childArr = childArr.filter(item => !setChildArr.some(e => e === item));
    }
    //设置父，子的SelectedRowKeys
    changeSelectRows({ selectedRowKeys: patentArr, childSelectedRowKeys: childArr });
  };

  //表格全选
  onParentSelectAll = (selected, selectedRows, changeRows) => {
    const { selectedRowKeys, childSelectedRowKeys, changeSelectRows } = this.props;
    let patentArr = [...selectedRowKeys];
    let childArr = childSelectedRowKeys ? [...childSelectedRowKeys] : [];
    if (selected) {
      //父Table选中，子Table全选中，设置子Table的SelectedRowKeys
      patentArr = patentArr.concat(changeRows.map(item => item.uuid));
      changeRows.forEach(row => {
        childArr = childArr.concat(row.details.map(item => item.uuid));
      });
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

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { dataSource } = this.props;
    //排序
    if (sorter.field && this.props.refreshDataSource && sorter.column) {
      const sortType = sorter.order === 'descend' ? 'desc' : 'asc';
      dataSource = orderBy(
        dataSource,
        sorter.column.sorterCode
          ? x => (x[sorter.field] ? x[sorter.field].code : '')
          : [sorter.field],
        [sortType]
      );
    }
    this.props.refreshDataSource(dataSource);
  };

  //修改宽度
  handleResize = index => (_, { size }) => {
    const nextColumns = [...this.state.columns];
    nextColumns[index] = {
      ...nextColumns[index],
      width: size.width,
    };
    this.setColumns(nextColumns, index, size.width);
  };

  //修改子表格宽度
  handleChildResize = index => (_, { size }) => {
    const nextColumns = [...this.state.nestColumns];
    nextColumns[index] = {
      ...nextColumns[index],
      width: size.width,
    };
    this.props.childSettingCol
      ? this.setChildColumns(nextColumns, index, size.width)
      : this.setState({ nestColumns: nextColumns });
  };

  //更新列配置
  setColumns = (columns, index, width) => {
    this.columnsSetting.handleWidth(index, width);
    this.setState({ columns });
  };

  setChildColumns = (nestColumns, index, width) => {
    this.childColumnsSetting.handleWidth(index, width);
    this.setState({ nestColumns });
  };

  render() {
    const { dataSource, selectedRowKeys, childSelectedRowKeys } = this.props;
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

    const columns = this.state.columns.map((col, index) => ({
      ...col,
      onHeaderCell: column => ({
        width: column.width,
        onResize: this.handleResize(index),
      }),
    }));

    const nestColumns = this.state.nestColumns.map((col, index) => ({
      ...col,
      onHeaderCell: column => ({
        width: column.width,
        onResize: this.handleChildResize(index),
      }),
    }));

    //子表格
    const expandedRowRender = mainRecord => {
      return (
        <div style={{ position: 'relative' }}>
          {this.props.childSettingCol ? (
            <RyzeSettingDrowDown
              comId={this.props.comId + 'ChildTableSettingColumns'}
              noToolbarPanel
              columns={this.props.nestColumns}
              getNewColumns={this.setChildColumns}
              onRef={ref => (this.childColumnsSetting = ref)}
            />
          ) : (
            <></>
          )}
          <Table
            rowSelection={childSelectedRowKeys ? childRowSelection : ''}
            components={this.components}
            columns={nestColumns}
            size="small"
            rowKey={record => (record.uuid ? record.uuid : 'nestKey')}
            dataSource={mainRecord.details ? mainRecord.details : []}
            onRowClick={childSelectedRowKeys ? this.onChildClickRow : ''}
            indentSize={10}
            scroll={{ y: false }}
            pagination={false}
          />
        </div>
      );
    };
    return (
      <div style={{ position: 'relative' }}>
        {this.props.topBar}
        <Row>
          <Col span={20}>{this.props.settingColumnsBar}</Col>
          <Col span={4}>
            <RyzeSettingDrowDown
              comId={this.props.comId + 'TableSettingColumns'}
              noToolbarPanel={this.props.noToolbarPanel}
              columns={this.props.columns}
              getNewColumns={this.setColumns}
              onRef={ref => (this.columnsSetting = ref)}
            />
          </Col>
        </Row>
        <Table
          {...this.props}
          columns={columns}
          components={this.components}
          rowSelection={selectedRowKeys ? parentRowSelection : ''}
          size="small"
          rowKey={record => record.uuid}
          dataSource={dataSource}
          onRowClick={selectedRowKeys ? this.onClickRow : ''}
          onChange={this.handleStandardTableChange}
          expandedRowRender={record => expandedRowRender(record)}
          className={dispatchingTableStyles.dispatchingTable}
          style={{ height: this.props.scrollY }}
          bodyStyle={{ height: this.props.scrollY }}
          scroll={{ y: this.props.scrollY, x: '100%' }}
          footer={this.props.footer}
        />
      </div>
    );
  }
}
