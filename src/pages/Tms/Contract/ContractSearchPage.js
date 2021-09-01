import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { Switch, Button, Divider, message, Badge } from 'antd';
import { convertCodeName } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import { colWidth } from '@/utils/ColWidth';
import { loginCompany, loginOrg,getActiveKey } from '@/utils/LoginContext';
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { ORDER_RES } from '@/pages/In/Order/OrderPermission';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
import { STORE_RES } from '@/pages/Basic/Store/StorePermission';
import { contractLocal } from './ContractLocal';
import ContractSearchForm from './ContractSearchForm';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
@connect(({ alcNtc, loading }) => ({
  alcNtc,
  loading: loading.models.alcNtc,
}))
export default class AlcNtcSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: contractLocal.title,
      data: props.alcNtc.data,
      scroll: {},
      suspendLoading: false,
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues[loginOrg().type.toLowerCase() + 'Uuid'] = loginOrg().uuid;
    this.state.pageFilter.searchKeyValues.days = localStorage.getItem(window.location.hostname + "-queryBillDays");
  }

  componentDidMount() {
    if(this.props.alcNtc.fromView) {
      return;
    } else {
      this.refreshTable();
    }
    let totalWidth = 0;
    this.columns.forEach(e => {
      if (e.width) {
        totalWidth = totalWidth + e.width;
      }
    });

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.alcNtc.data
    });
  }

  drawActionButton = () => {
    return loginOrg().type == orgType.store.name ? null : (
      <Fragment>
        <Button type="primary" icon="plus"
                onClick={() => this.onCreate(null)}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'alcNtc/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  drawSearchPanel = () => {
    return <ContractSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />
  }

  getTotalWidth = (columns) => {
    let totalWidth = 0;
    columns.forEach(e => {
      if (e.width) {
        totalWidth = totalWidth + e.width;
      }
    });

    return totalWidth;
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) =>
        <span>
                    <a onClick={() => this.onView(record)}>
                        {text}
                    </a>
                    <br />
          {
            record.sourceBillNumber ? (
              <EllipsisCol colValue={contractLocal.sourceBillNumber + ':' + record.sourceBillNumber} />
            ) : null
          }
                </span>
    },
    {
      title: '开始时间',
      width: colWidth.dateColWidth,
      render: (text, record) => <span>{record.uploadDate ? convertDateToTime(record.uploadDate) : <Empty />}</span>
    },
    {
      title: '结束时间',
      width: colWidth.dateColWidth,
      render: (text, record) => <span>{record.uploadDate ? convertDateToTime(record.uploadDate) : <Empty />}</span>
    }
  ];

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
    }
    dispatch({
      type: 'alcNtc/query',
      payload: pageFilter,
    });

  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    this.refreshTable();
  }

  // /**
  //  * 跳转到详情页面
  //  */
  // onView = (record) => {
  //   this.props.dispatch({
  //     type: 'alcNtc/showPage',
  //     payload: {
  //       showPage: 'view',
  //       entityUuid: record.uuid
  //     }
  //   });
  // }


  // /**
  //  * 删除处理
  //  */
  // onRemove = (record, callback) => {
  //   const { dispatch } = this.props;
  //   const that = this;
  //   return new Promise(function (resolve, reject) {
  //     dispatch({
  //       type: 'alcNtc/onRemove',
  //       payload: record,
  //       callback: (response) => {
  //         if (callback) {
  //           that.batchCallback(response, record);
  //           resolve({ success: response.success });
  //           return;
  //         }
  //         if (response && response.success) {
  //           that.refreshTable();
  //           message.success(commonLocale.removeSuccessLocale);
  //         }
  //       }
  //     });
  //   })
  // };
}
