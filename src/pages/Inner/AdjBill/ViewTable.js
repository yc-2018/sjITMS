import { PureComponent } from "react";
import { Col, Row, Icon, Collapse } from 'antd';
import { formatMessage } from 'umi/locale';
import StandardTable from '@/components/StandardTable';
import styles from './ViewTable.less';
import { itemColWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import Empty from '@/pages/Component/Form/Empty';
import { commonLocale } from '@/utils/CommonLocale';
const Panel = Collapse.Panel;
export default class ViewTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      pageSize: 10
    }
  }
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
    }
    return {
      list: pageData,
      pagination: pagination
    };
  }
  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    this.setState({
      page: pagination.current - 1,
      pageSize: pagination.pageSize
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
  }
  render() {
    const columns = this.props.columns;
    const tableElement = document.getElementById("viewTable");
    let totalWidth = this.getTotalWidth(this.props.columns);
    const tableWidth = tableElement ? tableElement.offsetWidth : 0;
    let scroll;
    if (totalWidth > tableWidth + 40) {
      scroll = { x: totalWidth };
    }
    return (
      <div className={styles.viewPanelWrapper}>
        <div className={styles.contentWrapper}>
          <StandardTable
            rowKey={record => record.uuid}
            unShowRow={true}
            data={this.getPageData()}
            columns={columns}
            onChange={this.handleStandardTableChange}
            selectedRows={[]}
            scroll={this.props.scroll ? this.props.scroll : { x: false, y: false }}
            expandedRowRender={this.props.expandedRowRender ? this.props.expandedRowRender : undefined}
            onExpand={this.props.onExpand ? this.props.onExpand : undefined}
          />
        </div>
      </div>
    );
  }
}
