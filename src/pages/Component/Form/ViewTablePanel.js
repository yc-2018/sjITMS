import React, { PureComponent } from 'react';
import styles from './ViewPanel.less';
import StandardTable from '@/components/StandardTable';
import { Button, Collapse, Input } from 'antd';
import { itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import { commonLocale } from '@/utils/CommonLocale';
import IconFont from '@/components/IconFont';
import { getValueByStrPaths } from '@/utils/utils';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';
import style from './ItemEditTable.less';

const Panel = Collapse.Panel;
/**
 *
 * @param {boolean} notNote: true -> 不展示备注
 * @param {boolean} hasPagination: ->自定义分页信息 用于分页查询出的明细
 * @param {boolean} noPagination: true->不展示分页
 * @param {string} tableId:
 * @param {string} onExpand:
 * @param {string} expandedRowRender:
 * @param {Object} newScroll:
 * @param {string} title:
 * @param {Object} pagination:
 * @param {function} refreshTable:
 * @param {Object[]} data:
 * @param {Object[]} columns: 列信息
 */
export default class ViewTablePanel extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      pageSize: 20,
      columns: this.props.columns ? this.props.columns : [],
      items: this.props.data ? this.props.data : [],
      noteWidth: 0,
      notNote: props.notNote,
      searchText: '',
      searchedColumn: '',
      hoverColumn: '',
      dropdownColumn: '',
      sort: false,
      showSortFilter: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.columns && nextProps.columns != this.props.columns) {
      this.setState({
        columns: nextProps.columns,
      });
    }
    if (nextProps.data && nextProps.data != this.props.data) {
      this.setState({
        items: nextProps.data,
      });
    }
    if (nextProps.notNote != this.props.notNote) {
      this.setState({
        notNote: nextProps.notNote,
      });
    }
    // if (nextProps.columns.length > 0 && nextProps.notNote == undefined) {
    //     nextProps.columns.push({
    //         title: commonLocale.noteLocale,
    //         dataIndex: 'note',
    //         render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
    //         width: itemColWidth.noteEditColWidth
    //     });


    //     this.setState({
    //         noteWidth: itemColWidth.noteEditColWidth,
    //         columns: nextProps.columns.concat(),
    //         i:this.state.i+1
    //     })
    // }
  }

  sortData = (dataIndex, asceding, reset, confirm) => {
    if (confirm) {
      confirm();
    }
    const items = this.state.items;
    items.sort(function (c1, c2) {
      let sortVal1 = getValueByStrPaths(c1, dataIndex);
      let sortVal2 = getValueByStrPaths(c2, dataIndex);
      if (asceding) {
        if (dataIndex == 'line') {
          return parseInt(sortVal1) - parseInt(sortVal2);
        }
        return sortVal1.localeCompare(sortVal2);
      } else {
        if (dataIndex == 'line') {
          return -(parseInt(sortVal1) - parseInt(sortVal2));
        }
        return -sortVal1.localeCompare(sortVal2);
      }
    });
    this.setState({
      searchedColumn: reset ? '' : dataIndex,
      searchText: '',
      items: items,
      sort: reset || dataIndex == 'line' ? false : (asceding ? 'asc' : 'desc')
    });
  };

  getColumnSearchProps = (dataIndex, oldRender) => {
    // filter or sort
    const isCurrent = this.state.searchedColumn === dataIndex && (this.state.sort || this.state.searchText);
    const isAscOrder = isCurrent && (this.state.sort && this.state.sort === 'asc');
    const isDescOrder = isCurrent && (this.state.sort && this.state.sort === 'desc');
    let ascStyle = {
      marginTop: 4,
      iconColor: '#848C96',
    };
    let descStyle = {
      // marginBottom: 4,
      iconColor: '#848C96'
    };
    const linkColor = '#3B77E3';
    const oriColor = '#848C96';
    const selectedBgdColor = '#F2F8FF';
    let fontColor = '';
    let itemColor = '';
    let backgroundColor = '';
    if (isAscOrder) {
      ascStyle = {
        ...ascStyle,
        backgroundColor: '#F2F8FF',
        iconColor: '#3B77E3'
      }
    }
    if (isDescOrder) {
      descStyle = {
        ...descStyle,
        backgroundColor: '#F2F8FF',
        iconColor: '#3B77E3'
      }
    }
    const ret = {
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className={styles.filterDropDown}>
          <div className={styles.filterInput}>
            <Input
              ref={node => {
                this.searchInput = node;
              }}
              placeholder={`搜索`}
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
              style={{ width: 160, height: 32 }}
            />
          </div>
          <div className={styles.buttonRow}>
            <Button
              type="primary"
              onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
              size="small"
              style={{ width: 76 }}
            >
              搜索
            </Button>
            <Button onClick={() => this.handleReset(clearFilters, confirm)} size="small"
              style={{ width: 76, marginLeft: 8 }}>
              重置
            </Button>
          </div>
          <a className={styles.sortFilter} style={ascStyle} onClick={() => this.sortData(dataIndex, true, false, confirm)}>
            <div>
              <IconFont type="positiveorder" style={{ fontSize: '16px', color: ascStyle.iconColor, position: 'relative', top: 1 }} />&nbsp;&nbsp;<span style={{ color: '#354052' }}>正排序</span>
            </div>
          </a>
          <a className={styles.sortFilter} style={descStyle} onClick={() => this.sortData(dataIndex, false, false, confirm)}>
            <div>
              <IconFont type="reverseorder" style={{ fontSize: '16px', color: descStyle.iconColor, position: 'relative', top: 1 }} />&nbsp;&nbsp;<span style={{ color: '#354052' }}>倒排序</span>
            </div>
          </a>
        </div>
      ),
      filterIcon: filtered => this.state.hoverColumn === dataIndex || this.state.dropdownColumn === dataIndex ?
        <IconFont style={{ fontSize: '20px' }} type="icon-arrow_triangle_down" /> :
        <IconFont style={{ fontSize: '20px' }} type="" />,
      onFilter: (value, record) => {
        let flatStr = getValueByStrPaths(record, dataIndex);
        return flatStr ? flatStr.toLowerCase().includes(value.toLowerCase()) : '';
      },
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          this.setState({
            dropdownColumn: dataIndex
          })
          setTimeout(() => this.searchInput.select(), 100);
        } else {
          this.setState({
            dropdownColumn: ''
          })
        }
      },
      onHeaderCell: (column) => {
        return {
          onMouseEnter: event => {
            this.setState({
              hoverColumn: dataIndex,
            });
          },
          onMouseLeave: event => {
            this.setState({
              hoverColumn: '',
            });
          },
        };
      },
    };
    if (isCurrent) {
      ret.className = styles.sortFilterColumn;
    }
    return ret;
  };

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  filterAndSort = (columns) => {
    const newColumns = [];
    for (let i = 0; i < columns.length; i++) {
      let newColumn = columns[i];
      if (this.canFilterSort(newColumn)) {
        newColumn = {
          ...newColumn,
          ...this.getColumnSearchProps(newColumn.dataIndex, newColumn.render),
        };
      }
      newColumns.push(newColumn);
    }
    return newColumns;
  };

  canFilterSort = (column) => {
    let ret = column.filterAndSort && column.dataIndex;
    if (ret) {
      return ret;
    }
    const record = new Set([
      commonLocale.inQpcAndMunitLocale,
      '商品/商品规格', '商品',
      commonLocale.vendorLocale,
      '订单号', '来源单号',
      '容器', '来源容器', '目标容器',
      '货位', '来源货位', '目标货位', '货位及货位用途'
    ]);
    if (column.title && record.has(column.title) && column.dataIndex) {
      return true;
    }
  }

  handleReset = (clearFilters, confirm) => {
    clearFilters();
    this.sortData('line', true, true, confirm);
  };

  getPageData = () => {
    const { page, pageSize, items } = this.state;
    let pageData = [];
    let end = (page + 1) * pageSize;
    if (items.length < end) {
      end = items.length;
    }
    for (let i = page * pageSize; i < end; i++) {
      pageData.push(items[i]);
    }
    const pagination = {
      total: items.length,
      pageSize: pageSize,
      current: page + 1,
      showTotal: total => `共 ${total} 条`,
    };
    return {
      list: pageData,
      pagination: this.props.noPagination ? null : pagination,
    };
  };

  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    this.setState({
      page: pagination.current - 1,
      pageSize: pagination.pageSize,
    });
    if (this.props.hasPagination)
      this.props.refreshTable(pagination.current - 1, pagination.pageSize);
  };

  render() {
    const { columns, noteWidth, notNote, items } = this.state;
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...this.props.pagination,
    };
    let hasNote = columns.filter(c => c.title === commonLocale.noteLocale).length >= 1;
    if (columns.length > 0 && notNote == undefined && !hasNote) {
      columns.push({
        title: commonLocale.noteLocale,
        dataIndex: 'note',
        render: text => text ? <EllipsisCol colValue={text} /> : <Empty />,
        width: itemColWidth.noteEditColWidth,
      });
      this.state.noteWidth = itemColWidth.noteEditColWidth;
    }

    let newColumns = this.filterAndSort(columns);
    let showToolbar = this.props.drawBatchButton;
    return (
      <div className={styles.viewTablePanelWrapper} style={this.props.style ? this.props.style : {}}>
        <Collapse bordered={false} defaultActiveKey={['1']}
          expandIcon={({ isActive }) =>
           <div className={styles.titleWrappr}>
              {this.props.title && <div className={styles.navTitle}>
                <span>{this.props.title} </span>
                {isActive ?
                  <IconFont style={{ fontSize: '16px', color: '#848C96', position: 'relative', top: '1px' }}
                    type="icon-arrow_fold" /> :
                  <IconFont style={{ fontSize: '16px', color: '#848C96', position: 'relative', top: '1px' }}
                    type="icon-arrow_unfold" />}
              </div>}
            </div>
          }
          style={{ backgroundColor: 'white' }}>
          <Panel
            key="1"
            style={{ 'border': 0 }}
          >
            <div id="viewTable">
              {showToolbar &&
              <ToolbarPanel>
                <div className={style.toolbarIcon} style={{ float: 'left' }}>
                  {this.props.drawBatchButton && this.props.drawBatchButton(this.state.selectedRowKeys)}&nbsp;&nbsp;&nbsp;
                </div>
              </ToolbarPanel>
              }
              <StandardTable
                minHeight={this.props.minHeight ? this.props.minHeight : 150}
                rowKey={record => record.uuid ? record.uuid : record.line}
                unShowRow={true}
                data={this.props.hasPagination ? items : this.getPageData()}
                columns={newColumns}
                onChange={this.handleStandardTableChange}
                selectedRows={[]}
                newScroll={this.props.newScroll}
                expandedRowRender={this.props.expandedRowRender ? this.props.expandedRowRender : undefined}
                onExpand={this.props.onExpand ? this.props.onExpand : undefined}
                comId={this.props.tableId}
                canDrag={this.props.canDragTable}
                moveRow={this.props.moveRow}
                loading={this.props.loading}
                hasSettingColumns
              />
            </div>
            {/* filter dropdown control */}
            <div>
              <div style={{ height: 120 }}></div>
              <span>&nbsp;</span>
            </div>
          </Panel>
        </Collapse>
      </div>
    );
  }
}
