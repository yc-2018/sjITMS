import { Table, Button, message, Input, Icon, Popconfirm, Modal } from 'antd';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React from 'react';
import update from 'immutability-helper';
import { connect } from 'dva';
import { Fragment } from 'react';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { element } from 'prop-types';
import { shipPlanBillLocale } from './ShipPlanBillLocale';
import Highlighter from 'react-highlight-words';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { ShipPlanType } from './ShipPlanBillContants';
import QtyStrInput from '@/pages/Component/Form/QtyStrInput';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import { placeholderLocale, commonLocale } from '@/utils/CommonLocale';
import ShipPlanBillItemTableTitle from './ShipPlanBillItemTableTitle';
import style from '../../Component/Form/ItemEditTable.less';
import IconFont from '@/components/IconFont';

let dragingIndex = -1;

class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let className = restProps.className;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />),
    );
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    if (dragIndex === hoverIndex) {
      return;
    }

    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow),
);


@connect(({ shipplanbill, loading }) => ({
  shipplanbill,
  loading: loading.models.shipplanbill,
}))
export default class ShipPlanBillItemTable extends React.Component {
  state = {
    data: [],
    selectedRowKeys: [],
    selectedRows: [],
    lineUuid: '',
    searchText: '',
    lineEntity: {},
    index: 0
  };

  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.shipplanbill.entity) {
      if (nextProps.shipplanbill.entity.items) {
        nextProps.shipplanbill.entity.items.forEach(function (item, index) {
          item.line = index + 1;
        })
      }
      this.setState({
        data: nextProps.shipplanbill.entity.items ? nextProps.shipplanbill.entity.items : [],
        selectedRowKeys: [],
        selectedRows: [],
        lineUuid: nextProps.shipplanbill.lineUuid,
        lineEntity: nextProps.shipplanbill.lineEntity,
      });
    }
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state;
    const dragRow = data[dragIndex];

    this.setState(
      update(this.state, {
        data: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),


    );

    this.refreshItems();
  };


  refreshItems() {
    const { data } = this.state;

    let items = [];
    data.forEach(function (item) {
      if (item.shipPlanType && item.fromOrg && item.toOrg)
        items.push(item);
    });

    items.forEach(function (item, index) {
      item.shipOrder = index + 1;
    });
    this.props.onRefreshItems(items);
  }

  handleSelectRows = (keys, rows) => {
    this.setState({
      selectedRows: rows,
      selectedRowKeys: keys,
    });
  };

  newMember = () => {
    if (this.props.newMember) {
      this.props.newMember();
      return;
    }

    const { data, index } = this.state;
    data.push({
      line: data.length + 1,
      shipOrder: data.length + 1
    });
    this.setState({
      data: data,
      index: index + 1
    });
  }

  save = () => {
    const { data } = this.state;

    const result = this.props.validItems(data);
    if (!result)
      return;
    this.refreshItems();
  }

  remove = (line) => {
    const { data, index } = this.state;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].line === line) {
        data.splice(i, 1);
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i].line = i + 1;
    }

    this.setState({
      data: data,
      index: index + 1
    });

    this.refreshItems();
  }

  batchRemove = () => {
    const { selectedRowKeys, data, index } = this.state;
    if (selectedRowKeys.length === 0) {
      message.warn('请先选择要删除行！');
      return;
    }
    this.props.batchRemove ? this.props.batchRemove(selectedRowKeys) :
      Modal.confirm({
        title: '是否要删除选择行？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          for (let i = data.length - 1; i >= 0; i--) {
            if (selectedRowKeys.indexOf(data[i].uuid) >= 0) {
              data.splice(i, 1);
            }
          }

          for (let i = 0; i < data.length; i++) {
            data[i].line = i + 1;
          }

          this.setState({
            data: data,
            index: index + 1,
            selectedRows: [],
            selectedRowKeys: []
          });

          this.refreshItems();
        }
      });
  }

  handleFieldChange = (e, field, line) => {
    const { data, index } = this.state;
    data[line - 1][field] = e.target.value;
    this.setState({
      data: data,
      index: index + 1
    });
  }

  getTotalWidth = (columns) => {
    let totalWidth = 0;
    columns.forEach(e => {
      if (e.key !== 'action' && e.width) {
        totalWidth = totalWidth + e.width;
      }
    });

    return totalWidth;
  }


  buildColumns = () => {

    const { columns } = this.props;

    if (columns[columns.length - 1].key === 'action') {
      return columns;
    }

    if (this.props.isRemove == false && this.props.isAdd == false)
      return columns;

    columns.push(
      {
        title: '操作',
        key: 'action',
        width: itemColWidth.operateColWidth,
        fixed: 'right',
        render: (text, record) => {
          return (
            <span>
							{
                !record.uuid || this.props.isRemove ?
                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.props.remove ? this.props.remove(record.line) : this.remove(record.line)}>
                    <a>{commonLocale.deleteLocale}</a>
                  </Popconfirm> : null
              }
              {
                !record.uuid && this.props.isAdd ?
                  <span>
										&nbsp;&nbsp;
                    <a onClick={() => this.save()}>保存</a>
									</span> : null
              }
						</span>

          );
        },
      });

    return columns;
  }

  refreshColumns = (columns) => {
    columns.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }
          }
        }
      }
    });
  }

  rowSelection = {
    columnWidth: 40,
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows: selectedRows,
        selectedRowKeys: selectedRowKeys
      });
    }
  };

  render() {
    const { data } = this.state;
    this.rowSelection.selectedRowKeys = this.state.selectedRowKeys;
    // let addButton = <Button
    //   style={{ width: '100%', marginTop: 5, marginBottom: 5 }}
    //   type="dashed"
    //   onClick={this.newMember}
    //   icon="plus">新增任务</Button>;

    const columns = this.buildColumns();
    const tableElement = document.getElementById("editTable");
    const pos = tableElement ? tableElement.getBoundingClientRect() : {};
    let totalWidth = this.getTotalWidth(columns);
    const tableWidth = tableElement ? tableElement.offsetWidth : 0;
    let scroll = {};
    let noteWidth = 0;
    if (!this.props.notNote) {
      noteWidth = itemColWidth.noteEditColWidth;
    }
    if (totalWidth > tableWidth || (totalWidth + noteWidth) > tableWidth) {
      scroll = { x: (totalWidth + noteWidth) };
    }
    const footerElement = document.getElementById('footer');
    const footerPos = footerElement ? footerElement.getBoundingClientRect() : {};
    let height = footerPos.top - pos.top - 90;
    let dataHeight = data ? (data.length <= 10 ? data.length : 10) * 50 : 0;
    if (dataHeight > height) {
      scroll.y = height < 30 ? 30 : height - 40;
    }

    this.refreshColumns(columns);
    let addItemIcon = <a onClick={this.newMember}>
      <IconFont type='icon-add2'
                style={{ fontSize: '16px', position: 'relative', top: '1px' }}/>&nbsp;{commonLocale.addItemLocal}
    </a>;
    let batchRemoveIcon = <a onClick={this.batchRemove}>
      <IconFont type='icon-remove'
                style={{ fontSize: '16px', position: 'relative', top: '1px' }}/>&nbsp;{commonLocale.batchRemoveLocale}
    </a>;
    let ret = (
      <div id="editTable" className={style.itemEditTable}>
        {this.props.title && <ShipPlanBillItemTableTitle title={this.props.title} />}
            <ToolbarPanel>
              {this.props.isAdd ? addItemIcon : null}
              {this.props.isRemove && batchRemoveIcon}
            </ToolbarPanel>
        <Table
          columns={columns}
          dataSource={data}
          components={this.components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
          })}
          rowSelection={this.rowSelection}
          rowKey={record => record.uuid}
          scroll={this.props.scroll ? this.props.scroll : scroll}
          size='middle'
        />
      </div>
    );
    return (
      <DndProvider backend={HTML5Backend}>
        {ret}
      </DndProvider>
    );
  }
}
