/*
 * @Author: guankongjin
 * @Date: 2022-05-12 16:10:30
 * @LastEditors: guankongjin
 * @LastEditTime: 2023-03-22 08:20:16
 * @Description: 可伸缩表格
 * @FilePath: \iwms-web\src\pages\SJTms\Dispatching\DispatchingTable.js
 */
import React, { Component } from 'react';
import { Resizable } from 'react-resizable';
import { Table, Row, Col, Tooltip } from 'antd';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import RyzeSettingDrowDown from '@/pages/Component/RapidDevelopment/CommonLayout/RyzeSettingDrowDown/RyzeSettingDrowDown';
import dispatchingTableStyles from './DispatchingTable.less';
import { orderBy, uniqBy } from 'lodash';
import { guid } from '@/utils/utils';
import ReactDOM from 'react-dom';

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
  state = { columns: this.props.columns, lastIndex: undefined };

  components = {
    header: {
      cell: ResizeableTitle,
    },
  };

  //表格行点击选中
  onClickRow = (record, index, event) => {
    //整体选择逻辑 参考EXCEL中的选择逻辑
    if (this.props.clickRow == undefined) return;
    const { selectedRowKeys, dataSource } = this.props;
    let { lastIndex } = this.state;
    let rowKeys = [...selectedRowKeys];
    let rowKeysShift = [];
    let allRowKeys = [...dataSource].map(x => x.uuid);
    const indicatrix = rowKeys.indexOf(record.uuid);
    const selected = indicatrix == -1;
    if (event.ctrlKey) {
      selected ? rowKeys.push(record.uuid) : rowKeys.splice(indicatrix, 1);
      rowKeys = uniqBy(rowKeys);
      this.props.changeSelectRows(rowKeys);
      //ctrl后保留之前选中
      dataSource.filter(e => rowKeys.indexOf(e.uuid) != -1).map(x => (x.isCtrl = true));
    } else if (event.shiftKey && lastIndex >= 0) {
      //shift选择时 保留ctrl选择的record
      let ctrlRowKeys = dataSource.filter(e => e.isCtrl).map(x => x.uuid);
      allRowKeys =
        index > lastIndex
          ? allRowKeys.filter((_, i) => i >= lastIndex && i <= index)
          : allRowKeys.filter((_, i) => i >= index && i <= lastIndex);

      //拼接ctrlKeys与allRowKeys
      rowKeysShift = rowKeysShift.concat(allRowKeys).concat(ctrlRowKeys);
      rowKeysShift = uniqBy(rowKeysShift);

      this.props.changeSelectRows(rowKeysShift);
    } else {
      //单点时 去除除该条外的所有ctrl记录
      dataSource.filter(e => e.isCtrl).map(x => (x.isCtrl = false));
      record.isCtrl = true;
      rowKeys = [record.uuid];
      rowKeys = uniqBy(rowKeys);
      this.props.changeSelectRows(rowKeys);
    }

    if (!event.shiftKey) {
      this.setState({ lastIndex: index });
    }

    if (this.props.onClickRow) {
      this.props.onClickRow(record, index, event);
    }
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

  //table列数据超长了才显示
  refreshColumns = columns => {
    columns.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          let comId = guid();
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            },
            id: comId,
            onMouseEnter: event => {
              const spanEl = document.getElementById(comId);
              let clientWidth = spanEl.clientWidth;
              let scrollWidth = spanEl.scrollWidth;

              if (clientWidth < scrollWidth) {
                if (spanEl.innerHTML.indexOf('hastooltip') > -1) {
                  return;
                }

                let targetEl = spanEl;
                while (targetEl.childElementCount > 0) {
                  targetEl = targetEl.firstElementChild;
                }
                var html = { __html: targetEl.innerHTML };
                ReactDOM.render(
                  <Tooltip placement="topLeft" title={targetEl.innerText}>
                    <span id={'hastooltip'} dangerouslySetInnerHTML={html} />
                  </Tooltip>,
                  targetEl
                );
              }
            },
          };
        };
      }
    });
  };

  render() {
    // this.refreshColumns(this.props.columns);

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
      <div style={{ position: 'relative', userSelect: 'none' }}>
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
            if (record.warning) {
              return 'warningStyle';
            }
            if (record.clicked) {
              return 'clickedStyle';
            }
            if (record.orderType == 'DeliveryAgain' && this.props.comId == 'pendingOrder') {
              return 'warningStyle';
            }
          }}
          columns={columns}
          // onRowClick={this.props.onClickRow || this.onClickRow}
          onRowClick={this.onClickRow}
          onChange={this.handleStandardTableChange}
          rowKey={record => record.uuid}
          rowSelection={rowSelection}
          bodyStyle={{ height: this.props.scrollY }}
          scroll={{ y: this.props.scrollY, x: '100%' }}
          className={this.props.className || dispatchingTableStyles.dispatchingTable}
          onRow={record => {
            return {
              onDoubleClick: event => {
                this.props.onDoubleClick ? this.props.onDoubleClick(record) : '';
              },
            };
          }}
        />
      </div>
    );
  }
}
