import { connect } from 'dva';
import { Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, message, Form } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import Empty from '@/pages/Component/Form/Empty';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
import { convertCodeName, convertDateToTime, convertDate } from '@/utils/utils';
import { State } from './ShipBillContants';
import { shipBillLocale } from './ShipBillLocale';
import { SHIPBILL_RES } from './ShipBillPermission';
import ShipBillSearchForm from './ShipBillSearchForm';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth';
import { simpleOperateMethod } from '@/utils/OperateMethod';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { orgType } from '@/utils/OrgType';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import { getQueryBillDays } from '@/utils/LoginContext';
const FormItem = Form.Item;

@connect(({ shipbill, loading }) => ({
  shipbill,
  loading: loading.models.shipbill,
}))
@Form.create()
export default class ShipBillSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: shipBillLocale.title,
      data: props.shipbill.data,
      suspendLoading: false,
      key: 'shipBill.search.table',
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.sortFields = {
      billNumber: true
    };
  }

  componentDidMount() {
    if(this.props.shipbill.fromView) {
      return;
    } else {
      this.refreshTable();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.shipbill.data
    });
  }

  onBatchRemove = () => {
    this.setState({
      batchAction: commonLocale.deleteLocale
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchAudit = () => {
    this.setState({
      batchAction: commonLocale.auditLocale
    });
    this.handleBatchProcessConfirmModalVisible(true);
  }

  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === commonLocale.deleteLocale) {
          if (selectedRows[i].state === State.SAVED.name) {
            that.onRemove(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        } else if (batchAction === commonLocale.auditLocale) {
          if (selectedRows[i].state === State.SAVED.name) {
            that.onAudit(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.refs.batchHandle.calculateTaskSkipped();
            bacth(i + 1);
          }
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }
    bacth(0);
  }

  onAudit = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'shipbill/onAudit',
        payload: record,
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.auditSuccessLocale)
          }
        }
      })
    })
  }

  onRemove = (record, batch) => {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'shipbill/onRemove',
        payload: record,
        callback: (response) => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshTable();
            message.success(commonLocale.removeSuccessLocale)
          }
        }
      })
    })
  }

  onView = (record) => {
    this.props.dispatch({
      type: 'shipbill/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    });
  }

  onCreate = (uuid) => {
    this.props.dispatch({
      type: 'shipbill/showPage',
      payload: {
        showPage: 'create',
        entityUuid: uuid
      }
    });
  }

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    var days = '';
    if (data) {
      if (data.downloadDate && data.downloadDate[0] && data.downloadDate[1]) {
        data.downloadDateStart = moment(data.downloadDate[0]).format('YYYY-MM-DD HH:mm:ss');
        data.downloadDateEnd = moment(data.downloadDate[1]).format('YYYY-MM-DD HH:mm:ss');
        delete data.downloadDate;
      } else if (pageFilter.searchKeyValues.downloadDateStart && pageFilter.searchKeyValues.downloadDateEnd) {
        delete pageFilter.searchKeyValues.downloadDateStart;
        delete pageFilter.searchKeyValues.downloadDateEnd;
      }

      if (data.ownerEquals)
        data.ownerUuidEquals = JSON.parse(data.ownerEquals).uuid
      else
        delete data.ownerUuidEquals
      if (data.driverEquals)
        data.driverUuidEquals = JSON.parse(data.driverEquals).uuid
      else
        delete data.driverUuidEquals
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
      },
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

    const currentOrgType = loginOrg().type;
    const createOrgUuid = (orgType.carrier.name === currentOrgType) ? null : loginOrg().uuid;
    const carrierUuid = (orgType.carrier.name === currentOrgType) ? loginOrg().uuid : null;

    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      createOrgUuid: createOrgUuid,
      carrierUuid: carrierUuid
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'shipbill/query',
      payload: queryFilter,
    });
  };

  onViewShipPlanBill = (planBillNumber) => {
    this.props.dispatch({
      type: 'shipplanbill/getByBillNumber',
      payload: {
        billNumber: planBillNumber
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          this.props.dispatch(routerRedux.push(
            {
              pathname: '/tms/shipplanbill',
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
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return (
      orgType.carrier.name != loginOrg().type && <Fragment>
        <Button type="primary" icon='plus' onClick={this.onCreate.bind(this, '')} disabled={!havePermission(SHIPBILL_RES.CREATE)}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    )
  }

  drawToolbarPanel() {
    const { selectedRows } = this.state;
    const batchPrintParams = [];
    selectedRows.forEach(function (e) {
      batchPrintParams.push({
        billNumber: e.billNumber
      })
    });

    if (orgType.carrier.name === loginOrg().type) {
      return [
        <PrintButton
          key='printButton'
          reportParams={batchPrintParams}
          moduleId={PrintTemplateType.SHIPBILL.name} />
      ];
    } else {
      return [
        <Button key="onBatchAudit" onClick={() => this.onBatchAudit()} disabled={!havePermission(SHIPBILL_RES.AUDIT) || orgType.carrier.name === loginOrg().type} >
          {commonLocale.batchAuditLocale}
        </Button>,
        <Button key="onBatchRemove" onClick={() => this.onBatchRemove()} disabled={!havePermission(SHIPBILL_RES.DELETE) || orgType.carrier.name === loginOrg().type}>
          {commonLocale.batchRemoveLocale}
        </Button>,
        <PrintButton
          key='printButton'
          reportParams={batchPrintParams}
          moduleId={PrintTemplateType.SHIPBILL.name} />
      ];
    }
  }

  drawSearchPanel = () => {
    return <ShipBillSearchForm filterValue={this.state.pageFilter.searchKeyValues}
                               refresh={this.onSearch} />;
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

    if ((record.state === State.SAVED.name) && orgType.carrier.name != loginOrg().type) {
      operateProps.push(
        {
          name: commonLocale.editLocale,
          disabled: !havePermission(SHIPBILL_RES.EDIT),
          onClick: this.onCreate.bind(this, record.uuid)
        },
        {
          name: commonLocale.auditLocale,
          confirm: true,
          disabled: !havePermission(SHIPBILL_RES.AUDIT),
          confirmCaption: shipBillLocale.title,
          onClick: this.onAudit.bind(this, record, false)
        },
        {
          name: commonLocale.deleteLocale,
          confirm: true,
          disabled: !havePermission(SHIPBILL_RES.DELETE),
          confirmCaption: shipBillLocale.title,
          onClick: this.onRemove.bind(this, record, false)
        }
      );
    }

    if(record.state === State.INPROGRESS.name&& orgType.carrier.name != loginOrg().type){
      operateProps.push(
        {
          name: commonLocale.editLocale,
          disabled: !havePermission(SHIPBILL_RES.EDIT),
          onClick: this.onCreate.bind(this, record.uuid)
        },
      );
    }
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
      width: colWidth.billNumberColWidth,
      render: (text, record) => <a onClick={this.onViewShipPlanBill.bind(true, record.shipPlanBillNumber)}>
        {record.shipPlanBillNumber}</a>
    },
    {
      title: shipBillLocale.plateNumber,
      key: 'plateNumber',
      dataIndex: 'plateNumber',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (text, record) => record.vehicle ? record.vehicle.name : <Empty />
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
      title: commonLocale.operateMethodLocale,
      dataIndex: 'operateMethod',
      sorter: true,
      width: colWidth.enumColWidth,
      render: val => simpleOperateMethod[val].caption
    },
    {
      title: commonLocale.inDownloadDateLocale,
      dataIndex: 'downloadDate',
      sorter: true,
      width: colWidth.dateColWidth,
      render: (text, record) => <span>{record.downloadDate ? convertDateToTime(record.downloadDate) : <Empty />}</span>
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      dataIndex: 'state',
      sorter: true,
      render: (text, record) => {
        return (<BadgeUtil value={record.state} />)
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
