import { connect } from 'dva';
import { Fragment } from 'react';
import { Form } from 'antd';
import { formatMessage } from 'umi/locale';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import SearchPage from '@/pages/Component/Page/SearchPage';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName, convertDateToTime } from '@/utils/utils';
import ContainerReviewBillSearchForm from './ContainerReviewBillSearchForm';
import { containerReviewBillLocale } from './ContainerReviewBillLocale';
import Empty from '@/pages/Component/Form/Empty';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { getQueryBillDays } from '@/utils/LoginContext';
const FormItem = Form.Item;
@connect(({ containerreview, loading }) => ({
  containerreview,
  loading: loading.models.containerreview,
}))
@Form.create()
export default class ContainerReviewBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: containerReviewBillLocale.title,
      data: props.containerreview.data,
      key: 'containerReview.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    //  this.state.pageFilter.searchKeyValues.stateEquals = '';
    this.state.pageFilter.sortFields = {
      billNumber: true
    };
  }

  componentDidMount() {
    if(this.props.containerreview.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.containerreview.data
    });
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'containerreview/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 跳转到容器详情页面
   */
  onContainerView = (barcode) => {
    this.props.dispatch({
      type: 'container/get',
      payload: { barcode: barcode },
      callback: (response) => {
        console.log(response.success)
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/facility/container',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.barcode : undefined
            }
          }));
        }
      }
    });
  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
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
      type: 'containerreview/query',
      payload: queryFilter,
    });
  };

    drawSearchPanel = () => {
        return <ContainerReviewBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
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
          <a onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      }
    },
    {
      title: containerReviewBillLocale.container,
      dataIndex: 'containerBarcode',
      sorter: true,
      width: colWidth.codeColWidth,
      render:  (val, record) => record.containerBarcode == "-" ? record.containerBarcode :
        <a onClick={this.onViewContainer.bind(true, record.containerBarcode ? record.containerBarcode : undefined)}
        >{record.containerBarcode}</a>
    },
    {
      title: containerReviewBillLocale.reviewer,
      dataIndex: 'reviewer',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (val, record) => (<EllipsisCol colValue={convertCodeName(record.reviewer)} />)
    },
    {
      title: containerReviewBillLocale.beginReviewTime,
      key: 'beginReviewTime',
      sorter: true,
      width: colWidth.dateColWidth,
      render: record => record.beginReviewTime ? convertDateToTime(record.beginReviewTime) : <Empty />
    },
    {
      title: containerReviewBillLocale.endReviewTime,
      key: 'endReviewTime',
      sorter: true,
      width: colWidth.dateColWidth,
      render: record => record.endReviewTime ? convertDateToTime(record.endReviewTime) : <Empty />
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
