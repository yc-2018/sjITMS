/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-09-27 12:26:40
 * @Description: 可伸缩表格
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\DispatchingTable.js
 */
import React, { Component } from 'react';
import { Resizable } from 'react-resizable';
import { Table, Row, Col } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import RyzeSettingDrowDown from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeSettingDrowDown/RyzeSettingDrowDown';
import dispatchingTableStyles from './DispatchingTable.less';
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

export default class DispatchingTable extends Component {
  state = { columns: this.props.columns };

  components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  //表格行点击选中
  onClickRow = record => {
    if (this.props.clickRow == undefined) return;
    const { selectedRowKeys } = this.props;
    const index = this.props.selectedRowKeys.indexOf(record.uuid);
    index == -1 ? selectedRowKeys.push(record.uuid) : selectedRowKeys.splice(index, 1);
    this.props.changeSelectRows(selectedRowKeys);
  };

  onChange = selectedRowKeys => {
    this.props.changeSelectRows(selectedRowKeys);
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    //排序
    let { dataSource } = this.props;
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
    this.props.refreshDataSource(dataSource, pagination, sorter);
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

  //更新列配置
  setColumns = (columns, index, width) => {
    this.columnsSetting.handleWidth(index, width);
    this.setState({ columns });
  };

  render() {
    const { selectedRowKeys } = this.props;
    const rowSelection = selectedRowKeys
      ? {
          selectedRowKeys,
          onChange: this.onChange,
        }
      : undefined;
    const columns = this.state.columns.map((col, index) => ({
      ...col,
      onHeaderCell: column => ({
        width: column.width,
        onResize: this.handleResize(index),
      }),
    }));

    return (
      <div style={{ position: 'relative' }}>
        {this.props.topBar}
        <Row>
          <Col span={20}>{this.props.settingColumnsBar}</Col>
          <Col span={4}>
            <RyzeSettingDrowDown
              comId={this.props.comId + 'SettingColumns'}
              noToolbarPanel={this.props.noToolbarPanel}
              columns={this.props.columns}
              getNewColumns={this.setColumns}
              onRef={ref => (this.columnsSetting = ref)}
            />
          </Col>
        </Row>
        <Table
          {...this.props}
          loading={{
            spinning: this.props.loading,
            indicator: LoadingIcon('default'),
          }}
          size="small"
          components={this.components}
          rowClassName={record => {
            if (record.clicked) {
              return 'clickedStyle';
            }
          }}
          columns={columns}
          onRowClick={this.props.onClickRow || this.onClickRow}
          onChange={this.handleStandardTableChange}
          rowKey={record => record.uuid}
          rowSelection={rowSelection}
          bodyStyle={{ height: this.props.scrollY }}
          scroll={{ y: this.props.scrollY, x: '100%' }}
          className={this.props.className || dispatchingTableStyles.dispatchingTable}
        />
      </div>
    );
  }
}
