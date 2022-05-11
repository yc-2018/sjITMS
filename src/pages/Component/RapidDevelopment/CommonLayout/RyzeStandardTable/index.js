import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Checkbox, Dropdown, Menu, message, Table, Tooltip } from 'antd';
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { commonLocale } from '@/utils/CommonLocale';
import { guid, isEmpty, isEmptyObj } from '@/utils/utils';
import { cacheTableColumns, getTableColumns, removeTableColumns } from '@/utils/LoginContext';
import { Resizable } from 'react-resizable';
import IconFont from '../RyzeIconFont';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { func } from 'prop-types';
import ToolbarPanel from '@/pages/Component/Page/inner/ToolbarPanel';

const SHOW_THRESH_HOLD = 5;

let dragingSettingIndex = -1;
let dragingBodyIndex = -1;

// 使用全局变量，不可复用
class SettingRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let { className } = restProps;
    if (isOver) {
      if (restProps.index > dragingSettingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingSettingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />)
    );
  }
}

class BodyRow extends React.Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let { className } = restProps;
    if (isOver) {
      if (restProps.index > dragingBodyIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingBodyIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />)
    );
  }
}

const rowSource = {
  beginDrag(props) {
    dragingSettingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableSettingRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(SettingRow)
);

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(BodyRow)
);

const ResizableTitle = props => {
  const { onResize, width, ...restProps } = props;
  if (!width) {
    return <th {...restProps} />;
  }
  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={e => {
            e.stopPropagation();
          }}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};
function initTotalList(columns) {
  const totalList = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}
/**
 *
 * @param {props columns} columns
 * 筛除需隐藏的列
 */
function filterColumns(columns) {
  return columns.filter(function(item) {
    return !item.invisible;
  });
}

/**
 *
 * @param {props} columns
 * @param {props table key} key
 * 绘制设置按钮选项列
 */

function fetchOptions(columns, key) {
  const options = [];
  let checkedList = [];

  let defaultColumns = getTableColumns(key);
  if (defaultColumns && typeof defaultColumns === 'string') {
    defaultColumns = JSON.parse(defaultColumns);
  }
  if (defaultColumns) {
    for (let i = 0; i < defaultColumns.length; i++) {
      const col = defaultColumns[i];
      if (!col.invisible) {
        options.push({
          label: defaultColumns[i],
          value: defaultColumns[i],
          upColor: '#CED0DA',
          downColor: '#CED0DA',
          checked: true,
        });
      } else {
        options.push({
          label: defaultColumns[i],
          value: defaultColumns[i],
          upColor: '#CED0DA',
          downColor: '#CED0DA',
          checked: false,
        });
      }
    }

    for (let i = 0; i < columns.length; i++) {
      if (
        defaultColumns.indexOf(columns[i].title) == -1 &&
        i != 0 &&
        columns[i].title &&
        columns[i].title !== commonLocale.operateLocale
      ) {
        if (!columns[i].invisible) {
          options.push({
            label: columns[i].title,
            value: columns[i].title,
            upColor: '#CED0DA',
            downColor: '#CED0DA',
            checked: false,
          });
        } else {
          options.push({
            label: columns[i].title,
            value: columns[i].title,
            upColor: '#CED0DA',
            downColor: '#CED0DA',
            checked: false,
          });
        }
      }
    }
  } else {
    for (let idx = 0; idx < columns.length; idx++) {
      const e = columns[idx];
      if (idx === 0) {
        continue;
      }
      if (e.title && e.title !== commonLocale.operateLocale) {
        if (!columns[idx].invisible) {
          options.push({
            label: e.title,
            value: e.title,
            upColor: '#CED0DA',
            downColor: '#CED0DA',
            checked: true,
          });
        } else {
          options.push({
            label: e.title,
            value: e.title,
            upColor: '#CED0DA',
            downColor: '#CED0DA',
            checked: false,
          });
        }
      }
    }
  }
  // console.log('============女巫',options )
  return options;
}
/**
 *
 * @param {props columns} columns
 * @param {table key} key
 * 查询是否有缓存，获取列表头
 */
function fetchValues(columns, key) {
  let defaultColumns = getTableColumns(key);
  if (defaultColumns) {
    return defaultColumns;
  }
  const values = [];
  for (let idx = 0; idx < columns.length; idx++) {
    const e = columns[idx];
    if (idx === 0) {
      continue;
    }
    if (e.title && e.title !== commonLocale.operateLocale && !e.invisible) {
      values.push(e.title);
    }
  }
  return values;
}

function getShowList(data, dataSource) {
  if (data) {
    if (data instanceof Array) {
      return data;
    } else {
      return data.list;
    }
  }
  if (dataSource) {
    return dataSource;
  }
  return [];
}

/**
 * 表格
 *
 * @param {boolean} noActionCol: 无操作列
 * @param {boolean} unShowRow： 无复选框, 控制 Table rowSelection
 * @param {boolean} noToolbarPanel: 无表格上方的工具栏
 * @param {boolean} noSettingColumns: 无表格上方的显示隐藏/列调整设置icon
 * @param {boolean} hasSettingColumns: 表格上方的显示列调整设置icon, 覆盖列少时无icon
 * @param {boolean} noPagination: 无分页
 * @param {boolean} canDrag: 是否可拖拽, 还需要顶层组件支持
 * @param {boolean | SpinProps} loading:
 * @param {Number} minHeight: 表格的最小高度
 * @param {string} comId: 全局 ID
 * @param {Object} newScroll: 滚动, Table 的 scroll
 * @param {string} size: 表格大小 'default' | 'middle' | 'small'
 * @param {function} rowKey：为 record.uuid 时可点击行自动选中
 * @param {Object|Object[]} data: 分页数据(list,pagination) / items
 * @param {Object} dataSource: 兼容 <Table> 参数，覆盖 data 参数
 * @param {ColumnProps[]} columns: 表格显示列 Column 属性, column.invisible: 初始是否可见
 * @param {TableRowSelection} rowSelection: 兼容 Table
 * @param {function} onChange: 表格变化时的操作
 * @param {function} isSelectedRow: 是否时当前选中行
 * @param {function} isOverRow: 是否是不可操作行
 * @param {function} onSelectRow: 选择行的操作
 * @param {Object} rest: 其他的 Table 属性
 */
class StandardTable extends Component {
  components = {
    header: {
      cell: ResizableTitle,
    },
    ...this.buildComponent(),
  };
  settingComponents = {
    body: {
      row: DragableSettingRow,
    },
  };

  constructor(props) {
    super(props);
    const { columns } = props;
    let tempColumns = filterColumns(columns);
    const needTotalList = initTotalList(tempColumns);
    let key = props.comId ? props.comId : guid();
    let settingKey = guid();
    const checkedValues = fetchValues(columns, key);
    let optionsList = fetchOptions(columns, key);
    let list = getShowList(this.props.data, this.props.dataSource);
    this.state = {
      selectedRowKeys: [],
      needTotalList,
      selectedAllRows: [],
      key: key,
      settingKey: settingKey,
      oriColumnLen: columns.length,
      columns: this.filterAndSorter(checkedValues),
      settingModalVisible: false,
      optionsList: optionsList, // 绘制的列
      pageSize:
        props.comId && props.comId.indexOf('search') > -1
          ? sessionStorage.getItem('searchPageLine')
          : sessionStorage.getItem('viewPageLine'),
      list: list,
      i: 0,
      pathname: window.location.pathname,
    };
  }

  static getDerivedStateFromProps(nextProps) {
    // clean state
    if (nextProps.selectedRows && nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList(nextProps.columns);
      return {
        selectedRowKeys: [],
        needTotalList,
      };
    }
    return null;
  }

  buildComponent() {
    return this.props.canDrag
      ? {
          body: {
            row: DragableBodyRow,
          },
        }
      : {};
  }

  componentDidMount() {
    let key = this.props.comId ? this.props.comId : guid();
    let tempColumns = filterColumns(this.props.columns);
    const needTotalList = initTotalList(tempColumns);
    const checkedValues = fetchValues(this.props.columns, key);
    this.setState({
      needTotalList,
      columns: this.filterAndSorter(checkedValues),
      optionsList: fetchOptions(this.props.columns, key), // 绘制的列
      list: getShowList(this.props.data, this.props.dataSource),
    });

    setTimeout(() => {
      let allwarp = document.getElementsByClassName('ant-table-body');
      //加定时器 因为 可能 table还没渲染完就获取元素 防止获取不到
      let warp = document.getElementsByClassName('ant-table-body')[allwarp.length - 2];
      // console.log('warp', warp, document.getElementsByClassName('ant-table-body'));
      // 添加滚动监听
      if (warp) {
        warp.addEventListener('scroll', this.handleScroll, true);
      }
    }, 2000);
  }

  //监听滚动事件
  handleScroll = () => {
    let allwarp = document.getElementsByClassName('ant-table-body');
    let warp = document.getElementsByClassName('ant-table-body')[allwarp.length - 2];
    let wrapBottom = document.getElementsByClassName('ant-table-body')[allwarp.length - 1];
    // console.log(warp, wrapBottom, wrapBottom.scrollLeft, warp.scrollLeft);
    warp.addEventListener(
      'scroll',
      () => {
        wrapBottom.scrollLeft = warp.scrollLeft;
      },
      true
    );
  };

  // 组件将要卸载，取消监听window滚动事件
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.pathname !== window.location.pathname && !this.props.focusRefresh) {
      return false;
    }
    if (nextProps.columns != this.props.columns) {
      let key = this.props.comId ? this.props.comId : guid();
      let tempColumns = filterColumns(this.props.columns);
      const needTotalList = initTotalList(tempColumns);
      // const checkedValues = fetchValues(this.props.columns, key);
      const checkedValues = fetchValues(nextProps.columns, key);
      this.setState({
        needTotalList,
        // columns: this.filterAndSorter(checkedValues),
        columns: this.filterAndSorter(checkedValues, nextProps.columns),
        optionsList: fetchOptions(this.props.columns, key), // 绘制的列
      });
    }
    if (nextProps.data != this.props.data || nextProps.dataSource != this.props.dataSource) {
      this.setState({
        list: getShowList(nextProps.data, nextProps.dataSource),
      });
    }
    return true;
  }

  filterAndSorter = (checkedValues, nextColumns) => {
    let { columns, noActionCol } = this.props;
    columns = isEmpty(nextColumns) ? columns : nextColumns;
    const newColumns = [];
    newColumns.push({ ...columns[0] });
    let arr = checkedValues;
    if (typeof checkedValues === 'string') {
      arr = JSON.parse(checkedValues);
    }
    arr.forEach(e => {
      const cs = columns.filter(i => i.title && i.title === e);
      if (cs && cs.length > 0) {
        newColumns.push({ ...cs[0] });
      }
    });

    if (columns[columns.length - 1].title === commonLocale.operateLocale) {
      if (noActionCol) {
        // newColumns.push(columns[columns.length - 1]);
      } else {
        newColumns.push(columns[columns.length - 1]);
      }
    }

    return newColumns;
  };

  onChange = (e, option) => {
    const { optionsList } = this.state;
    option.checked = e.target.checked;

    this.setState(
      {
        optionsList: optionsList,
      },
      () => {
        this.handleOK();
      }
    );
  };

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    let { needTotalList, selectedAllRows } = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex], 10), 0),
    }));
    const { onSelectRow } = this.props;
    let selectedRowArr = [];
    if (selectedRows.length == selectedRowKeys.length) {
      //只操作一页数据
      selectedRowArr = selectedRows;
    } else {
      //操作至少两页数据
      selectedRowKeys.forEach(item => {
        let row = selectedRows.find(ele => {
          return ele.uuid == item;
        });
        if (!row) {
          row = selectedAllRows.find(ele => {
            return ele.uuid == item;
          });
        }
        if (row) {
          selectedRowArr.push(row);
        }
      });
    }
    if (onSelectRow) {
      onSelectRow(selectedRowArr, selectedRowKeys);
    }
    this.setState({ selectedRowKeys, needTotalList, selectedAllRows: selectedRowArr });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { onChange } = this.props;
    this.setState({
      pageSize: pagination.pageSize,
    });
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  };

  renderItems = selectedRowKeys => {
    if (selectedRowKeys.length > 1) {
      return formatMessage({ id: 'common.component.StantardtTable.tag.item' }) + 's';
    } else {
      return formatMessage({ id: 'common.component.StantardtTable.tag.item' });
    }
  };

  onSettingRow = (record, index) => {
    return {
      onMouseEnter: event => {
        this.onMenuHover(record, true);
      },
      onMouseLeave: event => {
        this.onMenuHover(record, false);
      },
    };
  };

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

  getTotalWidth = columns => {
    let totalWidth = 0;
    columns.forEach(e => {
      totalWidth = totalWidth + e.width;
    });
    return totalWidth;
  };

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

  handleSettingModalVisible = visible => {
    if (visible == true) {
      this.setState({
        settingModalVisible: visible,
      });
    }
  };

  onClickUp = (target, index) => {
    const { optionsList } = this.state;
    // 第一个不能移动
    if (index == 0) {
      return;
    }
    // 没勾选不能移动
    if (target.checked == false) {
      message.warning('未勾选的不能移动');
      return;
    }

    // 删除重新放置
    if (index != 0) {
      let temp = optionsList[index];
      optionsList[index] = optionsList[index - 1];
      optionsList[index - 1] = temp;
    }

    target['upColor'] = '#CED0DA';

    this.setState(
      {
        optionsList: optionsList,
      },
      () => {
        this.handleOK();
      }
    );
  };

  onClickDown = (target, index) => {
    const { optionsList } = this.state;
    // 最后一个不能移动
    if (index == optionsList.length - 1) {
      return;
    }
    // 没勾选不能移动
    if (target.checked == false) {
      message.warning('未勾选的不能移动');
      return;
    }

    // 删除重新放置
    if (index !== optionsList.length - 1) {
      let temp = optionsList[index];
      optionsList[index] = optionsList[index + 1];
      optionsList[index + 1] = temp;
    }

    target['downColor'] = '#CED0DA';

    this.setState(
      {
        optionsList: optionsList.concat(),
      },
      () => {
        this.handleOK();
      }
    );
  };

  settingColumns = [
    {
      title: 'checked',
      dataIndex: 'checked',
      key: 'checked',
      width: '28px',
      render: (text, record, index) => {
        return (
          <Checkbox
            style={{ paddingLeft: 12 }}
            id={record.value}
            value={record.value}
            checked={record.checked}
            onChange={e => this.onChange(e, record)}
          />
        );
      },
    },
    {
      title: 'value',
      dataIndex: 'value',
      key: 'value',
      width: '100px',
      render: (text, option, index) => {
        return (
          <span style={{ width: '100px', paddingLeft: 4, fontSize: '12px', fontWeight: 400 }}>
            {option.value}
          </span>
        );
      },
    },
    {
      title: 'hover',
      dataIndex: 'hover',
      key: 'hover',
      width: '60px',
      render: (text, record, index) => {
        return (
          <span style={{ width: '60px' }}>
            {record.hover ? (
              <span>
                <a onClick={() => this.onClickDown(record, index)}>
                  <IconFont style={{ fontSize: '16px', color: '#3B77E3' }} type="icon-line_down" />
                </a>
                &nbsp;&nbsp;&nbsp;
                <a
                  onClick={() => this.onClickUp(record, index)}
                  // style={{ marginRight: '22px', marginLeft: '8px' }}
                >
                  <IconFont style={{ fontSize: '16px', color: '#3B77E3' }} type="icon-line_up" />
                </a>
              </span>
            ) : (
              '  '
            )}
          </span>
        );
      },
    },
  ];

  onMenuHover = (option, flag) => {
    option['hover'] = flag;

    this.setState({
      optionsList: this.state.optionsList,
    });
  };

  handleOK = () => {
    const { optionsList } = this.state;
    const { columns } = this.props;
    let newList = [];
    let newColumns = [];
    // 将勾选值按照顺序排序
    for (let i = 0; i < optionsList.length; i++) {
      if (optionsList[i].checked == true) {
        newList.push(optionsList[i].value);
      }
    }

    // 设置第一列
    newColumns.push({ ...columns[0] });

    // 按顺序 添加
    for (let i = 0; i < optionsList.length; i++) {
      for (let j = 0; j < columns.length; j++) {
        if (columns[j].title == optionsList[i].value) {
          newColumns.push({ ...columns[j] });
        }
      }
    }
    // 按是否勾选 删除

    for (let i = newColumns.length - 1; i >= 0; i--) {
      if (newList.indexOf(newColumns[i].title) == -1 && i != 0) {
        newColumns.splice(i, 1);
      }
    }
    // 设置最后一列
    if (
      columns[columns.length - 1].title === commonLocale.operateLocale &&
      !this.props.noActionCol
    ) {
      newColumns.push(columns[columns.length - 1]);
    }

    cacheTableColumns(this.state.key, newList);
    this.setState({
      columns: newColumns,
      settingModalVisible: false,
    });
  };

  handleCancle = () => {
    const { key } = this.state;
    this.setState({
      settingModalVisible: false,
      optionsList: fetchOptions(this.props.columns, key),
      i: this.state.i + 1,
    });
  };

  handleResetSetting = () => {
    const { key } = this.state;
    removeTableColumns(key);
    const oriOptionsList = fetchOptions(this.props.columns, key);
    this.setState(
      {
        optionsList: oriOptionsList,
      },
      () => {
        this.handleOK();
      }
    );
  };

  onClickRow = (record, key, e) => {
    let { selectedRowKeys, selectedAllRows } = this.state;
    if (!selectedRowKeys) {
      selectedRowKeys = [];
      selectedAllRows = [];
    }
    let rowKey = key && typeof key === 'function' ? key(record) : key;
    let idx = selectedRowKeys.indexOf(rowKey);
    if (idx > -1) {
      selectedRowKeys.splice(idx, 1);
      selectedAllRows.splice(idx, 1);
    } else {
      selectedRowKeys.push(rowKey);
      selectedAllRows.push(record);
    }
    this.handleRowSelectChange(selectedRowKeys, selectedAllRows);
  };

  strip(number) {
    return parseFloat(parseFloat(number).toPrecision(12));
  }

  adjustColumns = columns => {
    const newColumns = [];
    for (let i = 0; i < columns.length; i++) {
      let newColumn = columns[i];
      // column width min
      let minWidth = 14 * 2;
      if (newColumn.sorter) {
        minWidth += 25;
      }
      if (newColumn.title) {
        minWidth += newColumn.title.toString().length * 12;
      }
      if (newColumn.width < minWidth) {
        newColumn = {
          ...newColumn,
          width: minWidth,
        };
      }
      newColumns.push(newColumn);
    }
    return newColumns;
  };

  isFixedWidth(oriColumnLen, showColumnLen, column, columnIdx) {
    if (oriColumnLen >= SHOW_THRESH_HOLD && showColumnLen >= SHOW_THRESH_HOLD) {
      return column.key === 'line' || column.key === commonLocale.lineLocal;
      // column.key === 'action' || column.title === commonLocale.operateLocale
    } else {
      // 字段内容少时
      return columnIdx !== showColumnLen - 1;
    }
  }

  isExpandedWidth(oriColumnLen, showColumnLen, column, columnIdx) {
    if (columnIdx === showColumnLen - 1) {
      return false;
    } else if (oriColumnLen < SHOW_THRESH_HOLD || showColumnLen < SHOW_THRESH_HOLD) {
      return true;
      // return  column.key === 'line' || column.key === commonLocale.lineLocal;
      // column.key === 'action' || column.title === commonLocale.operateLocale
    } else {
      // 字段内容少时
      // return columnIdx !== showColumnLen - 1;
      return false;
    }
  }

  isFixedEdge(column) {
    return (
      column.key === 'action' ||
      column.key === 'line' ||
      column.key === 'billNumber' ||
      column.title === commonLocale.operateLocale ||
      column.key === commonLocale.lineLocal
    );
  }

  moveSettingRow = (dragIndex, hoverIndex) => {
    const { optionsList } = this.state;
    const dragRow = optionsList[dragIndex];

    // adjust data
    this.setState(
      update(this.state, {
        optionsList: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
      () => {
        this.handleOK();
      }
    );
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { list } = this.state;
    const dragRow = list[dragIndex];
    // adjust data
    this.setState(
      update(this.state, {
        list: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
        },
      }),
      () => {
        // this.handleOK();
      }
    );
    this.props.drapTableChange(this.state.list);
  };

  renderDragTable() {
    const { optionsList, settingKey } = this.state;
    const tableElement = document.getElementById(settingKey);
    const pos = tableElement ? tableElement.getBoundingClientRect() : {};
    const footerElement = document.getElementById('footer');
    const footerPos = footerElement ? footerElement.getBoundingClientRect() : {};
    let height = this.props.tableHeight ? this.props.tableHeight : footerPos.top - pos.top - 40;
    let dataHeight = optionsList ? optionsList.length * 30 + 40 : 0;
    let scroll = {};
    if (dataHeight > height) {
      scroll.y = height < 30 ? 30 : height - 20;
    }
    scroll.x = false;
    // console.log('还不行============',optionsList)
    return (
      <div className={styles.settingTable}>
        <DndProvider backend={HTML5Backend}>
          <Table
            columns={this.settingColumns}
            showHeader={false}
            dataSource={optionsList}
            components={this.settingComponents}
            pagination={false}
            scroll={scroll}
            onRow={(record, index) => ({
              index,
              moveRow: this.moveSettingRow,
              ...this.onSettingRow(record, index),
            })}
          />
        </DndProvider>
      </div>
    );
  }

  renderSettingDrowDown = settingIcon => {
    const menuItems = [];
    menuItems.push(
      <div style={{ padding: 12, paddingTop: 4, paddingBottom: 22 }}>
        <span style={{ float: 'left', fontWeight: 500 }}>列展示</span>
        <span style={{ float: 'right' }}>
          <a onClick={() => this.handleResetSetting()}>重置</a>
        </span>
      </div>
    );
    menuItems.push(<Menu.Divider />);
    let dragSettingTable = this.renderDragTable();
    menuItems.push(dragSettingTable);
    const menu = <Menu>{menuItems}</Menu>;
    return (
      <Dropdown
        overlay={menu}
        placement="bottomRight"
        overlayClassName={styles.settingDropdown}
        trigger={['click']}
        arrow
      >
        {settingIcon}
      </Dropdown>
    );
  };

  rowClassName = (record, index) => {
    if (this.props.isSelectedRow) {
      const isSelected = this.props.isSelectedRow(record, index);
      if (isSelected) {
        return styles.selectedRow;
      }
    }
    if (this.props.isOverRow) {
      const isOver = this.props.isOverRow(record, index);
      if (isOver) {
        return styles.overRow;
      }
    }
    return index % 2 === 0 ? styles.lightRow : styles.darkRow;
  };

  render() {
    const {
      selectedRowKeys,
      needTotalList,
      columns,
      settingModalVisible,
      oriColumnLen,
    } = this.state;
    let { data, rowKey, noSettingColumns, rest, hasSettingColumns } = this.props;
    let list = data ? (data.list ? data.list : []) : [];
    let pagination = data ? (data.pagination ? data.pagination : {}) : {};
    let showList = isEmpty(this.state.list) ? list : this.state.list;
    if (this.props.dataSource) {
      showList = this.props.dataSource;
    }

    let paginationProps = false;
    if (!this.props.noPagination) {
      pagination = this.props.pagination ? this.props.pagination : pagination;
      if (this.props.notshowChanger) {
        paginationProps = {
          ...pagination,
        };
      } else {
        paginationProps = {
          showSizeChanger: true,
          ...pagination,
          // defaultPageSize: 20,
          pageSize: this.state.pageSize ? this.state.pageSize : 20,
          pageSizeOptions: ['20', '50', '100', '200', '500'],
        };
      }
    }
    const newColumns = [];
    columns.forEach(e => {
      newColumns.push({ ...e });
    });
    const tableElement = document.getElementById(this.state.key);
    const pos = tableElement ? tableElement.getBoundingClientRect() : {};
    const footerElement = document.getElementById('footer');
    const footerPos = footerElement ? footerElement.getBoundingClientRect() : {};
    let height = this.props.tableHeight
      ? this.props.tableHeight
      : footerPos.top - pos.top - (this.props.overHeight ? this.props.overHeight : 90) - 20;
    // let dataHeight = showList ? showList.length * 30 : 0;
    //修改dataHeight计算，适应重写render后控件高度问题 2022-05-06 zhangze
    let dataHeight = showList ? showList.length * 40 : 0;
    let scroll = {}; //'calc(100vh - ' + top + 'px)'
    let totalWidth = this.getTotalWidth(newColumns);
    let tableWidth = tableElement ? tableElement.offsetWidth : 0;
    // console.log("dataHeight",dataHeight,'height',height);
    if (dataHeight > height) {
      scroll.y = height < 30 ? (this.props.minHeight ? this.props.minHeight : 30) : height;
      tableWidth = tableWidth - 120;
    }

    // 固定列滚动
    if (totalWidth > tableWidth) {
      let firstCol = newColumns[0];
      let lastCol = newColumns[newColumns.length - 1];
      newColumns[0] = {
        ...firstCol,
        fixed: 'left',
      };
      if (this.isFixedEdge(lastCol)) {
        newColumns[newColumns.length - 1] = {
          ...lastCol,
          fixed: 'right',
        };
      }
      scroll.x = tableWidth;
    } else {
      // 自适应宽度扩展填充
      let moreWidth = tableWidth - totalWidth;
      let newTotalWidth = 0;
      for (let i = 0; i < newColumns.length; i++) {
        let column = newColumns[i];
        if (this.isExpandedWidth(oriColumnLen, newColumns.length, column, i)) {
          totalWidth = totalWidth - column.width * 0.8;
          newTotalWidth = newTotalWidth + column.width * 0.8;
        } else if (this.isFixedWidth(oriColumnLen, newColumns.length, column, i)) {
          totalWidth = totalWidth - column.width;
          newTotalWidth = newTotalWidth + column.width;
        }
      }
      let expandRatio = 1 + this.strip(moreWidth / totalWidth);
      for (let idx = columns.length - 1; idx >= 0; idx--) {
        if (this.isExpandedWidth(oriColumnLen, newColumns.length, newColumns[idx], idx)) {
          newColumns[idx].width = newColumns[idx].width * 1.2;
          continue;
        }
        if (this.isFixedWidth(oriColumnLen, newColumns.length, newColumns[idx], idx)) {
          continue;
        }
        if (newColumns[idx].invisible) {
          continue;
        }
        let newWidth =
          idx === columns.length - 1 && columns.length < SHOW_THRESH_HOLD
            ? this.strip(newColumns[idx].width * expandRatio) - 10
            : this.strip(newColumns[idx].width * expandRatio);
        newColumns[idx].width = newWidth;
        if (newWidth + newTotalWidth > tableWidth) {
          newColumns[idx].width = newWidth;
        } else {
          newColumns[idx].width = newWidth;
        }
        newTotalWidth = this.strip(newTotalWidth + newColumns[idx].width);
      }
    }
    const rowSelection = {
      selectedRowKeys,
      columnWidth: '35px',
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };
    this.refreshColumns(newColumns);
    let style =
      this.props.comId && this.props.comId.indexOf('search') != -1 && !this.props.noToolbarPanel
        ? {
            display: 'flex',
            justifyContent: 'flex-end',
            width: '10%',
            marginTop: '-28px',
            marginBottom: '5px',
            marginLeft: '90%',
          }
        : {
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '2px',
          };

    // 表头分组显示分割线
    // TODO column 的 children 属性存在， 进行表头分组  ==> 显示表头的边框  大组显示边框，组内不显示分割
    let bordered = false;
    for (let i = 0; i < newColumns.length; i++) {
      let column = newColumns[i];
      if (column.children !== undefined) {
        bordered = true;
        break;
      }
    }

    // 可拖拽、hover show
    let showColumns = newColumns.map((col, index) => {
      if (!col.onHeaderCell) {
        return {
          ...col,
          onHeaderCell: column => ({
            width: column.width,
            onResize: this.handleResize(index),
          }),
        };
      } else {
        let onHeaderCell = column => ({
          width: column.width,
          onResize: this.handleResize(index),
          ...col.onHeaderCell(column),
        });
        return {
          ...col,
          onHeaderCell: column => onHeaderCell(column),
        };
      }
    });
    showColumns = this.adjustColumns(showColumns);
    let settingIcon = (
      <div className={styles.setting} onClick={() => this.handleSettingModalVisible(true)}>
        <IconFont style={{ fontSize: '20px', color: '#848C96' }} type="icon-setting" />
      </div>
    );
    let status =
      this.props.colTotal && this.props.colTotal.length == '0'
        ? { display: 'none' }
        : { display: 'block' };
    // console.log(status, 'status');
    return (
      <div className={styles.standardTable}>
        {(oriColumnLen >= SHOW_THRESH_HOLD && !noSettingColumns) || hasSettingColumns ? (
          <div style={style}>{this.renderSettingDrowDown(settingIcon)}</div>
        ) : null}
        <div
          id={this.state.settingKey}
          style={{ borderBottom: '1px solid transparent !important' }}
        />
        <DndProvider backend={HTML5Backend}>
          <Table
            footer={() => {
              return (
                <Table
                  id={'happy'}
                  columns={showColumns}
                  scroll={{ x: true, y: false }}
                  rowKey={record => Math.random()}
                  pagination={false}
                  showHeader={false} // table 的 columns 头部隐藏
                  dataSource={this.props.colTotal}
                  size={this.props.size ? this.props.size : 'middle'}
                  components={this.components}
                  style={status}
                />
              );
            }}
            className={this.props.tableClassName}
            id={this.state.key}
            rowKey={rowKey || 'key'}
            rowSelection={
              this.props.unShowRow
                ? undefined
                : this.props.rowSelection
                  ? this.props.rowSelection
                  : rowSelection
            }
            dataSource={showList}
            size={this.props.size ? this.props.size : 'middle'}
            pagination={paginationProps}
            onChange={this.handleTableChange}
            rowClassName={
              this.props.rowClassName
                ? this.props.rowClassName
                : (record, index) => this.rowClassName(record, index)
            }
            components={this.components}
            loading={this.props.loading}
            columns={showColumns}
            bordered={bordered}
            scroll={this.props.newScroll ? this.props.newScroll : scroll}
            onRow={
              this.props.onRow
                ? this.props.onRow
                : this.props.unShowRow
                  ? (record, index) => {
                      return {
                        index,
                        moveRow: this.props.moveRow ? this.props.moveRow : this.moveRow,
                      };
                    }
                  : (record, index) => {
                      return {
                        index,
                        moveRow:
                          this.props.canDrag && this.props.moveRow
                            ? this.props.moveRow
                            : this.moveRow,
                        onClick: e => this.onClickRow(record, rowKey || 'key', e),
                        ...this.props.onRow,
                      };
                    }
            }
            {...rest}
          />
        </DndProvider>
      </div>
    );
  }
}

export default StandardTable;
