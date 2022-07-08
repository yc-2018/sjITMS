import React, { Component } from 'react';
import IconFont from '../RyzeIconFont';
import { guid, isEmpty, isEmptyObj } from '@/utils/utils';
import { cacheTableColumns, getTableColumns, removeTableColumns } from '@/utils/LoginContext';
import styles from './index.less';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Checkbox, Dropdown, Menu, message, Table, Tooltip, Input } from 'antd';
import { commonLocale } from '@/utils/CommonLocale';
import update from 'immutability-helper';

const SHOW_THRESH_HOLD = 5;

let dragingSettingIndex = -1;
let dragingBodyIndex = -1;

function shencopy(obj) {
  if (typeof obj !== 'object') {
    return obj;
  }
  var res = Array.isArray(obj) ? [] : {};
  for (let i in obj) {
    res[i] = shencopy(obj[i]);
  }
  return res;
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
  let defaultCache = null;
  if (getTableColumns(key)) {
    defaultCache =
      typeof getTableColumns(key) != 'object'
        ? JSON.parse(getTableColumns(key))
        : getTableColumns(key);
  }

  let defaultColumns = defaultCache?.newList;
  let cacheList = defaultCache?.cacheList;
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
          width: cacheList[i].width,
        });
      } else {
        options.push({
          label: defaultColumns[i],
          value: defaultColumns[i],
          upColor: '#CED0DA',
          downColor: '#CED0DA',
          checked: false,
          width: cacheList[i].width,
        });
      }
    }

    for (let i = 0; i < columns.length; i++) {
      if (
        defaultColumns.indexOf(columns[i].title) == -1 &&
        // i != 0 &&
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
            width: columns[i].width,
          });
        } else {
          options.push({
            label: columns[i].title,
            value: columns[i].title,
            upColor: '#CED0DA',
            downColor: '#CED0DA',
            checked: false,
            width: columns[i].width,
          });
        }
      }
    }
  } else {
    for (let idx = 0; idx < columns.length; idx++) {
      const e = columns[idx];
      // if (idx === 0) {
      //   continue;
      // }
      if (e.title && e.title !== commonLocale.operateLocale) {
        if (!columns[idx].invisible) {
          options.push({
            label: e.title,
            value: e.title,
            upColor: '#CED0DA',
            downColor: '#CED0DA',
            checked: true,
            width: e.width,
          });
        } else {
          options.push({
            label: e.title,
            value: e.title,
            upColor: '#CED0DA',
            downColor: '#CED0DA',
            checked: false,
            width: e.width,
          });
        }
      }
    }
  }
  return options;
}

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

const rowSource = {
  beginDrag(props) {
    dragingSettingIndex = props.index;
    return {
      index: props.index,
    };
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

export default class RyzeSettingDrowDown extends Component {
  settingComponents = {
    body: {
      row: DragableSettingRow,
    },
  };

  constructor(props) {
    super(props);
    const { columns } = props;
    // let tempColumns = filterColumns(columns);
    // const needTotalList = initTotalList(tempColumns);
    let key = props.comId ? props.comId : guid();
    let settingKey = guid();
    // const checkedValues = fetchValues(columns, key);
    let optionsList = fetchOptions(columns, key);
    // let list = getShowList(this.props.data, this.props.dataSource);
    this.state = {
      key: key,
      settingKey: settingKey,
      oriColumnLen: columns.length,
      //   columns: this.filterAndSorter(checkedValues),
      settingModalVisible: false,
      optionsList: optionsList, // 绘制的列
      //   pageSize:
      //     props.comId && props.comId.indexOf('search') > -1
      //       ? sessionStorage.getItem('searchPageLine')
      //       : sessionStorage.getItem('viewPageLine'),
      //   list: list,
      i: 0,
      pathname: window.location.pathname,
    };
  }

  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

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

  handleOK = () => {
    const { optionsList } = this.state;
    const { columns } = this.props;
    let oldColumns = [];
    // console.log('optionsList', optionsList);
    //copy数组对象
    for (let i = 0; i < columns.length; i++) {
      oldColumns[i] = shencopy(columns[i]);
    }
    let newList = [];
    let cacheList = [];
    let newColumns = [];
    // 将勾选值按照顺序排序
    for (let i = 0; i < optionsList.length; i++) {
      if (optionsList[i].checked == true) {
        newList.push(optionsList[i].value);
        cacheList.push({ text: optionsList[i].value, width: optionsList[i].width });
      }
    }
    // 设置第一列
    // newColumns.push({ ...oldColumns[0] });

    // 按顺序 添加
    for (let i = 0; i < optionsList.length; i++) {
      for (let j = 0; j < oldColumns.length; j++) {
        if (oldColumns[j].title == optionsList[i].value) {
          oldColumns[j].width = optionsList[i].width; //字段宽度
          newColumns.push({ ...oldColumns[j] });
        }
      }
    }

    // console.log('newList', newList);
    // console.log('newColumns', newColumns);
    // 按是否勾选 删除

    for (let i = newColumns.length - 1; i >= 0; i--) {
      if (newList.indexOf(newColumns[i].title) == -1) {
        console.log('title', newColumns[i].title);
        newColumns.splice(i, 1);
      }
    }

    // 设置最后一列
    if (
      oldColumns[oldColumns.length - 1].title === commonLocale.operateLocale &&
      !this.props.noActionCol
    ) {
      newColumns.push(oldColumns[oldColumns.length - 1]);
    }
    let cache = {
      cacheList,
      newList,
    };
    cacheTableColumns(this.state.key, cache);
    //回调方法
    this.props.getNewColumns ? this.props.getNewColumns(newColumns) : '';
    this.setState({
      columns: newColumns,
      settingModalVisible: false,
    });
  };

  handleSettingModalVisible = visible => {
    if (visible == true) {
      this.setState({
        settingModalVisible: visible,
      });
    }
  };

  renderDragTable() {
    const { optionsList, settingKey } = this.state;
    const tableElement = document.getElementById(settingKey);
    const pos = tableElement ? tableElement.getBoundingClientRect() : {};
    // const footerElement = document.getElementById('footer');
    //获取当前页签的footer
    const footerElement = document
      .getElementById(this.state.pathname)
      .getElementsByTagName('footer')[1];
    const footerPos = footerElement ? footerElement.getBoundingClientRect() : {};
    let height = this.props.tableHeight ? this.props.tableHeight : footerPos.top - pos.top - 40;
    let dataHeight = optionsList ? optionsList.length * 30 + 40 : 0;
    let scroll = {};
    if (dataHeight > height) {
      scroll.y = height < 30 ? 30 : height - 20;
    }
    scroll.x = false;
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

  onChange = (e, option) => {
    // console.log('e', e, 'option', option);
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

  onMenuHover = (option, flag) => {
    option['hover'] = flag;

    this.setState({
      optionsList: this.state.optionsList,
    });
  };

  //改变字段宽度
  changeWidth = (e, record) => {
    // console.log('record', record, e.target.value);
    const { optionsList } = this.state;
    let width = parseInt(e.target.value);
    //NaN自己与自己不相等
    if (width != width) width = '';
    record.width = width;
    this.setState(
      {
        optionsList: optionsList,
      },
      () => {
        this.handleOK();
      }
    );
  };

  handleWidth = (index, width) => {
    if (index == 0) {
      const { optionsList } = this.state;
      let newOptionsList = optionsList;
      // newOptionsList[index - 1].width = width;
      newOptionsList[index].width = width;

      this.setState(
        {
          optionsList: newOptionsList,
        },
        () => {
          this.handleOK();
        }
      );
    } else {
      if (!index) return;
      const { optionsList } = this.state;
      let newOptionsList = optionsList;
      // newOptionsList[index - 1].width = width;
      newOptionsList[index].width = width;

      this.setState(
        {
          optionsList: newOptionsList,
        },
        () => {
          this.handleOK();
        }
      );
    }
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
    {
      title: 'valueWidth',
      dataIndex: 'valueWidth',
      key: 'valueWidth',
      width: '50px',
      render: (text, record, index) => {
        return (
          <span style={{ width: '50px', marginLeft: '-4px' }}>
            <Input onChange={e => this.changeWidth(e, record)} value={record.width} />
          </span>
        );
      },
    },
  ];

  render() {
    let style =
      this.props.comId && !this.props.noToolbarPanel
        ? {
            display: 'flex',
            justifyContent: 'flex-end',
            position: 'absolute',
            right: '2px',
            top: '-20px',
          }
        : {
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '2px',
          };
    let settingIcon = (
      <div className={styles.setting} onClick={() => this.handleSettingModalVisible(true)}>
        <IconFont style={{ fontSize: '20px', color: '#848C96' }} type="icon-setting" />
      </div>
    );
    return (
      <div>
        <div style={style}>{this.renderSettingDrowDown(settingIcon)}</div>
        <div
          id={this.state.settingKey}
          style={{ borderBottom: '1px solid transparent !important' }}
        />
      </div>
    );
  }
}
