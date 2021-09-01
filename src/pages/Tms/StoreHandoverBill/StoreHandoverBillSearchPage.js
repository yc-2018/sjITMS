import { connect } from 'dva';
import { Form } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { convertCodeName, convertDateToTime } from '@/utils/utils';
import { havePermission } from '@/utils/authority';
import StoreHandoverBillSearchForm from './StoreHandoverBillSearchForm';
import { State } from './StoreHandoverBillContants';
import { storeHandoverLocale } from './StoreHandoverBillLocale';
import { STOREHANDOVERBILL_RES } from './StoreHandoverBillPremission';
import OperateCol from '@/pages/Component/Form/OperateCol';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import { routerRedux } from 'dva/router';
import { getQueryBillDays } from '@/utils/LoginContext';

@connect(({ storeHandover, loading }) => ({
  storeHandover,
  loading: loading.models.storeHandover,
}))
@Form.create()
export default class StoreHandoverBillSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: storeHandoverLocale.title,
      data: props.storeHandover.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      key: 'storeHandoverBill.search.table',
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.createOrgUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    }
  }

  componentDidMount() {
    if(this.props.storeHandover.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.storeHandover.data
    });
  }

  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
      if(pageFilter.searchKeyValues && !pageFilter.searchKeyValues.days) {
        pageFilter.searchKeyValues.days = getQueryBillDays()
      }
    }

    const currentOrgType = loginOrg().type;
    const createOrgUuid = (orgType.carrier.name === currentOrgType || orgType.store.name === currentOrgType) ? null : loginOrg().uuid;
    const carrierUuid = (orgType.carrier.name === currentOrgType) ? loginOrg().uuid : null;
    const storeUuid = (orgType.store.name === currentOrgType) ? loginOrg().uuid : pageFilter.searchKeyValues.storeUuid;

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      createOrgUuid: createOrgUuid,
      carrierUuid: carrierUuid,
      storeUuid: storeUuid
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'storeHandover/query',
      payload: queryFilter,
    });
  };
  /**
   * 搜索
   */
  onSearch = (data) => {
    const {
      pageFilter
    } = this.state;
    pageFilter.page = 0;
    var days = '';

    if (data) {
      let storeUuid = undefined;
      if (data.store)
        storeUuid = JSON.parse(data.store).uuid;
      let dcUuid = undefined;
      if (data.fromOrg)
        dcUuid = JSON.parse(data.fromOrg).uuid;
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        storeUuid: storeUuid,
        dcUuid: dcUuid,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        createOrgUuid: loginOrg().uuid,
        days: getQueryBillDays()
      }
    }
    this.refreshTable();
  }


  onEdit = (record) => {
    this.props.dispatch({
      type: 'storeHandover/showPage',
      payload: {
        showPage: 'create',
        entityUuid: record.uuid
      }
    });
  }

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch({
      type: 'storeHandover/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onViewShipBill = (shipBillNumber) => {
    this.props.dispatch({
      type: 'shipbill/getByBillNumber',
      payload: {
        billNumber: shipBillNumber,
        companyUuid: loginCompany().uuid
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          this.props.dispatch(routerRedux.push(
            {
              pathname: '/tms/shipbill',
              payload: {
                showPage: 'view',
                entityUuid: response.data.uuid
              }
            }
          ))
        }
      }
    })
  }

  /**
   * 表格列
   */
  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) =>
        <a onClick={() => this.onView(record)}>
          {text}
        </a>
    },
    {
      title: storeHandoverLocale.shipBillNumber,
      dataIndex: 'shipBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) =>
        <a onClick={this.onViewShipBill.bind(true, record.shipBillNumber)}>
          {text}</a>
    },
    {
      title: commonLocale.inStoreLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'store',
      sorter: true,
      render: (text, record) => <a onClick={this.onViewStore.bind(true, record.store ? record.store.uuid : undefined)}>
        {<EllipsisCol colValue={convertCodeName(record.store)} />}</a>
    },
    {
      title: storeHandoverLocale.vehicle,
      dataIndex: 'vehicle',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.vehicle)} />
    },
    {
      title: commonLocale.inUploadDateLocale,
      dataIndex: 'upLoadDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: (text, record) => <span>{record.uploadDate ? convertDateToTime(record.uploadDate) : <Empty />}</span>
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      sorter: true,
      render: (text, record) => <BadgeUtil value={record.state} />
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: (text, record) => (
        this.renderOperateCol(record)
      ),
    },
  ];

  renderOperateCol = (record) => {
    if (State[record.state].name == State.AUDITED.name || orgType.carrier.name == loginOrg().type) {
      return <OperateCol menus={this.fetchOperatePropsTow(record)} />
    } else {
      return <OperateCol menus={this.fetchOperatePropsOne(record)} />
    }
  }

  fetchOperatePropsOne = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }, {
      name: commonLocale.editLocale,
      disabled: !havePermission(STOREHANDOVERBILL_RES.EDIT),
      onClick: this.onEdit.bind(this, record)
    }];
  }

  fetchOperatePropsTow = (record) => {
    return [{
      name: commonLocale.viewLocale,
      onClick: this.onView.bind(this, record)
    }];
  }

  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    const { selectedRows } = this.state;

    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });

    return [
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.STOREHANDOVERBILL.name} />
    ];
  }



  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return (
      <StoreHandoverBillSearchForm
        filterValue={this.state.pageFilter.searchKeyValues}
        refresh={this.onSearch}
      />
    );
  }
    /**
    * 绘制搜索表格
    */
    drawSearchPanel = () => {
        return (
            <StoreHandoverBillSearchForm
                filterValue={this.state.pageFilter.searchKeyValues}
                refresh={this.onSearch} toggleCallback={this.toggleCallback}
            />
        );
    }
}
