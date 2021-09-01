import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, InputNumber, Checkbox, message } from 'antd';
import StoreSearchForm from './StoreCashCollRecordsSearchForm';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from './SearchPage';
import { getSourceWayCaption } from '@/utils/SourceWay';
import { basicState, getStateCaption } from '@/utils/BasicState';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { storeLocale } from './StoreCashCollRecordsLocale';
import Empty from '@/pages/Component/Form/Empty';
import { colWidth } from '@/utils/ColWidth';
import { OWNER_RES } from '@/pages/Basic/Owner/OwnerPermission';
import { strSeparatorEllipsis } from '@/utils/utils';
@connect(({ transportOrder, loading }) => ({
  transportOrder,
  loading: loading.models.transportOrder,
}))
export default class StoreCashCollRecordsSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: storeLocale.title,
      data: props.transportOrder.data,
      suspendLoading: false,
      isChecked: false,
      tableHeight : 560,
      key: 'storeCashCollRecords.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
  }

  componentDidMount() {
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    let oldData = {};
    if(nextProps.transportOrder.data && nextProps.transportOrder.data.list) {
      oldData = nextProps.transportOrder.data.list;
      if (Array.isArray(oldData)) {
        for (let i = 0; i < oldData.length; i++) {
          oldData[i].line = i + 1;
        }
      }

    }
    this.setState({
      data: {
        list: [...oldData],
        pagination: nextProps.transportOrder.data.pagination
      }
    });
  }
  /**
   * 刷新/重置
   */
  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
    }
    dispatch({
      type: 'transportOrder/queryConfirmedOrder',
      payload: queryFilter
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
    if (data) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        deliveryPointCode: data.deliveryPointCode ? JSON.parse(data.deliveryPointCode).code : ''
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid
      }
    }
    this.refreshTable();
  }

  onSaveAllTargetPage = () => {
    const { data } = this.state;
    if(data.list.length==0){
      return;
    }
    let upData = data.list;
    this.props.dispatch({
      type: 'transportOrder/collectCash',
      payload: upData
    });
  };

  /**
   * 保存
   */
  onSave = () => {
    const { selectedRows } = this.state
    if(selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }
    for (let i = 0; i < selectedRows.length; i++) {
      if (selectedRows[i].collectCashAmount < 0 || selectedRows[i].collectCashAmount === 0 || selectedRows[i].collectCashAmount===null) {
        message.error('第' + selectedRows[i].line + '行收取金额有误');
        return;
      }
    }

    this.props.dispatch({
      type: 'transportOrder/collectCash',
      payload:selectedRows,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  };

  handleFieldChange = (e, fieldName, line) => {
    const { data } = this.state;
    const target = data.list[line];
    if (fieldName === '收取金额') {
      target.collectCashAmount = e;
    }
    this.setState({
      data: {...data},

    })
  }

    /**
   * 表格列
   */
  columns = [
    {
      title: storeLocale.transportOrderBill,
      dataIndex: 'billNumber',
      key:'billNumber',
      sorter:true,
      render: val => <span>{val ? val : <Empty />}</span>
    },
    {
      title: storeLocale.sourceBill,
      dataIndex: 'sourceNum',
      key:'sourceNum',
      sorter:true,
      width: colWidth.codeColWidth,
      render: val => <span>{val ? val : <Empty />}</span>
    },
    {
      title: storeLocale.wmsBill,
      dataIndex: 'wmsNum',
      key:'wmsNum',
      sorter:true,
      render: val => <span>{val ? val : <Empty />}</span>
    },
    {
      title: storeLocale.storeCode,
      dataIndex: 'deliveryPoint.code',
      key:'deliveryPoint.code',
      sorter:true,
      render: val => <span>{val ? val : <Empty />}</span>
    },
    {
      title: storeLocale.storeName,
      dataIndex: 'deliveryPoint.name',
      key:'deliveryPoint.name',
      sorter:true,
      render: val => <span>{val ? val : <Empty />}</span>
    },
    {
      title: storeLocale.isCash,
      dataIndex: 'collectCashResult',
      key: 'collectCashResult',
      sorter:true,
      render: (text, record) => {
       if(record.collectCashResult) {
         return (
           <span>{'是'}</span>
         );
       } else {
         return (
           <span>{'否'}</span>
         );
       }
      }
    },
    {
      title: storeLocale.isCount,
      dataIndex: 'collectCashAmount',
      key: 'collectCashAmount',
      sorter:true,
      render: (text, record, index) => {
        return (
          <InputNumber
            precision = "4"
            min={0}
            value={ record.collectCashAmount ? record.collectCashAmount : 0 }
            onChange={
              e => this.handleFieldChange(e, '收取金额', index)
            }
           />
        );
      }
    },
    {
      title: storeLocale.nowCash,
      render: (text, record, index) => {
        return (
         <Checkbox checked={ record.collectCashAmount && record.collectCashAmount > 0 ? true : false} disabled={true}/>
        );
      }
    }
  ];
  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    return  <Fragment>
      <Button onClick={this.onSave}>
        {commonLocale.saveLocale}
      </Button>
    </Fragment>
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    return <StoreSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch} />;
  }
}
