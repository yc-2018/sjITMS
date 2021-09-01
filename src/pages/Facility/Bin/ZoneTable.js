import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import styles from './Bin.less';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import Empty from '@/pages/Component/Form/Empty';
import StandardTable from '@/components/StandardTable';

const TabPane = Tabs.TabPane;
@connect(({ bin, loading }) => ({
  bin,
  loading: loading.models.bin,
}))
export default class ZoneTable extends PureComponent {
  state = {
    pageFilter: {
      page: 0,
      pageSize: 20,
      searchKeyValues: {
        dcUuid: loginOrg().uuid,
        companyUuid: loginCompany().uuid,
      },
      sortFields: {
        code: true,
      },
    },
  };

  componentDidMount() {
    const { pageFilter } = this.state;
    const { dispatch } = this.props;

    dispatch({
      type: 'bin/queryZone',
      payload: pageFilter,
    });
  }

  /**
   *
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { pageFilter } = this.state;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;
    pageFilter.sortFields = {
      code: true,
    };
    const { dispatch } = this.props;
    dispatch({
      type: 'bin/queryZone',
      payload: pageFilter,
    });
  };

  render() {
    const {
      loading,
    } = this.props;

    const columns = [
      {
        title: formatMessage({ id: 'bin.table.zooncode' }),
        dataIndex: 'code',
        width: colWidth.codeColWidth,
      },
      {
        title: formatMessage({ id: 'common.name' }),
        dataIndex: 'name',
        width: colWidth.codeColWidth,
      },
      {
        title: formatMessage({ id: 'wrh.title' }),
        dataIndex: 'wrh',
        width: colWidth.codeNameColWidth,
        render: (text) => (text == null ? <Empty/> : convertCodeName(text)),
      },
    ];

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...this.props.bin.zone.pagination,
    };


    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default'),
    };
    return (
      // <Tabs className={styles.tabsWrapper} defaultActiveKey='1'>
      //   <TabPane tab={formatMessage({ id: 'bin.facility.zone' })} key='1'>

      <StandardTable
        rowKey={record => record.uuid}
        unShowRow={true}
        columns={columns}
        dataSource={this.props.bin.zone.list}
        pagination={paginationProps}
        loading={tableLoading}
        onChange={this.handleStandardTableChange}
      />

      //   </TabPane>
      // </Tabs>
    );
  }
}
