import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, message } from 'antd';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import SearchPage from '@/pages/Component/Page/SearchPage';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { havePermission } from '@/utils/authority';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import { BookType, State } from './BookContants';
import { BOOK_RES } from './BookPermission';
import { bookLocale } from './BookLocale';
import BookSearchForm from './BookSearchForm';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { VENDOR_RES } from '@/pages/Basic/Vendor/VendorPermission';
import { routerRedux } from 'dva/router';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ book, loading }) => ({
  book,
  loading: loading.models.book,
}))
export default class BookSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: bookLocale.title,
      data: props.book.data,
      suspendLoading:false,
      key: 'book.search.table'
    };

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
  }

  componentDidMount() {
    if(this.props.book.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.book.data
    });
  }

  drawActionButton = () => {
    return (
      <Fragment>
        <Button type="primary" icon='plus'
          disabled={!havePermission(BOOK_RES.CREATE)}
          onClick={() => this.onCreate(null)}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'book/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  /**
   * 跳转到供应商详情页面
   */
  onVendorView = (vendor) => {
    this.props.dispatch({
      type: 'vendor/get',
      payload: vendor.uuid,
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/basic/vendor',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }


  drawSearchPanel = () => {
    return <BookSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} toggleCallback={this.toggleCallback}/>
  }

  drawToolbarPanel = () => {
    return [
      <Button key='onAudit' disabled={!havePermission(BOOK_RES.AUDIT)}
        onClick={() => this.onBatchAudit()}
      >
        {commonLocale.batchAuditLocale}
      </Button>,
      <Button key='onAbort' disabled={!havePermission(BOOK_RES.ABORT)}
        onClick={() => this.onBatchAbort()}
      >
        {commonLocale.batchAbortLocale}
      </Button>
    ];
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }

  fetchOperatePropsTwo = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.abortLocale,
      disabled: !havePermission(BOOK_RES.ABORT),
      confirm: true,
      confirmCaption: bookLocale.title,
      onClick: this.onAbort.bind(this, record, false)
    }];
  }

  fetchOperatePropsThree = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.deleteLocale,
      disabled: !havePermission(BOOK_RES.REMOVE),
      confirm: true,
      confirmCaption: bookLocale.title,
      onClick: this.onRemove.bind(this, record)
    }, {
      name: commonLocale.auditLocale,
      disabled: !havePermission(BOOK_RES.AUDIT),
      confirm: true,
      confirmCaption: bookLocale.title,
      onClick: this.onAudit.bind(this, record, false)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(BOOK_RES.CREATE),
      onClick: this.onCreate.bind(this, record.uuid)
    }];
  }

  renderOperateCol = (record) => {
    if (State[record.state].name == 'SAVED') {
      return <OperateCol menus={this.fetchOperatePropsThree(record)} />
    }
    if (State[record.state].name == 'AUDITED') {
      return <OperateCol menus={this.fetchOperatePropsTwo(record)} />
    }
    if (State[record.state].name == 'ABORTED') {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    }
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>
    },
    {
      title: commonLocale.inVendorLocale,
      dataIndex: 'vendor',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <a onClick={this.onVendorView.bind(this, val) }
      disabled={!havePermission(VENDOR_RES.VIEW)}><EllipsisCol colValue={convertCodeName(val)} /></a>
    },
    {
      title: bookLocale.dockGroup,
      dataIndex: 'dockGroup',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: bookLocale.type,
      dataIndex: 'bookType',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => BookType[val].caption
    },
    {
      title: commonLocale.inQtyStrLocale,
      dataIndex: 'qtyStr',
      sorter: true,
      width: itemColWidth.qtyColWidth
    },
    {
      title: bookLocale.bookTimeRange,
      width: colWidth.dateColWidth + 20,
      render: record => {
        return moment(record.bookDate).format('YYYY-MM-DD') + ' ' + record.startTime + '~' + record.endTime;
      }
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      sorter: true,
      render: val => <BadgeUtil value={val} />
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,

      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

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
      type: 'book/query',
      payload: queryFilter,
    });
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      let vendorUuid = undefined;
      let dockGroupUuid = undefined;
      if (data.vendor) {
        vendorUuid = JSON.parse(data.vendor).uuid
      }
      if (data.dockGroup) {
        dockGroupUuid = JSON.parse(data.dockGroup).uuid
      }
      if (data.days) {
        days = data.days
      }
      if (data.date && data.date[0] && data.date[1]) {
        data.beginBookDate = moment(data.date[0]).format('YYYY-MM-DD HH:mm:ss');
        data.endBookDate = moment(data.date[1]).format('YYYY-MM-DD HH:mm:ss');
      } else if (pageFilter.searchKeyValues.beginBookDate && pageFilter.searchKeyValues.endBookDate) {
        delete pageFilter.searchKeyValues.beginBookDate;
        delete pageFilter.searchKeyValues.endBookDate;
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        vendorUuid: vendorUuid,
        dockGroupUuid: dockGroupUuid,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        days: getQueryBillDays()
      };
    }
    this.refreshTable();
  }

  /**
   * 跳转到详情页面
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'book/showPage',
      payload: {
        showPage: 'view',
        billNumber: record.billNumber
      }
    });
  }

  /**
  * 删除处理
  */
  onRemove = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'book/onRemove',
      payload: record,
      callback: (response) => {
        if (response && response.success) {
          this.refreshTable();
          message.success(commonLocale.removeSuccessLocale);
        }
      }
    });
  };

  /**
   * 审核处理
   */
  onAudit = (record, callback) => {
    const { dispatch } = this.props;
    let that =this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'book/onAudit',
        payload: record,
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.auditSuccessLocale);
          }
        }
      });
    })
  };

  /**
  * 作废处理
  */
  onAbort = (record, callback) => {
    const { dispatch } = this.props;
    let that =this;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'book/onAbort',
        payload: record,
        callback: (response) => {
          if (callback) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.abortSuccessLocale);
          }
        }
      });
    })
  };

  /**  批处理相关 开始  **/
  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchAbort = () => {
    this.setState({
      batchAction: commonLocale.abortLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    this.setState({
      suspendLoading:true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth=(i)=>{
      if(i<selectedRows.length){
        if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state !== State.SAVED.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i+1);
          } else {
            that.onAudit(selectedRows[i], true).then(res=>{
              bacth(i+1)
            });
          }
        } else if (batchAction === commonLocale.abortLocale) {
          if (selectedRows[i].state !== State.AUDITED.name) {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i+1);
          } else {
            that.onAbort(selectedRows[i], true).then(res=>{
              bacth(i+1);
            });
          }
        }
      }else{
        this.setState({
          suspendLoading:false
        })
      }
    }
    bacth(0);
  }

  /**  批处理相关 结束  **/
}
