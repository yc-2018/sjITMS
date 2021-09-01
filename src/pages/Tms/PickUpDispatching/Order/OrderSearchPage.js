import { Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Button, Modal, Divider, message, Menu, Dropdown, Tooltip, Icon, Row, Col } from 'antd';
import Empty from '@/pages/Component/Form/Empty';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import StandardTable from '@/components/StandardTable';
import { add, accAdd, accMul, accDiv } from '@/utils/QpcStrUtil';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import OrderSearchForm from './OrderSearchForm'
import { vehicleDispatchingLocale } from '../../VehicleDispatching/VehicleDispatchingLocale';
import SearchPage from '../../VehicleDispatching/Utils/SearchPage';
import { OrderBillPendingTag } from '../../VehicleDispatching/VehicleDispatchingContants';

@connect(({ pickUpDispatching,transportOrder, loading }) => ({
  pickUpDispatching,transportOrder,
  loading: loading.models.pickUpDispatching,
}))
@Form.create()
export default class OrderSearchPage extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      title: '订单列表',
      key:'pickUpDispatchingOrder.search.table',
      data:{
        list:[]
      },
      selectedRows: [],
      suspendLoading: false,
      searchPageType:'PICKUP_ORDER',
      showCreatePage:props.showCreatePage,
      shipPlanBill:props.shipPlanBill, // target
      scrollValue:{
        x:1200,
        y:null

      },
      reSendModalVisible:false,
      reShipModalVisible:false,
      hasOnRow:true
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dispatchCenterUuid = loginOrg().uuid;
    
  }

  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
  
    if(nextProps.showCreatePage!=this.props.showCreatePage){
      this.setState({
        showCreatePage: nextProps.showCreatePage
      });
    }
    if(nextProps.shipPlanBill&&nextProps.shipPlanBill!=this.props.shipPlanBill){
      this.setState({
        shipPlanBill: nextProps.shipPlanBill
      });
    }
  }

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: [],
        reportParams: []
      });
    }

    dispatch({
      type: 'transportOrder/queryDeliveryBill',
      payload: filter?filter:pageFilter,
      callback:response=>{
        if(response&&response.success){
          this.state.data.list = response.data?response.data:[]
          this.state.scrollValue.y = response.data&&response.data.length>0?500:null;

          this.setState({
            data:{...this.state.data},
            scrollValue:{...this.state.scrollValue}
          })
        }
      }
    });
  };
  
  onSearch = (data) => {
    const { pageFilter } = this.state;
  
    if (data) {
      let vendorUuid = '';
      if(data.vendor){
        vendorUuid = JSON.parse(data.vendor).uuid
      }

      pageFilter.searchKeyValues = {
          ...pageFilter.searchKeyValues,
          ...data,
          vendorUuid:vendorUuid,
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid :loginCompany().uuid,
        dispatchCenterUuid : loginOrg().uuid,
      }
    }
    this.setState({
      pageFilter:pageFilter
    })
    this.refreshTable(pageFilter);

  }

  handleToShip = ()=>{
    const { selectedRows,showCreatePage,shipPlanBill } = this.state;
    let articleDetails = [];
    if(selectedRows.length==0){
      message.warning('请先选择行！');
      return;
    }
    if(showCreatePage==false){
      message.warning('请先选择排车单！');
      return;
    }
    selectedRows.forEach(row=>{
      articleDetails.push(row);
    });

    this.props.dispatch({
      type:'pickUpDispatching/addorderaticlestoschedule',
      payload: {
        articleDetails:articleDetails,
        scheduleUuid:shipPlanBill.uuid
      },
      callback:response=>{
        if(response&&response.success){
          message.success('添加成功')
          this.refreshTable()
          this.props.onReFreshView();
          this.props.refreshShipPlanBillPage();
        
          this.setState({
            selectedRows:[]
          })
        }
      }
    })
  }
  settingColor = (record)=>{
    let color = 'rgba(0, 0, 0, 0.65)';
    if(record.sumOrder==true&&record.parentOrder==false){
      color = 'red'
    }else if(record.sumOrder==false&&record.parentOrder==true){
      color = '#3B77E3'
    }
    return color;

  }
 
  columns = [
    {
      title:'客户单号',
      dataIndex:'sourceNum',
      width:160,
      render:(val,record)=>{
        return val?<span style={{color:this.settingColor(record)}}>{val}</span>:<Empty style={{color:this.settingColor(record)}}/>
      }
    },
    {
      title: commonLocale.articleLocale,
      dataIndex: 'article',
      width: 150,
      render:(val,record)=>{
        let data = {
          uuid:val.uuid,
          code:val.code,
          name:val.name,
        }
        return val?<span style={{color:this.settingColor(record)}}>{convertCodeName(data)}</span>:<Empty style={{color:this.settingColor(record)}}/>;
      }
    },
    {
      title: commonLocale.inQtyStrLocale,
      dataIndex: 'qtyStr',
      width: 100,
      render:(val,record)=>{
        return val?<span style={{color:this.settingColor(record)}}>{val}</span>:<Empty style={{color:this.settingColor(record)}}/>;
      }
    },
    {
      title: '下单日期',
      dataIndex: 'orderTime',
      width: 120,
      render:(val,record)=>{
        return val?<span style={{color:this.settingColor(record)}}>{moment(val).format('YYYY-MM-DD')}</span>:<Empty style={{color:this.settingColor(record)}}/>;
      }
    },
    {
      title: vehicleDispatchingLocale.volume,
      dataIndex: 'volume',
      width: 80,
      render:(val,record)=>{
        // let volume =Number(accDiv(accMul(record.qty,record.volume),1000000)).toFixed(4);
        return val?<span style={{color:this.settingColor(record)}}>{record.volume}</span>:<Empty style={{color:this.settingColor(record)}}/>;
      }
    },
    {
      title: vehicleDispatchingLocale.weight,
      dataIndex: 'weight',
      width: 80,
      render:(val,record)=>{
        // let weight =Number(accDiv(accMul(record.qty,record.weight),1000)).toFixed(4);

        return val?<span style={{color:this.settingColor(record)}}>{record.weight}</span>:<Empty style={{color:this.settingColor(record)}}/>;
      }
    },
    {
      title: '订单号',
      dataIndex: 'billNumber',
      width: 160,
      render:(val,record)=>{
        return val?<span style={{color:this.settingColor(record)}}>{val}</span>:<Empty style={{color:this.settingColor(record)}}/>;
      }
    },
    {
      title: '卸货点',
      dataIndex: 'deliveryPoint',
      width: 140,
      render:(val,record)=>{
        let data = {
          uuid:val.uuid,
          code:val.code,
          name:val.name,
        }
        return val?<span style={{color:this.settingColor(record)}}><EllipsisCol colValue={convertCodeName(data)}/></span>:<Empty style={{color:this.settingColor(record)}}/>;
      }
    },
  ];

  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <OrderSearchForm filterValue={this.state.pageFilter.searchKeyValues}
      refresh={this.onSearch}/>
    );
  }
  
  drawOther = ()=>{
    return <div style={{marginBottom:'10px',marginRight:'50px'}}>
      <Button onClick={()=>this.handleToShip()}>添加到排车单</Button>
    </div>
  }
}
