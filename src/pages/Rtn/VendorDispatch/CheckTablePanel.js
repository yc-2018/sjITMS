import React, { PureComponent } from 'react';
import styles from '@/pages/Inner/StockTakeBill/ViewTable.less';
import StandardTable from '@/components/StandardTable';
import { Collapse } from 'antd';

const Panel = Collapse.Panel;
/**
 * noPagination true->不展示分页
 */
export default class CheckTablePanel extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      page: 0,
      pageSize: 20,
      selectedRows: [],
    };
  }

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
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

  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    this.setState({
      page: pagination.current - 1,
      pageSize: pagination.pageSize,
    });
  };

  getTotalWidth = (columns) => {
    let totalWidth = 0;
    columns.forEach(e => {
      if (e.width) {
        totalWidth = totalWidth + e.width;
      }
    });

    return totalWidth;
  };

  render() {
    const { selectedRows } = this.state;
    const tableElement = document.getElementById('viewTable');
    let totalWidth = this.getTotalWidth(this.props.columns);
    const tableWidth = tableElement ? tableElement.offsetWidth : 0;
    let scroll;
    if (totalWidth > tableWidth) {
      scroll = { x: totalWidth };
    }

    return (
      <div className={styles.viewPanelWrapper}>
        <div className={styles.contentWrapper}>
          <StandardTable
            comId={this.props.tableId ? this.props.tableId : undefined}
            rowKey={record => record.containerBarcode}
            // unShowRow={true}
            selectedRows={selectedRows}
            data={this.getPageData()}
            columns={this.props.columns}
            onChange={this.handleStandardTableChange}
            rowSelection={this.props.rowSelection}
            scroll={this.props.scroll ? this.props.scroll : scroll}
          />
        </div>
      </div>
    );
  }
}
