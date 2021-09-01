import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import styles from './Bin.less';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { BIN_FACILITY } from '@/utils/constants';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import StandardTable from '@/components/StandardTable';

const TabPane = Tabs.TabPane;
@connect(({ bin, loading }) => ({
  bin,
  loading: loading.models.bin,
}))
export default class PathAndShelfTable extends PureComponent {
  state = {
    reShow: false,
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
    const { dispatch, binFacilityType, upperUuid } = this.props;

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      ...pageFilter.sortFields,
      upperUuid: upperUuid,
    };

    let type = 'bin/queryPath';
    if (BIN_FACILITY['PATH'] === binFacilityType)
      type = 'bin/queryShelf';
    dispatch({
      type: type,
      payload: pageFilter,
    });
  }

  /**
   * 表格内容改变时，调用此方法
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    let { pageFilter } = this.state;
    const { dispatch, title, upperUuid } = this.props;

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      upperUuid: upperUuid,
    };

    let type = 'bin/queryPath';
    if (title === '货架') {
      type = 'bin/queryShelf';
    }
    dispatch({
      type: type,
      payload: pageFilter,
    });
  };

  render() {
    const {
      loading,
      title,
      upperUuid,
      binFacilityType,
    } = this.props;


    let list = BIN_FACILITY['PATH'] === binFacilityType ? this.props.bin.shelf.list :
      this.props.bin.path.list;

    let pagination = BIN_FACILITY['PATH'] === binFacilityType ? this.props.bin.shelf.pagination :
      this.props.bin.path.pagination;

    const columns = [
      {
        title: BIN_FACILITY['PATH'] === binFacilityType?formatMessage({ id: 'bin.table.shelfcode' }):formatMessage({ id: 'bin.table.pathcode' }),
        dataIndex: 'code',
        width: colWidth.codeColWidth,
      }, {
        title: commonLocale.inWrhLocale,
        dataIndex: 'wrh',
        width: colWidth.codeNameColWidth,
        render: (text, record) => convertCodeName(record.wrh),
      },
    ];

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
    };
    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default'),
    };

    return (
      // <Tabs className={styles.tabsWrapper} defaultActiveKey='1'>
      //   <TabPane tab={this.props.title} key='1'>
         
          <StandardTable
            rowKey={record => record.uuid}
            unShowRow={true}
            columns={columns}
            dataSource={list}
            loading={tableLoading}
            pagination={paginationProps}
            onChange={this.handleStandardTableChange}
          />
          
      //   </TabPane>
      // </Tabs>
    );
  }
}
