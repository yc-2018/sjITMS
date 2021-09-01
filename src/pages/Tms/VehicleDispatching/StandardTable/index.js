import React, { Component, Fragment } from 'react';
import { Table, Checkbox, List, Modal, message } from 'antd';
import styles from './index.less';
import { formatMessage } from 'umi/locale';
import { commonLocale } from '@/utils/CommonLocale';
import { guid } from '@/utils/utils';
import { cacheTableColumns, getTableColumns } from '@/utils/LoginContext';
import { Resizable } from 'react-resizable';
import IconFont from '@/components/IconFont';
const CheckboxGroup = Checkbox.Group;
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
  columns && columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

function filterColumns(columns) {
  if(columns) {
    return columns.filter(function (item) {
      return !item.invisible;
    });
  }
}

function fetchOptions(columns, key) {
  const options = [];
  let checkedList = []
  let defaultColumns = getTableColumns(key);
  if(defaultColumns && (typeof defaultColumns === 'string')) {
    defaultColumns = JSON.parse(defaultColumns)
  }
  if (defaultColumns) {
    for (let i = 0; i < defaultColumns.length; i++) {
      options.push({
        label: defaultColumns[i],
        value: defaultColumns[i],
        upColor: '#CED0DA',
        downColor: '#CED0DA',
        checked: true
      });
    }
    for (let i = 0; i < columns.length; i++) {
      if (defaultColumns.indexOf(columns[i].title) == -1 && i != 0 && columns[i].title && columns[i].title !== commonLocale.operateLocale) {
        options.push({
          label: columns[i].title,
          value: columns[i].title,
          upColor: '#CED0DA',
          downColor: '#CED0DA',
          checked: false
        });
      }
    }
  } else {
    if(columns && columns.length>0){
      for (let idx = 0; idx < columns.length; idx++) {
        const e = columns[idx];
        if (idx === 0) {
          continue;
        }
        if (e.title && e.title !== commonLocale.operateLocale) {
          options.push({
            label: e.title,
            value: e.title,
            upColor: '#CED0DA',
            downColor: '#CED0DA',
            checked: true
          });
        }
      }
    }
  }
  return options;
}

function fetchValues(columns, key) {
  let defaultColumns = getTableColumns(key);
  if (defaultColumns) {
    return defaultColumns;
  }
  const values = [];
  if(columns && columns.length>0) {
    for (let idx = 0; idx < columns.length; idx++) {
      const e = columns[idx];
      if (idx === 0) {
        continue;
      }
      if (e.title && e.title !== commonLocale.operateLocale && !e.invisible) {
        values.push(e.title);
      }
    }
  }
  return values;
}

class StandardTable extends Component {
  constructor(props) {
    super(props);
    const { columns, nestColumns, rowKey  } = props;
    let tempColumns = filterColumns(columns);
    let nestTempColumns = filterColumns(nestColumns);
    const needTotalList = initTotalList(tempColumns);
    const nestNeedTotalList = initTotalList(nestTempColumns);
    let key = props.comId ? props.comId : guid();
    let nestKey = props.nestComId ? props.nestComId : guid();
    const checkedValues = fetchValues(columns, key);
    const nestCheckedValues = fetchValues(nestColumns, nestKey);
    this.state = {
      selectedRowKeys: [],
      selectedRowKeysForNest: [],
      needTotalList,
      nestNeedTotalList,
      selectedAllRows: [],
      selectedAllRowsForNest:[],
      key: key,
      nestKey: nestKey,
      columns: this.filterAndSorter(checkedValues),
      nestColumns: this.filterAndSorterNest(nestCheckedValues),
      settingModalVisible:false,
      settingNestModalVisible:false,
      optionsList:fetchOptions(columns,key),// 绘制的列
      nestOptionsList:fetchOptions(nestColumns,nestKey),//子表格绘制的列
      i:0
    };
  }

  componentDidMount(){
    let key = this.props.comId ? this.props.comId : guid();
    let nestKey = this.props.nestComId ? this.props.nestComId : guid();
    let tempColumns = filterColumns(this.props.columns);
    let nestTempColumns = filterColumns(this.props.nestColumns);
    const needTotalList = initTotalList(tempColumns);
    const nestNeedTotalList = initTotalList(nestTempColumns);
    const checkedValues = fetchValues(this.props.columns, key);
    const nestCheckedValues = fetchValues(this.props.nestColumns, nestKey);
    this.setState({
      needTotalList,
      nestNeedTotalList,
      columns: this.filterAndSorter(checkedValues),
      nestColumns: this.filterAndSorterNest(nestCheckedValues),
      optionsList:fetchOptions(this.props.columns,key),// 绘制的列
      nestOptionsList:fetchOptions(this.props.nestColumns,nestKey),//子表格绘制的列
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.isCheckReceipt) {
      if (nextProps.columns.length != this.state.columns.length) {
        let key = this.props.comId ? this.props.comId : guid();
        let tempColumns = filterColumns(this.props.columns);
        const needTotalList = initTotalList(tempColumns);
        const checkedValues = fetchValues(this.props.columns, key);
        this.setState({
          needTotalList,
          columns: this.filterAndSorter(checkedValues, ''),
          optionsList: fetchOptions(this.props.columns, key),// 绘制的列
        })
      }
      if (nextProps.nestColumns.length != this.state.nestColumns.length) {
        let nestKey = this.props.nestComId ? this.props.nestComId : guid();
        let nestTempColumns = filterColumns(this.props.nestColumns);
        const nestNeedTotalList = initTotalList(nestTempColumns);
        const nestCheckedValues = fetchValues(this.props.nestColumns, nestKey);
        this.setState({
          nestNeedTotalList,
          nestColumns: this.filterAndSorterNest(nestCheckedValues),
          nestOptionsList: fetchOptions(this.props.nestColumns, nestKey),// 绘制子表格的列
        })
      }
    } else {
      if (nextProps.columns != this.props.columns) {
        let key = this.props.comId ? this.props.comId : guid();
        let tempColumns = filterColumns(this.props.columns);
        const needTotalList = initTotalList(tempColumns);
        const checkedValues = fetchValues(this.props.columns, key);
        this.setState({
          needTotalList,
          columns: this.filterAndSorter(checkedValues),
          optionsList: fetchOptions(this.props.columns, key),// 绘制的列
        })
      }
      if (nextProps.nestColumns != this.props.nestColumns) {
        let nestKey = this.props.nestComId ? this.props.nestComId : guid();
        let nestTempColumns = filterColumns(this.props.nestColumns);
        const nestNeedTotalList = initTotalList(nestTempColumns);
        const nestCheckedValues = fetchValues(this.props.nestColumns, nestKey);
        this.setState({
          nestNeedTotalList,
          nestColumns: this.filterAndSorterNest(nestCheckedValues),
          nestOptionsList: fetchOptions(this.props.nestColumns, nestKey),// 绘制子表格的列
        })
      }
    }
    return true;
  }

  static getDerivedStateFromProps(nextProps) {
    // clean state
    if (nextProps.selectedRows &&nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList(nextProps.columns);
      const nestNeedTotalList = initTotalList(nextProps.nestColumns);
      return {
        selectedRowKeys: [],
        needTotalList,
        nestNeedTotalList
      };
    }
    return null;
  }

  filterAndSorter = (checkedValues) => {
    const { columns } = this.props;
    const newColumns = [];
    newColumns.push({ ...columns[0] });
    let value= null;
    if(checkedValues && typeof checkedValues === 'string') {
      value = JSON.parse(checkedValues)
      value.forEach(e => {
        const cs = columns.filter(i => i.title && i.title === e);
        if (cs && cs.length > 0) {
          newColumns.push({ ...cs[0] });
        }
      });
    } else {
      checkedValues.forEach(e => {
        const cs = columns.filter(i => i.title && i.title === e);
        if (cs && cs.length > 0) {
          newColumns.push({ ...cs[0] });
        }
      });
    }
    if (columns[columns.length - 1].title === commonLocale.operateLocale) {
      newColumns.push(columns[columns.length - 1]);
    }
    return newColumns;
  }

  filterAndSorterNest = (checkedValues) => {
    const { nestColumns } = this.props;
    const newColumns = [];
    if(nestColumns && Array.isArray(nestColumns)) {
      newColumns.push({ ...nestColumns[0] });
    }
    let value= null;
    if(checkedValues && typeof checkedValues === 'string') {
      value = JSON.parse(checkedValues)
      value.forEach(e => {
        const cs = nestColumns.filter(i => i.title && i.title === e);
        if (cs && cs.length > 0) {
          newColumns.push({ ...cs[0] });
        }
      });
    } else {
      checkedValues.forEach(e => {
        const cs = nestColumns.filter(i => i.title && i.title === e);
        if (cs && cs.length > 0) {
          newColumns.push({ ...cs[0] });
        }
      });
    }
    if(nestColumns && Array.isArray(nestColumns)) {
      if (nestColumns[nestColumns.length - 1].title === commonLocale.operateLocale) {
        newColumns.push(nestColumns[nestColumns.length - 1]);
      }
    }
    return newColumns;
  }

  onChange = (e,option) => {
    const { optionsList } = this.state;
    option.checked = e.target.checked
    this.setState({
      optionsList:optionsList
    })
  }
  components = {
    header: {
      cell: ResizableTitle,
    },
  };

  getRowKey = (mainRecord) => {
    const { rowKey } = this.props;
    if (typeof rowKey === 'string') {
      return mainRecord[rowKey];
    } else {
      return rowKey(mainRecord);
    }
  }

  handleRowSelectNest = (record, selected, selectedRows, mainRecord) => {
    const { selectedRowKeys, selectedAllRows } = this.state;
    const { onSelectRowForNest } = this.props;
    // if (onSelectRowForNest) {
    //   let list = [...selectedRows];
    //   onSelectRowForNest(selected?[record]:list,mainRecord);
    // }
    if (onSelectRowForNest) {
      let list = [...selectedRows];
      onSelectRowForNest(list, mainRecord);
    }
    let mainTableKey = this.getRowKey(mainRecord);
    if (selectedRows.length === mainRecord.items.length) {
      selectedRowKeys.push(mainTableKey);
      selectedAllRows.push(mainRecord);
      this.handleRowSelectChange(selectedRowKeys, selectedAllRows, false, true);
    } else {
      var index = selectedRowKeys.indexOf(mainTableKey);
      if (index > -1) {
        selectedRowKeys.splice(index, 1);
        selectedAllRows.splice(index, 1);
        this.handleRowSelectChange(selectedRowKeys, selectedAllRows, false, true);
      }
    }
  }

  handleRowSelect = (record, selected, selectedRows, nativeEvent) => {
    const { selectedAllRowsForNest, selectedRowKeysForNest } = this.state
    const { onSelectRowForNest } = this.props
    if (this.props.expand) { // 联动子表格
      let list = selectedAllRowsForNest;
      let listKeys = selectedRowKeysForNest;
      selectedRows.forEach(row => {
        row.items && row.items.forEach(item => {
          if (listKeys.indexOf(item.uuid) == -1) {
            listKeys.push(item.uuid)
            list.push(item)
          }
        })
      });
      if (!selected) {
        record.items.forEach(item => {
          if (listKeys.indexOf(item.uuid) != -1) {
            listKeys.splice(listKeys.indexOf(item.uuid), 1);
            list.splice(listKeys.indexOf(item.uuid), 1);
          }
        })
      }
      if (onSelectRowForNest) {
        onSelectRowForNest(selected ? [...record.items] : [], record);
      }
      this.setState({
        selectedAllRowsForNest: [...list],
        selectedRowKeysForNest: [...listKeys],
      })
    }
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows, isAll, onlyState) => {
    let { needTotalList, selectedAllRows, selectedRowKeysForNest, selectedAllRowsForNest } = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex], 10), 0),
    }));
    const { onSelectRow } = this.props;
    let selectedRowArr = [];
    if (selectedRows.length == selectedRowKeys.length) {//只操作一页数据
      selectedRowArr = selectedRows;
    } else {//操作至少两页数据
      selectedRowKeys.forEach((item) => {
        let row = selectedRows.find((ele) => {
          return ele.uuid == item;
        })
        if (!row) {
          row = selectedAllRows.find((ele) => {
            return ele.uuid == item;
          });
        }
        if (row) {
          selectedRowArr.push(row);
        }
      });
    }
    if (onSelectRow && !onlyState) {
      onSelectRow(selectedRowArr);
    }
    this.setState({ selectedRowKeys, needTotalList, selectedAllRows: selectedRowArr });
  };

  handleRowSelectChangeForNest = (keys, rows, mainRecord) => {
    const { selectedAllRowsForNest, selectedRowKeysForNest, selectedRowKeys, selectedAllRows } = this.state;
    this.setState({
      selectedRowKeysForNest: keys,
      selectedAllRowsForNest: rows,
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  };

  renderItems = (selectedRowKeys) => {
    if (selectedRowKeys.length > 1) {
      return formatMessage({ id: 'common.component.StantardtTable.tag.item' }) + "s";
    } else {
      return formatMessage({ id: 'common.component.StantardtTable.tag.item' });
    }
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

  getTotalWidth = (columns) => {
    let totalWidth = 0;
    columns.forEach(e => {
      totalWidth = totalWidth + e.width;
    });
    return totalWidth;
  }

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

  handleSettingModalVisible = (visible)=>{
    if(visible==true){
      this.setState({
        settingModalVisible:visible,
      })
    }
  }

  handleSettingNestModalVisible = (visible)=>{
    if(visible==true){
      this.setState({
        settingNestModalVisible:visible,
      })
    }
  }

  onClickUp = (target,index)=>{
    const { optionsList } = this.state;
    // 第一个不能移动
    if(index==0){
      return;
    }
    // 没勾选不能移动
    if(target.checked==false){
      message.warning('未勾选的不能移动');
      return;
    }
    // 删除重新放置
    if(index !== 0){
      let temp = optionsList[index];
      optionsList[index] = optionsList[index-1];
      optionsList[index-1] = temp;
    };
    target['upColor'] = '#CED0DA';
    this.setState({
      optionsList:optionsList
    })
  }

  onNestClickUp = (target,index)=>{
    const { optionsList,nestOptionsList } = this.state;
    // 第一个不能移动
    if(index==0){
      return;
    }
    // 没勾选不能移动
    if(target.checked==false){
      message.warning('未勾选的不能移动');
      return;
    }
    // 删除重新放置
    if(index !== 0){
      let temp = nestOptionsList[index];
      nestOptionsList[index] = nestOptionsList[index-1];
      nestOptionsList[index-1] = temp;
    };
    target['upColor'] = '#CED0DA';
    this.setState({
      nestOptionsList:nestOptionsList
    })
  }

  onClickDown = (target,index)=>{
    const { optionsList,nestOptionsList } = this.state;
    // 最后一个不能移动
    if(index==optionsList.length-1){
      return;
    }
    // 没勾选不能移动
    if(target.checked==false){
      message.warning('未勾选的不能移动');
      return;
    }
    // 删除重新放置
    if(index!==optionsList.length-1){
      let temp = optionsList[index];
      optionsList[index] = optionsList[index+1];
      optionsList[index+1] = temp;

    };
    target['downColor'] = '#CED0DA';
    this.setState({
      optionsList:optionsList.concat()
    })
  }

  onNestClickDown = (target,index)=>{
    const { optionsList,nestOptionsList } = this.state;
    // 最后一个不能移动
    if(index==optionsList.length-1){
      return;
    }
    // 没勾选不能移动
    if(target.checked==false){
      message.warning('未勾选的不能移动');
      return;
    }
    // 删除重新放置
    if(index!==optionsList.length-1){
      let temp = nestOptionsList[index];
      nestOptionsList[index] = nestOptionsList[index+1];
      nestOptionsList[index+1] = temp;
    };
    target['downColor'] = '#CED0DA';
    this.setState({
      nestOptionsList:nestOptionsList.concat()
    })
  }

  onMouseHover = (option,flag,type)=>{
    if(flag == true){
      option[type] = '#3B77E3';
    }else if(flag == false){
      option[type] = '#CED0DA';
    }
    this.setState({
      optionsList:this.state.optionsList,
      nestOptionsList:this.state.nestOptionsList
    })
  }

  handleOK = ()=>{
    const { optionsList } = this.state;
    const { columns } = this.props;
    let newList = [];
    let newColumns = [];
    // 将勾选值按照顺序排序
      for(let i = 0;i<optionsList.length;i++){
        if(optionsList[i].checked == true){
          newList.push(optionsList[i].value);
        }
      }
      // 设置第一列
      newColumns.push({ ...columns[0] });
      // 按顺序 添加
      for(let i = 0;i<optionsList.length;i++){
        for(let j = 0;j<columns.length;j++){
          if(columns[j].title == optionsList[i].value){
            newColumns.push({...columns[j]})
          }
        }
      }
      // 按是否勾选 删除
      for(let i =newColumns.length-1;i>=0;i--){
        if(newList.indexOf(newColumns[i].title)==-1&&i!=0){
          newColumns.splice(i, 1)
        }
      }
      // 设置最后一列
      if (columns[columns.length - 1].title === commonLocale.operateLocale) {
        newColumns.push(columns[columns.length - 1]);
      }
      cacheTableColumns(this.state.key, newList);
      this.setState({
        columns: newColumns,
        settingModalVisible:false,
      });
  }

  handleOkNest = ()=>{
    const { nestOptionsList } = this.state;
    const { nestColumns } = this.props;
    let newList = [];
    let newColumns = [];
    // 将勾选值按照顺序排序
      for(let i = 0;i<nestOptionsList.length;i++){
        if(nestOptionsList[i].checked == true){
          newList.push(nestOptionsList[i].value);
        }
      }
      // 设置第一列
      newColumns.push({ ...nestColumns[0] });
      // 按顺序 添加
      for(let i = 0;i<nestOptionsList.length;i++){
        for(let j = 0;j<nestColumns.length;j++){
          if(nestColumns[j].title == nestOptionsList[i].value){
            newColumns.push({...nestColumns[j]})
          }
        }
      }
      // 按是否勾选 删除
      for(let i =newColumns.length-1;i>=0;i--){
        if(newList.indexOf(newColumns[i].title)==-1&&i!=0){
          newColumns.splice(i, 1)
        }
      }
      // 设置最后一列
      if (nestColumns[nestColumns.length - 1].title === commonLocale.operateLocale) {
        newColumns.push(nestColumns[nestColumns.length - 1]);
      }
      cacheTableColumns(this.state.nestKey, newList);
    this.setState({
      nestColumns: [ ...newColumns ],
      settingNestModalVisible:false
    });
  }

  handleCancle = ()=>{
    const { key} = this.state;
    this.setState({
      showNest: false,
      settingModalVisible:false,
      optionsList:fetchOptions(this.props.columns,key),
      i:this.state.i+1,
    })
  }

  handleNestCancle = ()=>{
    const { nestKey} = this.state;
    this.setState({
      showNest: false,
      settingNestModalVisible:false,
      nestOptionsList:fetchOptions(this.props.nestColumns,nestKey),
      i:this.state.i+1,
    })
  }

  onSelectAllNest = (isAll, mainRecord) => {
    const { selectedAllRows, selectedRowKeys } = this.state;
    let mainTableKey = this.getRowKey(mainRecord);
    if (isAll) {
      selectedRowKeys.push(mainTableKey);
      selectedAllRows.push(mainRecord);
    } else {
      var index = selectedRowKeys.indexOf(mainTableKey);
      if (index > -1) {
        selectedRowKeys.splice(index, 1);
        selectedAllRows.splice(index, 1);
      }
    }
    this.handleRowSelectChange(selectedRowKeys, selectedAllRows, isAll);
  }

  onSelectAll = (isAll, selectedRows) => {
    let list = [];
    let listKeys = [];
    if (!isAll) {
      if (this.props.expand) {
        this.setState({
          selectedAllRowsForNest: [...list],
          selectedRowKeysForNest: [...listKeys],
        })
      }
      if (this.props.clearNestSelect)
        this.props.clearNestSelect();
    } else {
      if (this.props.expand) { // 联动子表格
        selectedRows.forEach(row => {
          row.items && row.items.forEach(item => {
            if (listKeys.indexOf(item.uuid) == -1) {
              listKeys.push(item.uuid)
              list.push(item)
            }
          })
        });
        this.setState({
          selectedAllRowsForNest: [...list],
          selectedRowKeysForNest: [...listKeys],
        })
      }
    }
  }

  renderSettingModal = ()=>{
    const {optionsList, showNest} = this.state;
    let height = (document.body.clientHeight*0.6)+'px';
    return <div style={{maxHeight:height,overflowY:'auto',overflowX:'hidden'}}>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={optionsList}
        renderItem={(option,index) => (
          <List.Item style= {{marginBottom:'0px',marginRight:'24px'}} key={index}>
            <div style={{borderBottom:'1px solid #E8E8E8',height:'43px',display:'flex',alignItems:'center'}}>
              <span style={{width:'85%',fontSize:'14px',fontWeight:400}}>{option.value}</span>
              <a
                onMouseEnter={()=>this.onMouseHover(option,true,'downColor',showNest)}
                onMouseLeave={()=>this.onMouseHover(option,false,'downColor',showNest)}
                onClick={()=>this.onClickDown(option,index,showNest)}
              >
                <IconFont style={{fontSize:'16px' ,color:option.downColor}} type="icon-line_down"/>
              </a>
              <a
                onMouseEnter={()=>this.onMouseHover(option,true,'upColor',showNest)}
                onMouseLeave={()=>this.onMouseHover(option,false,'upColor',showNest)}
                onClick={()=>this.onClickUp(option,index,showNest)}
                style={{marginRight:'22px',marginLeft:'8px'}}
              >
                <IconFont style={{fontSize:'16px',color:option.upColor}}  type="icon-line_up"/>
              </a>
              <Checkbox id={option.value} value={option.value} checked={option.checked} onChange={(e)=>this.onChange(e,option)}/>
            </div>
          </List.Item>
        )}
      />
    </div>;
  }

  renderNestSettingModal = ()=>{
    const {nestOptionsList, showNest} = this.state;
    let height = (document.body.clientHeight*0.6)+'px';
    return <div style={{maxHeight:height,overflowY:'auto',overflowX:'hidden'}}>
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={nestOptionsList}
        renderItem={(option,index) => (
          <List.Item style= {{marginBottom:'0px',marginRight:'24px'}} key={index}>
            <div style={{borderBottom:'1px solid #E8E8E8',height:'43px',display:'flex',alignItems:'center'}}>
              <span style={{width:'85%',fontSize:'14px',fontWeight:400}}>{option.value}</span>
              <a
                onMouseEnter={()=>this.onMouseHover(option,true,'downColor',showNest)}
                onMouseLeave={()=>this.onMouseHover(option,false,'downColor',showNest)}
                onClick={()=>this.onNestClickDown(option,index,showNest)}
              >
                <IconFont style={{fontSize:'16px' ,color:option.downColor}} type="icon-line_down"/>
              </a>
              <a
                onMouseEnter={()=>this.onMouseHover(option,true,'upColor',showNest)}
                onMouseLeave={()=>this.onMouseHover(option,false,'upColor',showNest)}
                onClick={()=>this.onNestClickUp(option,index,showNest)}
                style={{marginRight:'22px',marginLeft:'8px'}}
              >
                <IconFont style={{fontSize:'16px',color:option.upColor}}  type="icon-line_up"/>
              </a>
              <Checkbox id={option.value} value={option.value} checked={option.checked} onChange={(e)=>this.onChange(e,option)}/>
            </div>
          </List.Item>
        )}
      />
    </div>;
  }

  expandedRowRender = (mainRecord, scroll) => {
    const { selectedRowKeysForNest, nestColumns } = this.state;
    const { selectedRowKeysForNestUse } = this.props;
    const rowSelection = {
      selectedRowKeys: selectedRowKeysForNestUse && selectedRowKeysForNestUse.length === 0 ? selectedRowKeysForNestUse : selectedRowKeysForNest,
      columnWidth: 22,
      onChange: (selectedRowKeys, selectedRows) => this.handleRowSelectChangeForNest(selectedRowKeys, selectedRows, mainRecord),
      onSelect: (record, selected, selectedRows, nativeEvent) => this.handleRowSelectNest(record, selected, selectedRows, mainRecord),
      onSelectAll: (selected, selectedRows, changeRows) => this.onSelectAllNest(selected, mainRecord)
    };
    const {
      ...rest
    } = this.props;
    const newColumns = [];
    nestColumns.forEach(e => {
      newColumns.push({...e});
    });
    let style = this.props.nestComId&&this.props.nestComId.indexOf('search')!=-1&&!this.props.noToolbarPanel?{
      display:'flex',
      justifyContent:'flex-end',
      width:'10%',
      marginTop:'0px',
      marginLeft:'90%',
    }:{
      display:'flex',
      justifyContent:'flex-end',
    };
    return <div id="test" className={styles.test}>
      {
        this.props.nestComId?<div>
          <div style={style}>
            <div className={styles.setting}  onClick={()=>this.handleSettingNestModalVisible(true, 'showNest')}>
              <IconFont style={{fontSize:'20px'}}  type="icon-setting"/>
            </div>
          </div>
        </div>:null
      }
      <Table
        size="small"
        id={this.state.nestKey}
        rowSelection={this.props.nestRowSelect ? rowSelection : null}
        rowKey={record => record.uuid ? record.uuid : 'nestKey'}
        columns={this.state.nestColumns ? this.state.nestColumns : nestColumns}
        dataSource={mainRecord.list ? mainRecord.list : mainRecord.items ? mainRecord.items : []}
        indentSize={10}
        rowClassName={(record, index) => {
          let name = '';
          if (record.sourceOrderBillTms) {
            name = styles.changeRow;
          } else if (index % 2 === 0) {
            name = styles.lightRow;
          }
          return name
        }}
        pagination={false}
      />
    </div>;
  };

  adjustColumns = (columns) => {
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
          width: minWidth
        };
      }
      newColumns.push(newColumn);
    }
    return newColumns;
  }

  render() {
    const { selectedRowKeys, needTotalList, columns,settingModalVisible, settingNestModalVisible } = this.state;
    const {
      data: { list, pagination },
      rowKey,
      ...rest
    } = this.props;
    let paginationProps = false;
    if (!this.props.noPagination) {
      if(this.props.notshowChanger){
        paginationProps={
          ...pagination
        }
      }else{
        paginationProps = {
          showSizeChanger: true,
          ...pagination,
          defaultPageSize: 20,
          pageSizeOptions: ['10', '20', '50', '100', '200']
        };
      }
    }
    const newColumns = [];
    columns.forEach(e => {
      newColumns.push({...e});
    });
    const tableElement = document.getElementById(this.state.key);
    let totalWidth = this.getTotalWidth(newColumns);
    const tableWidth = tableElement ? tableElement.offsetWidth : 0;
    let scroll;
    if (totalWidth > tableWidth) {
      scroll = { x: (totalWidth) };
    } else {
      let moreWidth = tableWidth - totalWidth;
      let newTotalWidth = 0;
      newColumns.forEach(e => {
        if (e.key === 'action' || e.key === 'line' || e.title === commonLocale.operateLocale
          || e.key === commonLocale.lineLocal) {
          totalWidth = totalWidth - e.width;
          newTotalWidth = newTotalWidth + e.width;
        }
      });
      for (let idx = columns.length - 1; idx >= 0; idx--) {
        if (newColumns[idx].key === 'action' || columns[idx].key === 'line' ||
          newColumns[idx].title === commonLocale.operateLocale ||
          newColumns[idx].title === commonLocale.lineLocal) {
          continue;
        }
        if (newColumns[idx].invisible) {
          continue;
        }
        let newWidth = newColumns[idx].width + newColumns[idx].width / totalWidth * moreWidth;
        if (newWidth + newTotalWidth > tableWidth) {
          newColumns[idx].width = tableWidth - newTotalWidth;
        } else {
          newColumns[idx].width = newWidth;
        }
        newTotalWidth = newTotalWidth + newColumns[idx].width;
      }
    }
    const rowSelection = {
      selectedRowKeys,
      fixed:this.props.fixed,
      onChange: this.handleRowSelectChange,
      onSelect: this.handleRowSelect,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
      onSelectAll:(selected, selectedRows, changeRows)=>this.onSelectAll(selected,selectedRows)
    };
    this.refreshColumns(newColumns);
    let style = this.props.comId&&this.props.comId.indexOf('search')!=-1&&!this.props.noToolbarPanel?{
      display:'flex',
      justifyContent:'flex-end',
      width:'10%',
      marginTop:'-25px',
      marginLeft:'90%',
    }:{
      display:'flex',
      justifyContent:'flex-end',
    };
    // 可拖拽、hover show
    let showColumns = newColumns.map((col, index) => {
      if (!col.onHeaderCell) {
        return ({
          ...col,
          onHeaderCell: column => ({
            width: column.width,
            onResize: this.handleResize(index),
          }),
        });
      } else {
        let onHeaderCell = (column) => ({
          width: column.width,
          onResize: this.handleResize(index),
          ...(col.onHeaderCell(column)),
        });
        return {
          ...col,
          onHeaderCell: column => onHeaderCell(column),
        };
      }
    });
    showColumns = this.adjustColumns(showColumns);
    return (
      <div className={styles.standardTable}>
        {
          this.props.comId?<div>
            <div style={style}>
              <div className={styles.setting} onClick={()=>this.handleSettingModalVisible(true, '')}>
                <IconFont style={{fontSize:'20px'}}  type="icon-setting"/>
              </div>
            </div>
          </div>:null
        }
        <Table
          id={this.state.key}
          rowKey={rowKey || 'key'}
          rowSelection={this.props.unShowRow ? undefined : rowSelection}
          rowSelectionWidth={10}
          dataSource={list}
          size={this.props.size ? this.props.size : "middle"}
          pagination={this.props.newPagination?this.props.newPagination:paginationProps}
          onChange={this.handleTableChange}
          rowClassName={this.props.rowClassName?this.props.rowClassName:(record, index) => index % 2 === 0 ? styles.lightRow : ''}
          {...rest}
          components={this.components}
          columns={showColumns}
          scroll={this.props.newScroll ? this.props.newScroll : scroll}
          onRow={record => {
            let data = {};
            if(this.props.dbOnclick) {
              data = {
                onDoubleClick: event => this.props.onClickRow(record)
              }
            } else {
              data = {
                onClick: event => this.props.onClickRow(record)
              }
            }
            return this.props.hasOnRow?data:null
          }}
          indentSize={500}
          expandedRowRender={this.props.expand?(record)=>this.expandedRowRender(record,scroll):null}
          onExpandedRowsChange={this.onExpandedRowsChange}
        />
        <Modal
          className={styles.modalStyle}
          title={'表格设置'}
          visible={settingModalVisible}
          onCancel={this.handleCancle}
          onOk={this.handleOK}
          width={'25%'}
        >
          {this.renderSettingModal()}
        </Modal>
        <Modal
          className={styles.modalStyle}
          title={'表格设置'}
          visible={settingNestModalVisible}
          onCancel={this.handleNestCancle}
          onOk={this.handleOkNest}
          width={'25%'}
        >
          {this.renderNestSettingModal()}
        </Modal>
      </div>
    );
  }
}
export default StandardTable;
