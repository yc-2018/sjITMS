import React, { PureComponent, Fragment } from 'react';
import { Table, Icon } from 'antd';
import styles from './index.less';
import { formatMessage } from 'umi/locale';

function initTotalList(columns) {
  const totalList = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

function filterColumns(columns) {
  return columns.filter(function (item) {
    return !item.invisible;
  });
}
class NestTable extends PureComponent {
  constructor(props) {
    super(props);
    const { columns } = props;
    let tempColumns = filterColumns(columns);
    const needTotalList = initTotalList(tempColumns);

    this.state = {
      selectedRowKeys: [],
      selectedRowKeysForNest: [],
      needTotalList,
      selectedAllRows:[],
      selectedAllRowsForNest:[],

    };
  }

  static getDerivedStateFromProps(nextProps) {
    // clean state
    if (nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList(nextProps.columns);
      return {
        selectedRowKeys: [],
        needTotalList,
      };
    }
    return null;
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    let { needTotalList, selectedAllRows} = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex], 10), 0),
    }));
    const { onSelectRow } = this.props;
    let selectedRowArr=[];
    if(selectedRows.length==selectedRowKeys.length){//只操作一页数据
      selectedRowArr=selectedRows;
    }else{//操作至少两页数据
      selectedRowKeys.forEach((item)=>{
        let row=selectedRows.find((ele)=>{
          return ele.uuid==item;
        })
        if(!row){
          row=selectedAllRows.find((ele)=>{
            return ele.uuid==item;
          });
        }
        if(row){
          selectedRowArr.push(row);
        }
      });
    }
    if (onSelectRow) {
      onSelectRow(selectedRowArr);
    }
    this.setState({ selectedRowKeys, needTotalList, selectedAllRows:selectedRowArr });
  };

  handleRowSelectChangeForNest = (keys, rows,mainRecord) => {

    const { onSelectRowForNest } = this.props;
    const { selectedAllRowsForNest,selectedRowKeysForNest } = this.state;


    if (onSelectRowForNest) {
      onSelectRowForNest(rows,keys,mainRecord);
    }
    this.setState({
      selectedRowKeysForNest:keys,
      selectedAllRowsForNest:rows,
    });
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
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
              cursor: 'pointer'
            }
          }
        }
      }
    });
  }
  expandedRowRender = (mainRecord) => {
    const { selectedRowKeysForNest } = this.state;

    const rowSelection = {
      selectedRowKeysForNest,
      onChange: (selectedRowKeys, selectedRows)=>this.handleRowSelectChangeForNest(selectedRowKeys, selectedRows,mainRecord),
    };
    const {
      nestColumns,
    } = this.props;
    return (<div style={{overflow:'auto', maxHeight:'200px'}} className={styles.test}>
        <Table
          rowSelection={this.props.nestRowSelect?rowSelection:null}
          rowKey={record => record.uuid? record.uuid : ''}
          columns={nestColumns}
          dataSource={mainRecord.list? mainRecord.list : mainRecord.items? mainRecord.items : []}
          rowClassName={(record, index) => index % 2 === 0 ? styles.lightRow : ''}
          pagination={false}
        />
      </div>
    );
  };
  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const {
      data: { list, pagination },
      rowKey,
      columns,
      nestColumns,
      ...rest
    } = this.props;
    let paginationProps = false;
    if (!this.props.noPagination) {
      paginationProps = {
        showSizeChanger: true,
        showQuickJumper: true,
        ...pagination,
        defaultPageSize: 20,
        pageSizeOptions: ['10', '20', '50', '100', '200']
      };
    }

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };
    let currColumns = filterColumns(columns);
    this.refreshColumns(currColumns);

    return (
      <div className={styles.standardTable}>
        <Table
          rowKey={rowKey || 'key'}
          rowSelection={this.props.unShowRow ? undefined : rowSelection}
          dataSource={list}
          size={this.props.size ? this.props.size : "middle"}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          rowClassName={(record, index) => index % 2 === 0 ? styles.lightRow : ''}
          columns={currColumns}
          {...rest}
          expandedRowRender={(record)=>this.expandedRowRender(record)}
          // indentSize={30}
          expandRowByClick={true}
          scroll={{ y: 200 }}
        />
      </div>
    );
  }
}

export default NestTable;
