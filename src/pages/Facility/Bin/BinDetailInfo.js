import React, { PureComponent, Fragment } from 'react';
import {
  Table,
  Icon,
  Popconfirm,
  Button, Tabs
} from 'antd';
import { connect } from 'dva';
import styles from './Bin.less';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import { formatMessage, getLocale } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import OperateInfoTable from '@/components/MyComponent//OperateInfoTable';
import BinStockTable from './BinStockTable';
import { SERVICE_CAPTION } from '@/utils/constants';

const TabPane = Tabs.TabPane;
@connect(({ bin, loading }) => ({
  bin,
  loading: loading.models.bin,
}))
export default class BinDetailInfo extends PureComponent {
  state = {
    reShow: false,
    pageFilter: {
      page: 0,
      pageSize: 20,
      sortFields: {},
      searchKeyValues: {
      },
    },
  };

  componentDidMount() {
    const { pageFilter } = this.state;
    const { dispatch, upperUuid, } = this.props;

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      entityUuid: upperUuid,
      serviceCaption: SERVICE_CAPTION['bin']
    };

    dispatch({
      type: 'log/queryEntityLog',
      payload: pageFilter,
    });
  }

  render() {
    const { loading, upperUuid, bincode, binEntity } = this.props;

    const entity = {
      uuid: upperUuid
    }
    const tableLoading = {
      spinning: loading,
      indicator: LoadingIcon('default')
    }
    return (
      <div className={styles.detailContent} >
        <Tabs className={styles.tabsWrapper} defaultActiveKey='1'>
          <TabPane tab={formatMessage({ id: 'bin.facility.stockInfo' })} key='1'>
            <BinStockTable
              loading={tableLoading}
              upperUuid={upperUuid}
              bincode={bincode}
            />
          </TabPane>
          <TabPane tab={formatMessage({ id: 'bintype.detail.tab.operateInfo' })} key='2'>
            <OperateInfoTable
              entity={entity}
              serviceCaption={SERVICE_CAPTION['bin']}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
