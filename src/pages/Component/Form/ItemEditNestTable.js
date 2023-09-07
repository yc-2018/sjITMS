import React, { PureComponent, Fragment } from 'react';
import { Button, Table, Popconfirm, Input, message, Modal } from 'antd';
import FormTitle from '@/pages/Component/Form/FormTitle';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import { itemColWidth } from '@/utils/ColWidth';
import { placeholderLocale, commonLocale } from '@/utils/CommonLocale';
// import NestTable from '@/pages/In/Preview/NestTable';
import style from './ItemEditTable.less';

/**
 * 单据明细编辑表格，自带新增一行、删除一行、批量删除功能
 * 如果新增一行时有需要初始化的值可通过传入属性newMember来自定义新增方法，也可在列渲染的时候当该列为空时给默认值
 * 明细列自带：行号、备注、操作列，调用者不用关心这些列
 * 调用者传入data属性，展示表格初始行，并提供fieldChange方法监控每个列输入框的变化，实时渲染表格
 * 调入者传入 notNote 则不显示备注列
 */
export default class ItemEditNestTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      pageSize: 10,
      columns: props.columns ? props.columns : [],
      nestColumns: props.nestColumns ? props.nestColumns : [],
      selectedRows: props.selectedRows ? props.selectedRows : [],
      selectedRowKeys: props.selectedRowKeys ? props.selectedRowKeys : [],
      data: props.data,
      infinityData: [],
      index: 0,
      selectedRowForNest: {},
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
    });
    if (
      nextProps.selectedRows &&
      (nextProps.selectedRows.length == 0 && this.state.selectedRows.length != 0)
    ) {
      this.setState({
        selectedRows: nextProps.selectedRows ? nextProps.selectedRows : [],
        selectedRowKeys: nextProps.selectedRowKeys ? nextProps.selectedRowKeys : [],
      });
    }
  }

  onSelectRowForNest = (rows, keys, mainRecord) => {
    let groupbyName = this.props.nestGroupbyName;
    const { selectedRowForNest } = this.state;
    if (rows.length != 0) {
      selectedRowForNest[rows[0][groupbyName]] = rows;
    } else {
      delete selectedRowForNest[mainRecord.orderBillNumber];
    }

    this.setState({
      selectedRowForNest: selectedRowForNest,
    });
    this.props.onSelectRowForNest && this.props.onSelectRowForNest(selectedRowForNest);
  };

  batchAdd = () => {
    this.props.handlebatchAddVisible();
  };

  getTotalWidth = columns => {
    let totalWidth = 0;
    columns.forEach(e => {
      if (e.key !== 'action' && e.width) {
        totalWidth = totalWidth + e.width;
      }
    });

    return totalWidth;
  };

  refreshColumns = columns => {
    columns.forEach(e => {
      if (e.width) {
        e.onCell = () => {
          return {
            style: {
              maxWidth: e.width,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            },
          };
        };
      }
    });
  };

  getPageData = () => {
    const { page, pageSize } = this.state;
    const data = this.props.data;
    let pageData = [];
    let end = (page + 1) * pageSize;
    if (data.length < end) {
      end = data.length;
    }
    for (let i = page * pageSize; i < end; i++) {
      pageData.push(data[i]);
    }
    const pagination = {
      total: data.length,
      pageSize: pageSize,
      current: page + 1,
      showTotal: total => `共 ${total} 条`,
    };
    return {
      list: pageData,
      pagination: this.props.noPagination ? null : pagination,
    };
  };

  render() {
    const { data, columns, nestColumns, selectedRowKeys, selectedRows } = this.state;

    let rMargin = 100 + parseInt(data.length / 10) * 24 + 'px';
    let waveTotal = (
      <div style={{ float: 'right', marginTop: '-40px', marginRight: rMargin }}>
        共&nbsp;&nbsp;
        {data.length}
        &nbsp;&nbsp;条
      </div>
    );

    const tableElement = document.getElementById('editTable');
    let totalWidth = this.getTotalWidth(columns);
    const tableWidth = tableElement ? tableElement.offsetWidth : 0;

    let noteWidth = 0;
    if (!this.props.notNote) {
      noteWidth = itemColWidth.noteEditColWidth;
    }
    let scroll;
    if (totalWidth > tableWidth || totalWidth + noteWidth > tableWidth) {
      scroll = { x: totalWidth + noteWidth };
    }
    this.refreshColumns(columns);
    return (
      <div id="editTable" className={style.itemEditTable}>
        {this.props.title && <FormTitle title={this.props.title} />}
        {(!this.props.noAddandDelete ||
          this.props.batchAdd ||
          this.props.drawBatchButton ||
          this.props.drawTotalInfo) && (
          <ToolbarPanel>
            <div style={{ float: 'left' }}>
              {this.props.drawBatchButton && this.props.drawBatchButton(this.state.selectedRowKeys)}
            </div>
            &nbsp;
          </ToolbarPanel>
        )}
        {/* <NestTable
          nestRowSelect={this.props.nestRowSelect}
          rowKey={record => record.uuid ?  record.uuid : record.line}
          unShowRow={true}
          columns={columns}
          nestColumns={nestColumns}
          selectedRows={[]}
          onSelectRowForNest={this.onSelectRowForNest}
          data={this.props.hasPagination ? this.props.data : this.getPageData()}
          noPagination
          scroll={this.props.scroll ? this.props.scroll : scroll}
          size='middle'
        /> */}
        {/* } */}
        {this.props.batchAdd
          ? null
          : this.props.noAddandDelete
            ? null
            : this.props.noAddButton
              ? null
              : button}
        {this.props.batchAdd ? waveTotal : null}
      </div>
    );
  }
}
