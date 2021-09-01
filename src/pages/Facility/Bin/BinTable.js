import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import styles from './Bin.less';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { getUsageCaption } from '@/utils/BinUsage';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth } from '@/utils/ColWidth';
import { binState } from '@/utils/BinState';
import { commonLocale } from '@/utils/CommonLocale';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import tableStyles from '@/components/StandardTable/index.less';
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
      sortFields: {
        code: true,
      },
      searchKeyValues: {
        dcUuid: loginOrg().uuid,
        companyUuid: loginCompany().uuid,
      },
    },
  };

  componentDidMount() {
    const { pageFilter } = this.state;
    const { dispatch, upperUuid } = this.props;

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      upperUuid: upperUuid,
    };

    dispatch({
      type: 'bin/queryBin',
      payload: pageFilter,
    });
  }

  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { pageFilter } = this.state;
    const { dispatch, upperUuid } = this.props;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      upperUuid: upperUuid,
    };
    dispatch({
      type: 'bin/queryBin',
      payload: pageFilter,
    });
  };

  render() {
    const {
      loading,
      upperUuid,
    } = this.props;

    const columns = [
      {
        title: formatMessage({ id: 'bin.table.bincode' }),
        dataIndex: 'code',
        width: colWidth.codeColWidth,
      },
      {
        title: formatMessage({ id: 'bintype.title' }),
        dataIndex: 'binType',
        width: colWidth.codeNameColWidth,
        render: (text) => (text == null ? <Empty/> : <EllipsisCol colValue={'[' + text.code + ']' + text.name}/>),
      },
      {
        title: formatMessage({ id: 'bin.usage' }),
        dataIndex: 'usage',
        width: colWidth.enumColWidth,
        render: (text) => (getUsageCaption(text)),
      }, {
        title: formatMessage({ id: 'common.state' }),
        dataIndex: 'state',
        width: colWidth.enumColWidth,
        render: (text) => (binState[text].caption),
      }, {
        title: commonLocale.inWrhLocale,
        dataIndex: 'wrh',
        width: colWidth.codeNameColWidth,
        render: (text, record) => '[' + record.wrhCode + ']' + record.wrhName,
      },
    ];

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...this.props.bin.bin.pagination,
    };
    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default'),
    };
    return (
      // <Tabs className={styles.tabsWrapper} defaultActiveKey='1'>
      //   <TabPane  key='1'>
      <div className={tableStyles.standardTable}>
        <StandardTable
          rowKey={record => record.uuid}
          unShowRow={true}
          columns={columns}
          loading={tableLoading}
          dataSource={this.props.bin.bin.list}
          pagination={paginationProps}
          onChange={this.handleStandardTableChange}
        />
      </div>
      //   </TabPane>
      // </Tabs>
    );
  }
}
