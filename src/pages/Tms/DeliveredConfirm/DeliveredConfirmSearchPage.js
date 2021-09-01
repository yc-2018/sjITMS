import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, message, Tabs, Checkbox, Select, Icon } from 'antd';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany, loginUser } from '@/utils/LoginContext';
import DeliveredConfirmSearchForm from './DeliveredConfirmSearchForm';
import StandardTable from '@/components/StandardTable';
import Empty from '@/pages/Component/Form/Empty';
import { OrderType, DeliveredType } from './DeliveredConfirmContants';
import StoreItemConfirmModal from './StoreItemConfirmModal';
import { deliveredConfirmLocale } from './DeliveredConfirmLocale';
import {Prompt} from "react-router-dom";
const { TabPane } = Tabs;

const typeOptions = [];
Object.keys(DeliveredType).forEach(function (key) {
  typeOptions.push(<Select.Option key={DeliveredType[key].name} value={DeliveredType[key].name}>{DeliveredType[key].caption}</Select.Option>);
});

@connect(({ deliveredConfirm, loading }) => ({
  deliveredConfirm,
  loading: loading.models.deliveredConfirm
}))
@Form.create()
export default class DeliveredConfirmSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: deliveredConfirmLocale.title,
      storeData:{
        list:[]
      }, // 门店送货确认数据
      billData:{
        list:[]
      }, // 票据核对
      storeSelectedRows: [],
      billSelectedRows: [],
      noTable:true,

      storeIndeterminate:false, // 是否送达
      storeCheckAll:false,// 是否全选

      billIndeterminate:false, // 是否送达
      billCheckAll:false,// 是否全选

      targetTabKey:'store',
      storeItemConfirmModalVisible:false,
      storeUuid:'',
      storeCode:'',
      storeName:'',
      storeAddress: '',
      scheduleBillNumber:'',
      confirmSchedule:{
        companyUuid:'',
        dispatchCenterUuid:'',
        scheduleBillNumber: '',
        confirms:[]
      },
      pageFilter:{
        searchKeyValues:{}
      }
    }
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
  }

  componentWillMount(){
    if(this.state.targetTabKey=="store"){
      this.storeColumns = [
        {
          title: deliveredConfirmLocale.serialArchLine,
          dataIndex: 'serialArchLine',
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: deliveredConfirmLocale.orderNo,
          dataIndex: 'orderNo',
          width: colWidth.billNumberColWidth + 50,
        },
        {
          title: commonLocale.inStoreLocale,
          dataIndex: 'store',
          width: colWidth.billNumberColWidth + 50,
          render:(val,record)=>{
            return <div onClick={()=>this.handleModal(record)}>
              <Icon style={{color:'#3B77E3',marginTop:'2%'}} type="plus-circle" />
              <a style={{marginLeft:'2%'}}>{convertCodeName(val)}</a>
            </div>
          }
        },
        {
          title: '门店地址',
          dataIndex: 'storeAddress',
          width: colWidth.billNumberColWidth + 50,
        },
        {
          title: deliveredConfirmLocale.delivered,
          dataIndex: 'delivered',
          width: colWidth.billNumberColWidth + 50,
          render:(val,record)=><Select value={val} style={{width:'100%'}} onChange={e => this.handleFieldChangeStore(e, 'delivered', record.line)} placeholder={placeholderChooseLocale('送达情况')}>
            {typeOptions}
          </Select>
        },
        {
          title:deliveredConfirmLocale.confirmedOper,
          dataIndex: 'confirmedOper',
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: deliveredConfirmLocale.confirmedTime,
          dataIndex: 'confirmedTime',
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?moment(val).format('YYYY-MM-DD'):<Empty/>

        },

      ];
    }
  }
  componentDidMount() {
    this.refreshTable();
  }

  shouldComponentUpdate(nextProps,nextState){
    if(nextState.targetTabKey==="store"){
      this.storeColumns = [
        {
          title: deliveredConfirmLocale.serialArchLine,
          dataIndex: 'serialArchLine',
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: deliveredConfirmLocale.orderNo,
          dataIndex: 'orderNo',
          width: colWidth.billNumberColWidth + 50,
        },
        {
          title: commonLocale.inStoreLocale,
          dataIndex: 'store',
          width: colWidth.billNumberColWidth + 50,
          render:(val,record)=>{
            return <div onClick={()=>this.handleModal(record)}>
              <Icon style={{color:'#3B77E3',marginTop:'2%'}} type="plus-circle" />
              <a style={{marginLeft:'2%'}}>{convertCodeName(val)}</a>
            </div>
          }
        },
        {
          title: '门店地址',
          dataIndex: 'storeAddress',
          width: colWidth.billNumberColWidth + 50,
        },
        {
          title: deliveredConfirmLocale.delivered,
          dataIndex: 'delivered',
          width: colWidth.billNumberColWidth + 50,
          render:(val,record)=><Select value={val} style={{width:'100%'}} onChange={e => this.handleFieldChangeStore(e, 'delivered', record.line)} placeholder={placeholderChooseLocale('送达情况')}>
            {typeOptions}
          </Select>
        },
        {
          title:deliveredConfirmLocale.confirmedOper,
          dataIndex: 'confirmedOper',
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: deliveredConfirmLocale.confirmedTime,
          dataIndex: 'confirmedTime',
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?moment(val).format('YYYY-MM-DD'):<Empty/>

        },

      ];
    }
    if(nextState.targetTabKey==="bill"){
      this.billColumns = [
        {
          title: deliveredConfirmLocale.orderType,
          dataIndex: 'orderType',
          sorter:true,
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?OrderType[val].caption:<Empty/>
        },
        {
          title: deliveredConfirmLocale.orderNum,
          dataIndex: 'orderNum',
          sorter:true,
          width: colWidth.billNumberColWidth + 50,
        },
        {
          title: deliveredConfirmLocale.wmsNum,
          dataIndex: 'wmsNum',
          sorter:true,
          width: colWidth.billNumberColWidth + 50,
        },
        {
          title: deliveredConfirmLocale.sourceNum,
          dataIndex: 'sourceNum',
          sorter:true,
          width: colWidth.billNumberColWidth + 50,
        },
        {
          title: commonLocale.inStoreLocale,
          dataIndex: 'store',
          sorter:true,
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?convertCodeName(val):<Empty/>

        },
        {
          title: <Checkbox
            indeterminate={this.state.billIndeterminate}
            onChange={this.onCheckAllChangeBill}
            checked={nextState.billCheckAll}
          >
            <span style={{fontWeight:400,color:'black'}}>{deliveredConfirmLocale.isConfirmed}</span>
          </Checkbox>,
          dataIndex: 'confirmed',
          width: colWidth.enumColWidth,
          render:(val,record)=>{
            return  <Checkbox checked={val} onChange={e => this.handleFieldChangeBill(e, 'confirmed', record.line)}>
              {deliveredConfirmLocale.confirmed}
            </Checkbox>;
          }
        },
        {
          title: deliveredConfirmLocale.confirmedOper,
          dataIndex: 'confirmedOper',
          sorter:true,
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?convertCodeName(val):<Empty/>
        },
        {
          title: deliveredConfirmLocale.confirmedTime,
          dataIndex: 'confirmedTime',
          sorter:true,
          width: colWidth.billNumberColWidth + 50,
          render:val=>val?val:<Empty/>
        },
      ];
    }
    return true
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.deliveredConfirm.storeData&&nextProps.deliveredConfirm.storeData!=this.props.deliveredConfirm.storeData){
      let endData = {};
      let startData = [];
      let endList = nextProps.deliveredConfirm.storeData.list;
      for(let i =0;i<endList.length;i++){
        if(endList[i].taskType !== 'OnlyBill') {
          startData.push(endList[i])
        }
      }
      for(let j =0;j<startData.length;j++){
        startData[j].line = j+1;
      }
      endData.list = startData;
      endData.pagination = nextProps.deliveredConfirm.storeData.pagination;
      this.setState({
        storeData: {...endData}
      })
    }
    if(nextProps.deliveredConfirm.billData&&nextProps.deliveredConfirm.billData!=this.props.deliveredConfirm.billData){
      this.setState({
        billData: nextProps.deliveredConfirm.billData
      });
    }

  }

  refreshTable = (filter) => {
    let p1 = window.localStorage.getItem("pageFilter")
    p1 = JSON.parse(p1)
    const { dispatch } = this.props;
    const { pageFilter,targetTabKey } = this.state;
    if (!filter || !filter.changePage) {
      this.setState({
        storeSelectedRows: [],
        billSelectedRows: [],
      });
    }
    let queryFilter = { ...pageFilter ,...p1};

    if (filter) {
      queryFilter = {
        ...pageFilter,
        ...filter,
      };
    }

    let type = 'deliveredConfirm/queryStore';

    if(targetTabKey === 'store'){
      // queryFilter.orderTypes = [ OrderType.Delivery.name,OrderType.TransportIn.name,OrderType.TransportOut.name ];
    }else if (targetTabKey == 'bill'){
      queryFilter.searchKeyValues.orderTypes = [ OrderType.OnlyBill.name ];
      type = 'deliveredConfirm/queryBill'
    }

    dispatch({
      type: type,
      payload: queryFilter,
    });
    if(p1){
      this.state.pageFilter=p1
    }
    window.localStorage.removeItem("pageFilter")
  };

  onSearch = (data) => {
    const { pageFilter,targetTabKey } = this.state;
    pageFilter.page = 0;

    if (data) {
      let vehicleCodeName = '';
      let driverUuid = '';
      this.state.scheduleBillNumber = data.shipPlanNumber;
      if(data.vehicle){
        vehicleCodeName = JSON.parse(data.vehicle).code
      }

      if(data.driver){
        driverUuid = JSON.parse(data.driver).uuid
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        vehicleCodeName:vehicleCodeName,
        driverUuid:driverUuid
      }
    } else {
      if (data) {
        this.state.scheduleBillNumber = data.shipPlanNumber;
      }
      this.setState({
        storeIndeterminate:false, // 是否送达
        storeCheckAll:false,// 是否全选
        billIndeterminate:false, // 是否送达
        billCheckAll:false,// 是否全选
        storeSelectedRows: [],
        billSelectedRows: [],
      })
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid
      }
    }
    this.refreshTable();

  }

  onUnDeliveredConfirm = ()=>{
    window.localStorage.setItem("pageFilter", JSON.stringify(this.state.pageFilter));
    this.props.dispatch({
      type: 'deliveredConfirm/showPage',
      payload: {
        showPage: 'unDeliveredConfirm',
      }
    });
  }
  // 全部送达
  deliveredConfirmSchedule = ()=>{
    const { storeSelectedRows } = this.state
    let data = {...this.state.confirmSchedule};
    data.companyUuid = loginCompany().uuid,
      data.dispatchCenterUuid = loginOrg().uuid,
      data.scheduleBillNumber = this.state.pageFilter.searchKeyValues.shipPlanNumber

    let list = [];
    storeSelectedRows.forEach(row=>{
      let e = {
        line: row.line,
        shipBillUuid: row.shipBillUuid,
        version: row.version,
        SerialArchLine:row.SerialArchLine,
        orderNo:row.orderNo,
        store: row.store,
        storeAddress: row.storeAddress,
        scheduleBillNumber:row.scheduleBillNumber,
        confirmedOper: {
          uuid:loginUser().uuid,
          code:loginUser().code,
          name:loginUser().name,
        },
        confirmedTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        delivered: row.delivered,
        confirmed:row.confirmed,

      }
      list.push(e);
    })

    data.confirms=list;
    this.props.dispatch({
      type: 'deliveredConfirm/deliveredConfirmSchedule',
      payload: data,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  }
  // 全部未送达
  unDeliveredConfirmSchedule = ()=>{
    const { storeSelectedRows } = this.state
    let data = {...this.state.confirmSchedule};
    data.companyUuid = loginCompany().uuid,
      data.dispatchCenterUuid = loginOrg().uuid,
      data.scheduleBillNumber = this.state.pageFilter.searchKeyValues.shipPlanNumber

    let list = [];
    storeSelectedRows.forEach(row=>{
      let e = {
        line: row.line,
        shipBillUuid: row.shipBillUuid,
        version: row.version,
        SerialArchLine:row.SerialArchLine,
        orderNo:row.orderNo,
        store: row.store,
        storeAddress: row.storeAddress,
        scheduleBillNumber:row.scheduleBillNumber,
        confirmedOper: {
          uuid:loginUser().uuid,
          code:loginUser().code,
          name:loginUser().name,
        },
        confirmedTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        delivered: row.delivered,
        confirmed:row.confirmed,

      }
      list.push(e);
    })

    data.confirms=list;

    this.props.dispatch({
      type: 'deliveredConfirm/unDeliveredConfirmSchedule',
      payload: data,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  }

  onChangeTabs = (key)=>{
    this.setState({
      targetTabKey:key
    },()=>{
      this.refreshTable();

    })

  }

  handleModal = (record)=>{
    if(record){
      this.setState({
        storeUuid : record.store.uuid,
        storeCode : record.store.code,
        storeName : record.store.name,
        storeAddress: record.storeAddress,
        scheduleBillNumber:record.scheduleBillNumber
      });
    }else{
      this.refreshTable()
    }
    this.setState({
      storeItemConfirmModalVisible:!this.state.storeItemConfirmModalVisible
    });
  }

  onCheckAllChangeStore = (e)=>{
    const { storeData } = this.state;
    storeData.list.forEach(item=>{
      item.confirmed = e.target.checked;
    });
    this.setState({
      storeIndeterminate: false,
      storeCheckAll: e.target.checked,
      storeData:storeData
    });
  }

  onCheckAllChangeBill = (e)=>{
    const { billData } = this.state;
    billData.list.forEach(item=>{
      item.confirmed = e.target.checked;
    });
    this.setState({
      billIndeterminate: false,
      billCheckAll: e.target.checked,
      billData:billData
    });
  }

  /**
   * 表格变化时
   * @param {*} e
   * @param {*} fieldName
   * @param {*} key
   */
  handleFieldChangeStore(e, fieldName, line) {
    const { storeData,pageFilter } = this.state;
    let target = storeData.list[line-1];
    let count = 0;
    if (fieldName === 'delivered') {
      target.delivered = e;
    }

    this.setState({
      storeData: storeData
    });
  }

  handleFieldChangeBill(e, fieldName, line) {
    const { billData,pageFilter } = this.state;
    let target = billData.list[line-1];
    let count = 0;
    if (fieldName === 'confirmed') {
      target.confirmed = e.target.checked;
      billData.list.forEach(item=>{
        if(item.confirmed){
          count++
        }
      });
      if(count == billData.list.length){// 所有条数
        this.setState({
          billIndeterminate:false,
          billCheckAll:true,
        })
      }else if(count>0 &&count<billData.list.length){
        this.setState({
          billIndeterminate:true,
          billCheckAll:false,
        })
      }else if(count ==0 ){
        this.setState({
          billIndeterminate:false,
          billCheckAll:false,
        })
      }
    }

    this.setState({
      billData: billData
    });
  }

  onSaveStore =()=>{
    const { storeSelectedRows } = this.state
    let list = [];
    if(storeSelectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }

    storeSelectedRows.forEach(row=>{
      let data = {
        line: row.line,
        shipBillUuid: row.shipBillUuid,
        version: row.version,
        SerialArchLine:row.SerialArchLine,
        orderNo:row.orderNo,
        store: row.store,
        storeAddress: row.storeAddress,
        scheduleBillNumber:row.scheduleBillNumber,
        confirmedOper: {
          uuid:loginUser().uuid,
          code:loginUser().code,
          name:loginUser().name,
        },
        confirmedTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        delivered: row.delivered,
        confirmed:row.confirmed,

      }
      list.push(data);
    })
    this.props.dispatch({
      type: 'deliveredConfirm/confirmStore',
      payload:list,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  }
  onSaveBill =()=>{
    const { billSelectedRows } = this.state

    let list = [];
    if(billSelectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }

    billSelectedRows.forEach(row=>{
      let data = {
        line: row.line,
        uuid: row.uuid,
        shipBillUuid: row.shipBillUuid,
        scheduleNum:row.scheduleNum,
        version: row.version,
        orderType: row.orderType,
        orderNum:row.orderNum,
        wmsNum: row.wmsNum,
        sourceNum: row.sourceNum,
        store: row.store,
        confirmed:row.confirmed,
        confirmedOper: {
          uuid:loginUser().uuid,
          code:loginUser().code,
          name:loginUser().name,
        },
        confirmedTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        delivered: row.delivered,
      }
      list.push(data);
    })

    this.props.dispatch({
      type: 'deliveredConfirm/confirmOrder',
      payload:list,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  }

  handleSelectRows = rows => {
    this.setState({
      storeSelectedRows: rows,
    });
  };

  handleBillSelectRows = rows => {
    this.setState({
      billSelectedRows: rows,
    });
  };


  drawActionButton = () => {
    return (
      <Fragment>
        <Button type="primary" onClick={() => this.onUnDeliveredConfirm()}>
          {deliveredConfirmLocale.unTitle}
        </Button>
      </Fragment>
    );
  }

  drawToolbarPanel() {
    return <div >
      {
        this.state.targetTabKey=='store'?
          <div style={{height:'35px'}}>
            <Button key={1} style={{float:'left'}} onClick={()=>this.onSaveStore()}>
              {deliveredConfirmLocale.saveStore}
            </Button>
            <Button key={1} style={{float:'left'}} onClick={()=>this.deliveredConfirmSchedule()}>
              {deliveredConfirmLocale.deliveredConfirmSchedule}
            </Button>
            <Button key={1} style={{float:'left'}} onClick={()=>this.unDeliveredConfirmSchedule()}>
              {deliveredConfirmLocale.unDeliveredConfirmSchedule}
            </Button>
          </div>
          :
          <div style={{height:'35px'}}>
            <Button key={2} style={{float:'left'}} onClick={()=>this.onSaveBill()}>
              {deliveredConfirmLocale.saveBill}
            </Button>
          </div>
      }
    </div>
  }


  drawSearchPanel = () => {
    return <DeliveredConfirmSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch}/>;
  }

  drawOtherCom = ()=>{

    const { storeSelectedRows,billSelectedRows,billData,storeData,targetTabKey,storeItemConfirmModalVisible,storeUuid,storeCode,storeName,storeAddress,scheduleBillNumber } = this.state;
    return <div>
      <Tabs defaultActiveKey="store" activeKey={targetTabKey} onChange={this.onChangeTabs}>
        <TabPane tab={deliveredConfirmLocale.checkStore} key="store">
          <StandardTable
            rowKey={record => record.uuid}
            comId={targetTabKey}
            selectedRows={storeSelectedRows}
            loading={this.props.loading}
            data={storeData ? storeData : []}
            columns={this.storeColumns}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
          />
        </TabPane>
        <TabPane tab={deliveredConfirmLocale.checkBill} key="bill">
          <StandardTable
            rowKey={record => record.uuid}
            comId={targetTabKey}
            selectedRows={billSelectedRows}
            loading={this.props.loading}
            data={billData ? billData : []}
            columns={this.billColumns ? this.billColumns : []}
            onSelectRow={this.handleBillSelectRows}
            onChange={this.handleStandardTableChange}
          />
        </TabPane>
      </Tabs>
      <StoreItemConfirmModal
        visible = {storeItemConfirmModalVisible}
        storeUuid = {storeUuid}
        storeCode = {storeCode}
        storeName = {storeName}
        storeAddress = {storeAddress}
        scheduleBillNumber = {scheduleBillNumber}
        handleModal = {this.handleModal}
      />
    </div>;
  }
}
