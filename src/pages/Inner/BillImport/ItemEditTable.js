import React, { PureComponent } from 'react';
import { Input, message, Modal, Table } from 'antd';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import { itemColWidth } from '@/utils/ColWidth';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import IconFont from '@/components/IconFont';
import EFormPanel from '@/pages/Component/Form/EFormPanel';
import style from './ItemEditTable.less';

/**
 * 单据明细编辑表格，自带新增一行、删除一行、批量删除功能
 * 如果新增一行时有需要初始化的值可通过传入属性newMember来自定义新增方法，也可在列渲染的时候当该列为空时给默认值
 * 明细列自带：行号、备注，调用者不用关心这些列
 * 调用者传入data属性，展示表格初始行，并提供fieldChange方法监控每个列输入框的变化，实时渲染表格
 * 默认无操作列
 *
 * 调入者传入 notNote 则不显示备注列
 * @param {string} title: 头部信息
 * @param {Object} scroll: 滚动
 * @param {boolean} notNote: 不显示备注列
 * @param {boolean} noAddandDelete： 操作列的删除?
 * @param {boolean} noNewMember： 无新增一行
 * @param {function} drawBatchButton: 绘制批量按钮
 * @param {function} drawTotalInfo:  绘制总信息
 * @param {function} drawOther: 绘制其他
 * @param {Object[]} columns: 列属性
 * @param {Object[]} data: 实际数据
 * @param {function} batchAdd: 批量添加功能
 * @param {function} handleRemove: 删除行
 * @param {function} newMember: 新加一行有需要初始化的值传入，也可在列渲染的时候当该列为空时给默认值
 * @param {function} handlebatchAddVisible: 批量添加 Modal 显示隐藏功能
 */
export default class ItemEditTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedRows: props.selectedRows ? props.selectedRows : [],
      selectedRowKeys: props.selectedRowKeys ? props.selectedRowKeys : [],
      data: props.data,
      infinityData: [],
      index: 0,
      current: 1,
    };
  }

  rowSelectionChange = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows: [...selectedRows],
      selectedRowKeys: selectedRowKeys,
    });
    if (this.props.rowSelection)
      this.props.rowSelection(selectedRowKeys, selectedRows);
  };

  rowSelection = {
    columnWidth: 50,
    onChange: (selectedRowKeys, selectedRows) => this.rowSelectionChange(selectedRowKeys, selectedRows),
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
    });
    if (nextProps.selectedRows && (nextProps.selectedRows.length == 0 && this.state.selectedRows.length != 0)) {
      this.setState({
        // selectedRows: nextProps.selectedRows ? nextProps.selectedRows : [],
        selectedRowKeys: nextProps.selectedRowKeys ? nextProps.selectedRowKeys : [],
      });
    }
  }

  batchAdd = () => {
    this.props.handlebatchAddVisible();
  };

  batchRemove = () => {
    const { selectedRows, selectedRowKeys, data, index } = this.state;
    if (selectedRowKeys.length === 0) {
      message.warn('请先选择要删除行！');
      return;
    }
    this.props.batchRemove ? this.props.batchRemove() :
      Modal.confirm({
        title: '是否要删除选择行？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          if (this.props.batchRemove) {
            this.props.batchRemove(selectedRowKeys);
            this.setState({
              selectedRows: [],
              selectedRowKeys: [],
            });
          } else {
            let flag = false;
            for(let i = 0; i < selectedRows.length; i++) {
              if (selectedRows[i].notNull) {
                flag = true;
                message.error(`明细第${selectedRows[i].line}行单据字段不允许为空，不能删除`);
                break;
              }
            }
            if(flag) return;
            if(!flag) {
              for (let i = data.length - 1; i >= 0; i--) {
                if (selectedRowKeys.indexOf(data[i].line) >= 0) {
                  data.splice(i, 1);
                }
              }
            }
            for (let i = 0; i < data.length; i++) {
              data[i].line = i + 1;
            }
            this.props.handleRemove && this.props.handleRemove(data);
            this.setState({
              data: data,
              index: index + 1,
              selectedRows: [],
              selectedRowKeys: [],
            });
          }
        },
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
      unAdd: true,
      remove: true
    });
    this.setState({
      data: data,
      index: index + 1
    });
    this.props.onTableChange();
  };

  handleFieldChange = (e, field, line) => {
    const { data, index } = this.state;
    data[line - 1][field] = e.target.value;
    this.setState({
      data: data,
      index: index + 1,
    });
  };

  buildColumns = () => {
    const { columns } = this.props;
    this.refreshColumns(columns);
    if (columns[columns.length - 1].key === 'note') {
      return columns;
    }

    if (!columns.find(item => item.key === 'line')) {
      columns.unshift(
        {
          title: commonLocale.lineLocal,
          dataIndex: 'line',
          key: 'line',
          width: 100,
          render: (text, record, index) => <span>{record.line}</span>,
        },
      );
    }
    return columns;
  };

  getTotalWidth = (columns) => {
    let totalWidth = 0;
    columns.forEach(e => {
      if (e.key !== 'action' && e.width) {
        totalWidth = totalWidth + e.width;
      }
    });

    return totalWidth;
  };

  handleFetch = () => {
    if (!this.state.data)
      return;

    let startIndex = this.state.infinityData.length;
    if (startIndex >= this.state.data.length)
      return;

    let infinityData = this.state.infinityData;
    let newData = this.state.data.slice(startIndex, startIndex + 10);

    this.setState({
      infinityData: infinityData.concat(newData),
    });
  };

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
              cursor: 'pointer',
            },
          };
        };
      }
    });
  };

  onChange = page => {
    this.setState({
      current: page.current,
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const data = this.state.data;
    if (sorter && sorter.order && sorter.columnKey) {
      data.sort(function(a, b) {
        if (sorter.order === 'ascend') {
          if (!a[sorter.columnKey]) {
            return -1;
          }
          if (a[sorter.columnKey].localeCompare) {
            return a[sorter.columnKey].localeCompare(b[sorter.columnKey]);
          }
          return a[sorter.columnKey] - b[sorter.columnKey];
        } else {
          if (!b[sorter.columnKey]) {
            return -1;
          }
          if (b[sorter.columnKey].localeCompare) {
            return b[sorter.columnKey].localeCompare(a[sorter.columnKey]);
          }
          return b[sorter.columnKey] - a[sorter.columnKey];
        }
      });
      this.setState({
        data: [...data]
      });
    }
    this.setState({
      current: pagination.current
    });
  };

  drawFormRows = () => {
    const { data, selectedRows  } = this.state;
    this.rowSelection.selectedRowKeys = this.state.selectedRowKeys;
    let rMargin = 100 + parseInt(data.length / 10) * 24 + 'px';
    let waveTotal = <div
      style={{
        float: 'right',
        marginTop: '-40px',
        marginRight: rMargin,
      }}>共 {data.length} 条</div>;
    const ncolumns = this.buildColumns();
    const columns = [];
    ncolumns.forEach(e => {
      columns.push({ ...e });
    });
    const tableElement = document.getElementById('editTable');
    const pos = tableElement ? tableElement.getBoundingClientRect() : {};
    let totalWidth = this.getTotalWidth(ncolumns);
    let tableWidth = tableElement ? tableElement.offsetWidth : 0;
    let noteWidth = 0;
    if (!this.props.notNote) {
      noteWidth = itemColWidth.noteEditColWidth;
    }
    // y 轴滚动
    let scroll = {};
    const footerElement = document.getElementById('footer');
    const footerPos = footerElement ? footerElement.getBoundingClientRect() : {};
    let height = footerPos.top - pos.top - 90;
    let dataHeight = data ? (data.length <= 10 ? data.length : 10) * 50 : 0;
    if (dataHeight > height) {
      scroll.y = height < 30 ? 30 : height - 40;
    }
    // x 轴滚动与自适应宽度
    if ((totalWidth > tableWidth || (totalWidth + noteWidth) > tableWidth) && tableWidth > 0) {
      scroll.x = (totalWidth + noteWidth);
    } else {
      let moreWidth = tableWidth - totalWidth - noteWidth;
      let newTotalWidth = 0;
      ncolumns.forEach(e => {
        if (e.key === 'action' || e.key === 'line' || e.title === commonLocale.operateLocale
          || e.key === commonLocale.lineLocal) {
          totalWidth = totalWidth - e.width;
          newTotalWidth = newTotalWidth + e.width;
        }
      });
      for (let idx = ncolumns.length - 1; idx >= 0; idx--) {
        if (ncolumns[idx].key === 'action' || ncolumns[idx].key === 'line' ||
          ncolumns[idx].title === commonLocale.operateLocale ||
          ncolumns[idx].title === commonLocale.lineLocal) {
          continue;
        }

        let newWidth = ncolumns[idx].width + ncolumns[idx].width / totalWidth * moreWidth;
        if (newWidth + newTotalWidth > tableWidth) {
          ncolumns[idx].width = tableWidth - newTotalWidth;
        } else {
          ncolumns[idx].width = newWidth;
        }

        newTotalWidth = newTotalWidth + ncolumns[idx].width;
      }
    }
    let pagination = {
      pageSize: 10,
      current: this.state.current,
      total: data.length,
      size: 'small',
    };
    let showToolbar = !this.props.noAddandDelete || this.props.onlyAdd || this.props.batchAdd || this.props.drawBatchButton || this.props.drawTotalInfo;
    let addItemIcon = <a onClick={this.newMember}>
      <IconFont type='icon-add2'
                style={{ fontSize: '16px', position: 'relative', top: '1px' }}/>&nbsp;{commonLocale.addItemLocal}
    </a>;
    let batchRemoveIcon = <a onClick={this.batchRemove}>
      <IconFont type='icon-remove'
                style={{ fontSize: '16px', position: 'relative', top: '1px' }}/>&nbsp;{commonLocale.batchRemoveLocale}
    </a>;
    let batchAddIcon = <a onClick={this.batchAdd}>
      <IconFont type='icon-add_batch'
                style={{ fontSize: '16px', position: 'relative', top: '1px' }}/>&nbsp;{commonLocale.batchAddDataLocale}
    </a>;
    return (
      <div id="editTable" className={style.itemEditTable}>
        {showToolbar &&
        <ToolbarPanel>
          <div className={style.toolbarIcon} style={{ float: 'left' }}>
            {this.props.batchAdd ? null : ((this.props.noAddandDelete && !this.props.onlyAdd) ? null : addItemIcon)}
            {this.props.batchAdd ? batchAddIcon : null}&nbsp;&nbsp;&nbsp;
            {!this.props.noAddandDelete && batchRemoveIcon}&nbsp;&nbsp;&nbsp;
            {this.props.drawBatchButton && this.props.drawBatchButton(this.state.selectedRowKeys)}&nbsp;&nbsp;&nbsp;
            {this.props.drawOther && this.props.drawOther()}
          </div>
          <div style={{ float: 'right' }}>
            {this.props.drawTotalInfo && this.props.drawTotalInfo()}
          </div>&nbsp;
        </ToolbarPanel>
        }
        <Table
          rowSelection={!this.props.unShowRow ? this.rowSelection : ''}
          rowKey={record => record.line}
          columns={ncolumns}
          dataSource={data}
          onChange={this.handleStandardTableChange}
          pagination={pagination}
          scroll={this.props.scroll ? this.props.scroll : scroll}
          size='middle'
          selectedRows={selectedRows}
          onkeyDown={this.newMember}
        />
        {
          this.props.batchAdd ? waveTotal : null
        }
      </div>
    );
  };

  render() {
    return (
      <EFormPanel
        title={this.props.title}
        drawFormRows={this.drawFormRows()}
        drawOther={this.props.drawOther}
      />
    );
  }
}
