import React, { Component, Fragment } from 'react';
import { Modal, Select, Button, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment'
import { PRETYPE } from '@/utils/constants';
import { convertCodeName } from '@/utils/utils';
import { colWidth } from '@/utils/ColWidth';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import ExcelImport from '@/components/ExcelImport';
import StandardTable from '@/components/StandardTable';
import PreType from '@/components/MyComponent/PreType';
import Empty from '@/pages/Component/Form/Empty';
import PreviewBillCreatePage from '@/pages/In/Preview/PreviewBillCreatePage';
import {ImportTemplateType} from '@/pages/Account/ImTemplate/ImTemplateContants';
import DeliveredConfirmSearchPage from './DeliveredConfirmSearchPage';
import { DeliveredType, OrderType } from './DeliveredConfirmContants';
import { deliveredConfirmLocale } from './DeliveredConfirmLocale';

const typeOptions = [];
Object.keys(DeliveredType).forEach(function (key) {
  typeOptions.push(<Select.Option key={DeliveredType[key].name} value={DeliveredType[key].name}>{DeliveredType[key].caption}</Select.Option>);
});
@connect(({ deliveredConfirm, loading }) => ({
  deliveredConfirm,
  loading: loading.models.deliveredConfirm,
}))
export default class StoreItemConfirmModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible:props.visible,
      storeUuid:props.storeUuid,
      storeCode:props.storeCode,
      storeName:props.storeName,
      storeAddress : props.storeAddress,
      scheduleBillNumber:props.scheduleBillNumber,
      data:props.deliveredConfirm.storeBillData,
      selectedRows:[],
      pageFilter: {
        page: 0,
        pageSize: 20,
        sortFields: {},
        searchKeyValues: {
          companyUuid:loginCompany().uuid,
          dispatchCenterUuid:loginOrg().uuid,
          storeUuid:props.storeUuid,
          storeCode:props.storeCode,
          storeName:props.storeName,
          storeAddress:props.storeAddress,
          shipPlanNumber:props.scheduleBillNumber,
          orderTypes :[ OrderType.Delivery.name,OrderType.TransportIn.name,OrderType.TransportOut.name,OrderType.PackageDelivery.name ]
        },
        likeKeyValues: {}
      }
    }
  }
  componentDidMount(){
    this.refresh()
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.storeUuid!==this.props.storeUuid || nextProps.storeCode !==this.props.storeCode || nextProps.storeName!== this.props.storeName || nextProps.storeAddress !==this.props.storeAddress){
      this.state.pageFilter.searchKeyValues.storeUuid = nextProps.storeUuid
      this.state.pageFilter.searchKeyValues.storeCode = nextProps.storeCode
      this.state.pageFilter.searchKeyValues.storeName = nextProps.storeName
      this.state.pageFilter.searchKeyValues.shipPlanNumber = nextProps.scheduleBillNumber
      this.state.pageFilter.searchKeyValues.storeAddress = nextProps.storeAddress
      this.setState({
        storeUuid:nextProps.storeUuid,
        storeCode:nextProps.storeCode,
        storeName:nextProps.storeName,
        scheduleBillNumber:nextProps.scheduleBillNumber,
        storeAddress : nextProps.storeAddress,
        pageFilter:this.state.pageFilter
      },()=>{
        this.refresh(this.state.pageFilter);
      });
    }
    if(nextProps.visible!=this.props.visible){
      this.refresh();
      this.setState({
        visible:nextProps.visible
      })
    }

    if(nextProps.deliveredConfirm.storeBillData&&nextProps.deliveredConfirm.storeBillData!=this.props.deliveredConfirm.storeBillData){
        let endData = {};
        let startData = [];
        let endList = nextProps.deliveredConfirm.storeBillData.list;
      for(let i =0;i<endList.length;i++){
        if(endList[i].delivered !== 'OnlyBill') {
          startData.push(endList[i])
        }
      }
      endData.list = startData;
      endData.pagination = nextProps.deliveredConfirm.storeBillData.pagination;
      this.setState({
        data: {...endData}
      })
    }
  }

  refresh(pageFilter){
    this.props.dispatch({
      type: 'deliveredConfirm/queryStoreBill',
      payload:pageFilter? pageFilter: this.state.pageFilter,
    })
  }

  handleOk = ()=>{
    const { selectedRows } = this.state;
    if(selectedRows.length == 0){
      message.warning('请先选择行');
      return;
    }
    selectedRows.forEach(row=>{
      if(row.confirmedTime){
        row.confirmedTime = moment(row.confirmedTime).format("YYYY-MM-DD HH:mm:ss")
      }
    })

    this.props.dispatch({
      type: 'deliveredConfirm/confirmOrder',
      payload: selectedRows,
      callback:response=>{
        if(response&&response.success){
          this.refresh();
          this.props.handleModal()
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })

  }
  handleCancel = ()=>{
    this.props.handleModal()
  }

  handleStandardTableChange = ()=>{
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (pageFilter.page !== pagination.current - 1) {
        pageFilter.changePage = true;
    }

    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    // 判断是否有过滤信息
    const filters = Object.keys(filtersArg).reduce((obj, key) => {
        const newObj = { ...obj };
        newObj[key] = getValue(filtersArg[key]);
        return newObj;
    }, {});

    if (sorter.field) {
        var sortField = `${sorter.field}`;
        var sortType = sorter.order === 'descend' ? true : false;
        // 排序触发表格变化清空表格选中行，分页则不触发
        if (pageFilter.sortFields[sortField] === sortType) {
            pageFilter.changePage = true;
        } else {
            pageFilter.changePage = false;
        }
        // 如果有排序字段，则需要将原来的清空
        pageFilter.sortFields = {};
        pageFilter.sortFields[sortField] = sortType;
    }

    if (this.refresh)
        this.refresh(pageFilter);
  }

   /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
  handleFieldChange(e, fieldName, line) {
    const { data } = this.state;
    let target = data.list[line-1];
    if (fieldName === 'delivered') {
      target.delivered = e;
    }

    this.setState({
      data: data
    });
  }

  /**
   * 获取选中行
   *  */
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  }

  columns = [
    {
      title: deliveredConfirmLocale.orderType,
      dataIndex: 'orderType',
      render:val=>val?OrderType[val].caption:<Empty/>
    },
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'store',
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: deliveredConfirmLocale.orderNum,
      dataIndex: 'orderNum',
    },
    {
      title: deliveredConfirmLocale.wmsNum,
      dataIndex: 'wmsNum',
    },
    {
      title: deliveredConfirmLocale.sourceNum,
      dataIndex: 'sourceNum',
    },
    {
      title: deliveredConfirmLocale.delivered,
      dataIndex: 'delivered',
      render:(val,record)=><Select value={val} style={{width:'100%'}} onChange={e => this.handleFieldChange(e, 'delivered', record.line)} placeholder={placeholderChooseLocale('是否送达')}>
         {typeOptions}
      </Select>
    },
    {
      title: deliveredConfirmLocale.confirmedOper,
      dataIndex: 'confirmedOper',
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: deliveredConfirmLocale.confirmedTime,
      dataIndex: 'confirmedTime',
      render:val=>val?val:<Empty/>

    },
  ];
  render() {
    const { selectedRows,visible,data } = this.state;
    return <Modal
        title={deliveredConfirmLocale.checkStoreBill}
        visible={visible}
        destroyOnClose={true}
        onCancel={()=>this.handleCancel()}
        footer={[]}
        okText={commonLocale.confirmLocale}
        cancelText={commonLocale.cancelLocale}
        width={'70%'}
      >
        <div style={{display:'flex',justifyContent:"flex-end"}}>
          <Button key={1} onClick={()=>this.handleOk()}>
            {commonLocale.saveLocale}
          </Button>
        </div>
        <StandardTable
          rowKey={record => record.uuid}
          selectedRows={selectedRows}
          loading={this.props.loading}
          data={data}
          columns={this.columns}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleStandardTableChange}
        />
    </Modal>
  }
}
