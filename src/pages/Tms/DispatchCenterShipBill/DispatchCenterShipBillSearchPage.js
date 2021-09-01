import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Form} from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { convertCodeName, convertDateToTime, convertDate } from '@/utils/utils';
import { State } from './DispatchCenterShipBillContants';
import { shipBillLocale } from './DispatchCenterShipBillLocale';
import DispatchCenterShipBillSearchForm from './DispatchCenterShipBillSearchForm';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth';
import { simpleOperateMethod } from '@/utils/OperateMethod';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { getQueryBillDays } from '@/utils/LoginContext';

const FormItem = Form.Item;

@connect(({ dispatchCenterShipBill, loading }) => ({
  dispatchCenterShipBill,
  loading: loading.models.dispatchCenterShipBill,
}))
@Form.create()
export default class DispatchCenterShipBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: shipBillLocale.title,
      data: props.dispatchCenterShipBill.data,
      suspendLoading: false,
      key: 'dispatchCenterShipBill.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    };
  }

  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.dispatchCenterShipBill.data
    });
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'dispatchCenterShipBill/showPage',
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
      if (data.vehicleEmployeeUuid)
        data.vehicleEmployeeUuid = JSON.parse(data.vehicleEmployeeUuid).uuid
      else
        delete data.driverUuidEquals;
      if (data.days) {
        days = data.days
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        days: days
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        ownerUuidEquals: null,
        driverUuidEquals: null,
        days: getQueryBillDays()
      };
        pageFilter.sortFields = {
          billNumber: false
        }
    }
    this.refreshTable();
  }

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

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      dispatchCenterUuid: loginOrg().uuid
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'dispatchCenterShipBill/query',
      payload: queryFilter,
    });
  };

  drawSearchPanel = () => {
    return <DispatchCenterShipBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
                               refresh={this.onSearch}  toggleCallback={this.toggleCallback}/>;
  }

  handleCancel() {
    this.props.form.resetFields();
    this.refreshTable();
  }

  fetchOperateProps = (record) => {
    let operateProps = [];
    operateProps.push(
      {
        name: commonLocale.viewLocale,
        onClick: this.onView.bind(this, record)
      }
    );
    return operateProps;
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
      title: shipBillLocale.shipPlanBillNumber,
      dataIndex: 'shipPlanBillNumber',
      sorter: true,
      width: colWidth.billNumberColWidth
    },
    {
      title: shipBillLocale.plateNumber,
      key: 'plateNumber',
      dataIndex: 'plateNumber',
      sorter: true,
      width: colWidth.codeColWidth,
    },
    {
      title: shipBillLocale.carrier,
      dataIndex: 'carrier',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) => <a onClick={this.onViewCarrier.bind(true, record.carrier ? record.carrier.uuid : undefined)}>
        {convertCodeName(record.carrier)}</a>
    },
    {
      title: shipBillLocale.serialArch,
      dataIndex: 'serialArch',
      sorter: true,
      width: colWidth.billNumberColWidth,
      render: (text, record) => <EllipsisCol colValue={convertCodeName(record.serialArch)} />
    },
    {
      title: shipBillLocale.wholeCase,
      dataIndex: 'cartonCount',
      sorter: true,
      width: colWidth.codeNameColWidth
    },
    {
      title: shipBillLocale.passBox,
      dataIndex: 'containerCount',
      sorter: true,
      width: colWidth.codeNameColWidth
    },
    {
      title: shipBillLocale.weight,
      dataIndex: 'weight',
      sorter: true,
      width: colWidth.codeNameColWidth
    },
    {
      title: shipBillLocale.volume,
      dataIndex: 'volume',
      sorter: true,
      width: colWidth.codeNameColWidth
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'stat',
      sorter: true,
      render: (text, record) => {
        return (<EllipsisCol colValue={State[record.stat].caption} />)
      }
    },
    {
      key: 'operate',
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => {
        return (<OperateCol menus={this.fetchOperateProps(record)} />)
      }
    },
  ];
}
