import React, { PureComponent } from 'react';
import { Button, Switch, Table } from 'antd';
import { connect } from 'dva';
import styles from './OperateInfoTable.less';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import { formatMessage } from 'umi/locale';

@connect(({ log, loading }) => ({
  log,
  loading: loading.models.log,
}))
class OperateInfoTable extends PureComponent {
  state = {
    currentData: {},
    pageFilter: {
      page: 0,
      pageSize: 10,
      sortFields: {},
      searchKeyValues: {},
    },
  };

  operatedColumns = [
    {
      title: formatMessage({ id: 'common.detail.operate.table.column.operateTime' }),
      dataIndex: 'logTime',
    },
    {
      title: formatMessage({ id: 'common.detail.operate.table.column.operator' }),
      render: (val, record) => (
        <span title={this.convertCodeName(record.operateInfo)}>
          {this.convertCodeName(record.operateInfo)}
        </span>
      ),
    },
    {
      title: formatMessage({ id: 'common.detail.operate.table.column.operateType' }),
      dataIndex: 'event',
    },
    {
      title: formatMessage({ id: 'common.detail.operate.table.column.detail' }),
      dataIndex: 'message',
    },
  ];

  componentWillReceiveProps(nextProps) {
    if (nextProps.entity.uuid === this.state.currentData.uuid && nextProps.serviceCaption === nextProps.serviceCaption)
      return;
    const { pageFilter } = this.state;
    const { dispatch } = this.props;
    this.setState({
      currentData: nextProps.entity,
      serviceCaption: nextProps.serviceCaption
    });

    pageFilter.searchKeyValues = {
      'entityUuid': nextProps.entity.uuid,
      'serviceCaption': nextProps.serviceCaption
    };
    pageFilter.sortFields = { 'logTime': true };

    dispatch({
      type: 'log/queryEntityLog',
      payload: pageFilter,
    });
  }

  componentDidMount() {
    const { pageFilter } = this.state;
    const { dispatch } = this.props;

    this.setState({
      currentData: this.props.entity,
      serviceCaption: this.props.serviceCaption
    });

    pageFilter.searchKeyValues = {
      'entityUuid': this.props.entity.uuid,
      'serviceCaption': this.props.serviceCaption
    };
    pageFilter.sortFields = { 'logTime': true };

    dispatch({
      type: 'log/queryEntityLog',
      payload: pageFilter,
    });
  }

  /**
   * 展示UCN类型的code和name
   */
  convertCodeName = val => {
    if (val != {} && val != null) {
      return '[' + val.code + ']' + val.name;
    }
  };

  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { pageFilter } = this.state;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    pageFilter.searchKeyValues = { entityUuid: this.props.entity.uuid };
    pageFilter.sortFields = { logTime: true };
    const { dispatch } = this.props;
    dispatch({
      type: 'log/queryEntityLog',
      payload: pageFilter,
    });
  };

  render() {
    const {
      log: { data },
      loading,
    } = this.props;

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...data.pagination,
    };

    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default')
    }

    return (
      <div className={styles.standardTable}>
        <Table
          columns={this.operatedColumns}
          dataSource={data.list}
          pagination={paginationProps}
          onChange={this.handleStandardTableChange}
          rowKey={record => record.uuid}
          rowClassName={(record, index) => index % 2 === 0 ? styles.lightRow : ''}
          loading={tableLoading}
        ></Table>
      </div>
    );
  }
}

export default OperateInfoTable;