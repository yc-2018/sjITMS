import { Fragment } from 'react'
import { connect } from 'dva'
import moment from 'moment'
import { Form, Button, message, InputNumber, } from 'antd'
import SearchPage from '@/pages/Component/Page/SearchPage'
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm'
import BadgeUtil from '@/pages/Component/BadgeUtil'
import OperateCol from '@/pages/Component/Form/OperateCol';
import { colWidth } from '@/utils/ColWidth'
import { commonLocale } from '@/utils/CommonLocale'
import { havePermission } from '@/utils/authority'
import { convertCodeName } from '@/utils/utils'
import { loginOrg, loginCompany } from '@/utils/LoginContext'
import DispatchReturnSearchForm from './DispatchReturnSearchForm'
import StoreModal from './StoreModal'
import styles from './DispatchReturn.less'
import Empty from '@/pages/Component/Form/Empty'
import { Subtr, add, accAdd, accDiv } from '@/utils/QpcStrUtil'
import { dispatchReturnLocale } from './DispatchReturnLocale'
@connect(({ dispatchReturn,feeType, loading }) => ({
  dispatchReturn,feeType,
  loading: loading.models.dispatchReturn
}))
@Form.create()
export default class DispatchReturnSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '出车回车信息录入',
      data: props.dispatchReturn.data,
      selectedRows: [],
      types: props.types,
      scroll:{},
      width:0,
      storeModalVisible:false,
      shipBillTmsUuid:'',
      key: 'dispatchReturn.search.table',
      tableHeight: 470
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
  }

  componentWillMount(){
    let totalWidth = 0;

    const {types,width} = this.state;
    let index = 8;

    let typeList = [];
    for(let i =0 ;i<types.length;i++){ // 所有的类型
      if(typeList.indexOf(types[i].type)==-1){
        typeList.push(types[i].type);
      }
    }

    for(let i = 0;i<typeList.length;i++){
      this.columns.splice(index, 0, {
        title:typeList[i],
        width:200,
        className:styles.childrenColumn,
        children:this.renderChildreColumns(typeList[i])
      });
      index +=1;
    }

    this.columns.forEach(e => {
      if (e.width) {
        totalWidth = totalWidth + e.width;
      }
    });
    if (totalWidth > width) {
      let tableScroll = {
        x: totalWidth
      }
      this.setState({
        scroll: tableScroll
      })
    }
  }

  

  componentDidMount() {
    this.refreshTable();
    this.setState({
      width:document.getElementsByClassName("ant-table-wrapper")[0].offsetWidth
    })
  }
  componentWillReceiveProps(nextProps) {

    if(nextProps.dispatchReturn.data&&this.props.dispatchReturn.data!=nextProps.dispatchReturn.data){
      this.setState({
        data: nextProps.dispatchReturn.data
      });
    }
  }

  renderChildreColumns = (type)=>{
    const { types } = this.state;
    let list = [];
    for(let i =0 ;i<types.length;i++){ // 所有的类型
      if(types[i].type === type){
        list.push(
          {
            title: types[i].name,
            width: colWidth.billNumberColWidth + 50,
            className:styles.childColumn,
            render:record=>{
              let value = 0;
              let checked = false;
              if(record.feeItems){
                for(let j = 0;j<record.feeItems.length;j++){
                  if(record.feeItems[j].feeName   === types[i].name){
                    value = record.feeItems[j].amount
                    checked = record.feeItems[j].checked
                  }
                }
              }
              return <InputNumber min={0} precision={3} disabled={checked} value={value} onChange={e => this.handleFieldChangeFee(e, types[i], record.line)}/>
            }
          },
        )
      }
    }
    return list;
  }


  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
      });
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'dispatchReturn/query',
      payload: queryFilter,
    });
  };


  onSearch = (data) => {
    const {pageFilter} = this.state;
    pageFilter.page = 0;

    if (data) {
      let driverUuid = '';
      if(data.driver){
        driverUuid = JSON.parse(data.driver).uuid
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        driverUuid:driverUuid
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid: loginOrg().uuid
      }
    }

    if(data&&(!pageFilter.searchKeyValues.scheduleBillNumber||pageFilter.searchKeyValues.scheduleBillNumber =='')&&
      (!pageFilter.searchKeyValues.vehicleCodeName||pageFilter.searchKeyValues.vehicleCodeName =='')&&
      (!pageFilter.searchKeyValues.driver||pageFilter.searchKeyValues.driverUuid =='')){
        message.warning('请先选择排车单、车牌号、司机中任意一个');
        return;
      }
    this.refreshTable();
  }

  onType = () => {
    this.props.dispatch({
      type: 'dispatchReturn/showPage',
      payload: {
        showPage: 'type'
      }
    });
  }

  onSave=()=>{
    const { selectedRows } = this.state
    let list = [];
    if(selectedRows.length==0){
      message.warning('请先勾选行！');
      return;
    }

    this.props.dispatch({
      type: 'dispatchReturn/onConfirm',
      payload:selectedRows,
      callback:response=>{
        if(response&&response.success){
          this.refreshTable();
          message.success(commonLocale.saveSuccessLocale);
        }
      }
    })
  }

  onSaveAllTargetPage = ()=>{
    const { data } = this.state
    if(data.list.length==0){
      return;
    }
    this.props.dispatch({
      type: 'dispatchReturn/onConfirm',
      payload:data.list,
    })
  }
  
  handleFieldChange = (e, fieldName, line)=>{
    const { data,pageFilter } = this.state;
    let target = data.list[line-1];
    if(e) {
      if (fieldName === 'dispatchMileage') {
        target.dispatchMileage = e;
      }else if(fieldName === 'returnMileage'){
        target.returnMileage = e;
      }
    }
    this.setState({
      data: data
    });
  }

  handleFieldChangeFee= (e, fee, line)=>{
    const { data,pageFilter } = this.state;
    let target = data.list[line-1];
    if(target.feeItems){
      let hasFlag = false;
      for(let f =0 ;f<target.feeItems.length;f++){
        if(target.feeItems[f].feeName === fee.name&&target.feeItems[f].feeType === fee.type){
          target.feeItems[f].amount = e;
          hasFlag = true;
          break;
        }
      }
      if(hasFlag == false){
        target.feeItems.push({
          feeType: fee.type,
          feeName: fee.name,
          amount: e,
          checked: false
        });
      }
      
    }else{
      target.feeItems = [
        {
          feeType: fee.type,
          feeName: fee.name,
          amount: e,
          checked: false
        }
      ]
    }
    this.setState({
      data: data
    });
  }

  handleStoreModal = (uuid)=>{
    if(uuid){
      this.setState({
        shipBillTmsUuid : uuid
      });
    }
    this.setState({
      storeModalVisible:!this.state.storeModalVisible
    });
  }


  handleAuditModal = (record)=>{
    if(Array.isArray(record)&&record.length==0){
      message.warning('请先选择行');
      return;
    }
    this.props.dispatch({
      type: 'dispatchReturn/showPage',
      payload: {
        showPage: 'audit',
        selectedRows:Array.isArray(record)?record:[record]
      }
    });
  }

  renderOperateCol = (record) => {
    return <OperateCol menus={this.fetchOperatePropsCommon(record)} />
  }

  fetchOperatePropsCommon = (record) => {
    return [{
      name: commonLocale.auditLocale,
      onClick: this.handleAuditModal.bind(this, record)
    }];
  }

  columns = [
    {
      title: dispatchReturnLocale.shipPlanBillNumber,
      dataIndex: 'shipPlanBillNumber',
      sorter:true,
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: dispatchReturnLocale.shipBillNumber,
      dataIndex: 'shipBillNumber',
      sorter:true,
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: dispatchReturnLocale.vehicle,
      dataIndex: 'vehicle',
      sorter:true,
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: dispatchReturnLocale.driver,
      dataIndex: 'driver',
      width: colWidth.billNumberColWidth + 50,
      render:val=>val?convertCodeName(val):<Empty/>
    },
    {
      title: dispatchReturnLocale.lastReturnMileage,
      dataIndex: 'lastReturnMileage',
      width: colWidth.billNumberColWidth + 50,
    },
    {
      title: dispatchReturnLocale.dispatchMileage,
      dataIndex: 'dispatchMileage',
      sorter:true,
      width: colWidth.billNumberColWidth + 50,
      render:(val,record)=><InputNumber min={0} precision={3} value={val} onChange={e => this.handleFieldChange(e, 'dispatchMileage', record.line)}/>
    },
    {
      title: dispatchReturnLocale.returnMileage,
      dataIndex: 'returnMileage',
      sorter:true,
      width: colWidth.billNumberColWidth + 50,
      render:(val,record)=><InputNumber min={0} value={val}  precision={3} min = {accAdd(record.dispatchMileage,0.001)} onChange={e => this.handleFieldChange(e, 'returnMileage', record.line)}/>

    },
    {
      title: dispatchReturnLocale.targetMileage,
      width: colWidth.billNumberColWidth + 50,
      render:(record)=>{
        return (record.returnMileage&&record.dispatchMileage)?<span>{Subtr(record.returnMileage,record.dispatchMileage)}</span>:<Empty/>
      }
    },
    {
      title: dispatchReturnLocale.storeFee,
      width: colWidth.billNumberColWidth + 50,
      render:record=><a onClick = {()=>this.handleStoreModal(record.shipBillUuid)}>查看编辑</a>
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        this.renderOperateCol(record)
      ),
    },
  ];

  drawActionButton = () => {
    return (
      <Fragment>
        <Button onClick={() => this.onType()}>
          {dispatchReturnLocale.manageFee}
        </Button>
      </Fragment>
    );
    
  }

  drawToolbarPanel() {
   
    return [
      <Button key={3} style={{float:'left',marginBottom: '5px'}} onClick={()=>this.handleAuditModal(this.state.selectedRows)}>
        {commonLocale.auditLocale}
      </Button>,
      <Button key={4} style={{float:'left'}} onClick={()=>this.onSave()}>
        {commonLocale.saveLocale}
      </Button>, ];
  }

  drawSearchPanel = () => {
    return <DispatchReturnSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch}/>;
  }

  drawOtherCom = ()=>{
    const { storeModalVisible,shipBillTmsUuid } = this.state;
    return <div>
      <StoreModal
        visible = {storeModalVisible}
        shipBillTmsUuid = {shipBillTmsUuid}
        handleModal = {this.handleStoreModal}
      />
    </div>
  }
  
}
