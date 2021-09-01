import React, { PureComponent } from 'react';
import { connect } from 'dva';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import { loggerLocale } from './LoggerLocale';
import { convertCodeName } from '@/utils/utils';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import StandardTable from '@/components/StandardTable';
import { colWidth } from '@/utils/ColWidth';

/**
 * 日志记录展示组件
 * entityUuid：传入此值实体uuid
 * key:适用于当entityUuid不变时,如果想重新渲染此组件，设置key值
 */

@connect(({ log, loading }) => ({
  log,
  loading: loading.models.log,
}))
export default class EntityLogTab extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      pageFilter: {
        page: 0,
        pageSize: 20,
        sortFields: {
          logTime: true,
        },
        searchKeyValues: {
          entityUuid: props.entityUuid,
        },
      },
    };
  }

  operatedColumns = [
    {
      title: loggerLocale.operateTime,
      dataIndex: 'logTime',
      width: colWidth.dateTimeColWidth,
    },
    {
      title: loggerLocale.operator,
      dataIndex: 'operateInfo',
      width: colWidth.codeNameColWidth,
      render: (val, record) => (
        <span title={convertCodeName(record.operateInfo)}>
                    {convertCodeName(record.operateInfo)}
                </span>
      ),
    },
    {
      title: loggerLocale.event,
      dataIndex: 'event',
      width: colWidth.fixColWidth,
    },
    {
      title: loggerLocale.message,
      dataIndex: 'message',
      width: colWidth.fixColWidth,
      render: val => <EllipsisCol colValue={val}/>,
    },
  ];

  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.entityUuid !== nextProps.entityUuid) {
      const { pageFilter } = this.state;
      pageFilter.searchKeyValues.entityUuid = nextProps.entityUuid;
      this.refreshTable();
    }
    if (nextProps.key && nextProps.entityUuid && this.props.key !== nextProps.key) {
      const { pageFilter } = this.state;
      pageFilter.searchKeyValues.entityUuid = nextProps.entityUuid;
      this.refreshTable();
    }
    if (nextProps.log.data && this.state.entityUuid === nextProps.log.entityUuid) {
      this.setState({
        data: nextProps.log.data,
      });
    }
  }

  refreshTable = () => {
    const { pageFilter } = this.state;
    const { dispatch } = this.props;
    this.setState({
      entityUuid: pageFilter.searchKeyValues.entityUuid,
    });
    dispatch({
      type: 'log/queryEntityLog',
      payload: pageFilter,
    });
  };

  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { pageFilter } = this.state;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    this.refreshTable();
  };

  render() {
    const { loading } = this.props;
    const data = this.state.data;
    const paginationProps = {
      showSizeChanger: true,
      //showQuickJumper: true,
      ...data.pagination,
      pageSize: 50,
    };

    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default'),
    };

    return (
      <StandardTable
        columns={this.operatedColumns}
        data={data}
        unShowRow
        pagination={paginationProps}
        onChange={this.handleStandardTableChange}
        rowKey={record => record.uuid}
        loading={tableLoading}
      />
      // <div className={styles.standardTable}>
      //     {/*<Table*/}
      //     {/*    columns={this.operatedColumns}*/}
      //     {/*    dataSource={data.list}*/}
      //     {/*    pagination={paginationProps}*/}
      //     {/*    onChange={this.handleStandardTableChange}*/}
      //     {/*    rowKey={record => record.uuid}*/}
      //     {/*    rowClassName={(record, index) => index % 2 === 0 ? styles.lightRow : styles.darkRow}*/}
      //     {/*    rowClassName={(record, index) => index % 2 === 0 ? styles.lightRow : ''}*/}
      //     {/*    loading={tableLoading}*/}
      //     {/*></Table>*/}
      // // </div>
    );
  }
}
