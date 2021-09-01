import { connect } from 'dva';
import { Fragment } from 'react';
import { Form } from 'antd';
import { formatMessage } from 'umi/locale';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName, convertDateToTime } from '@/utils/utils';
import { collectBinReviewBillLocale } from './CollectBinReviewBillLocale';
import CollectBinReviewBillSearchForm from './CollectBinReviewBillSearchForm';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import moment from 'moment';
import { getActiveKey} from '@/utils/LoginContext';
import { getQueryBillDays } from '@/utils/LoginContext';
const FormItem = Form.Item;
@connect(({ collectbinreview, loading }) => ({
  collectbinreview,
  loading: loading.models.collectbinreview,
}))
@Form.create()
export default class CollectBinReviewBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: collectBinReviewBillLocale.title,
      data: props.collectbinreview.data,
      key: 'collectBinReview.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.searchKeyValues.stateEquals = '';
    this.state.pageFilter.sortFields = {
      billNumber: true
    };
  }

  componentDidMount() {
    if(this.props.collectbinreview.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.collectbinreview.data
    });
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'collectbinreview/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      let storeUuidEquals = undefined;
      let reviewerUuidEquals = undefined;

      if (data.store) {
        storeUuidEquals = JSON.parse(data.store).uuid
      }
      if (data.reviewerUuidEquals) {
        data.reviewerUuidEquals = JSON.parse(data.reviewerUuidEquals).uuid
      }
      if (data.days) {
        days = data.days
      }
      if (data.endReviewTime && data.endReviewTime[0] && data.endReviewTime[1]) {
        data.endReviewDateStart = moment(data.endReviewTime[0]).format('YYYY-MM-DD HH:mm:ss');
        data.endReviewDateEnd = moment(data.endReviewTime[1]).format('YYYY-MM-DD HH:mm:ss');
        delete data.endReviewTime;
      } else if (pageFilter.searchKeyValues.endReviewDateStart && pageFilter.searchKeyValues.endReviewDateEnd) {
        delete pageFilter.searchKeyValues.endReviewDateStart;
        delete pageFilter.searchKeyValues.endReviewDateEnd;
      }

      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        storeUuidEquals: storeUuidEquals,
        reviewerUuidEquals: reviewerUuidEquals,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        days: getQueryBillDays()
      }
    }
    this.refreshTable();
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
      pageFilter.searchKeyValues.days = getQueryBillDays()
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'collectbinreview/query',
      payload: queryFilter,
    });
  };

    drawSearchPanel = () => {
        return <CollectBinReviewBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
            refresh={this.onSearch} toggleCallback={this.toggleCallback}/>;
    }

  handleCancel() {
    this.props.form.resetFields();
    this.refreshTable();
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) => {
        return (
          <a
            onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      }
    },
    {
      title: '波次单号',
      dataIndex: 'waveBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth
    },
    {
      title: collectBinReviewBillLocale.store,
      dataIndex: 'store',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (val, record) => (<EllipsisCol colValue={convertCodeName(record.store)} />)
    },
    {
      title: collectBinReviewBillLocale.reviewer,
      dataIndex: 'reviewer',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (val, record) => (<EllipsisCol colValue={convertCodeName(record.reviewer)} />)
    },
    {
      title: collectBinReviewBillLocale.beginReviewTime,
      dataIndex: 'beginReviewTime',
      sorter: true,
      width: colWidth.dateColWidth,
      render: (val, record)  => record.beginReviewTime ? convertDateToTime(record.beginReviewTime) : <Empty />
    },
    {
      title: collectBinReviewBillLocale.endReviewTime,
      dataIndex: 'endReviewTime',
      sorter: true,
      width: colWidth.dateColWidth,
      render: (val, record)  => record.endReviewTime ? convertDateToTime(record.endReviewTime) : <Empty />
    },
    {
      title: commonLocale.stateLocale,
      dataIndex: 'state',
      sorter: true,
      width: colWidth.enumColWidth,
      render: (val, record) => {
        return (<BadgeUtil value={record.state} />)
      }
    },
    {
      title: commonLocale.operateLocale,
      key: 'operate',
      width: colWidth.operateColWidth,
      render: record => (
        <Fragment>
          <a onClick={() => this.onView(record)}>
            {commonLocale.viewLocale}
          </a>
        </Fragment>
      ),
    }
  ];
}
