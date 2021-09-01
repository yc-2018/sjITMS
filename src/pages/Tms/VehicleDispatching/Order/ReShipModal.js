import { PureComponent } from "react";
import { Modal, Form } from "antd";
import { connect } from "dva";
import { commonLocale } from "@/utils/CommonLocale";
import { vehicleDispatchingLocale } from "../VehicleDispatchingLocale";
import EllipsisCol from "@/pages/Component/Form/EllipsisCol";
import { convertCodeName } from "@/utils/utils";
import StandardTable from "@/components/StandardTable";
import Empty from "@/pages/Component/Form/Empty";
import { OrderStat } from "../VehicleDispatchingContants";
import OrderSearchForm from "./OrderSearchForm";
import moment from 'moment';
@connect(({ vehicleDispatching, loading }) => ({
  vehicleDispatching,
  loading: loading.models.vehicleDispatching,
}))
@Form.create()
export default class ReShipModal extends PureComponent{

  constructor(props){
    super(props);
    this.state = {
      visible:props.visible,
      groupNumber:props.groupNumber,
      selectedRows: [],
      data:{
        list:[]
      }
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.visible!=undefined&&nextProps.visible!=this.props.visible){
      this.setState({
        visible:nextProps.visible,
      },()=>{
        if(nextProps.visible==true && nextProps.groupNumber !== this.state.groupNumber){
          this.refresh(undefined, nextProps.groupNumber);
          this.setState({
            groupNumber: nextProps.groupNumber
          })
        }        
      })
    }
  }
  
  refresh = () => {
    const { groupNumber,data } = this.state;
  
    this.props.dispatch({
      type:'transportOrder/getReShipBills',
      payload:{
        groupNumber: groupNumber,
        startCreateTime: '',
        endCreateTime: '',
        waveNum: '',
        sourceNum: '',
      },
      
      callback:response=>{
        if(response&&response.success){
          data.list = response.data?response.data:[]
          this.setState({
            data:{...data}
          })
        }
      }
    })
  }

  refresh = (filter, groupNumber)=>{
    const { data } = this.state;
    let payload = {};
    payload.groupNumber = groupNumber? groupNumber: this.state.groupNumber;
    if (filter) {
      if (filter.created && filter.created[0]&&filter.created[1]){
        payload.startCreatedTime = moment(filter.created[0]).format('YYYY-MM-DD');;
        payload.endCreatedTime = moment(filter.created[1]).format('YYYY-MM-DD');;
      }
        if (!payload.startCreatedTime) 
          payload.startCreatedTime = '';
        if (!payload.endCreatedTime)
          payload.endCreatedTime = '';  
      payload.waveNum = filter.waveNum?filter.waveNum:'';
      payload.sourceNum = filter.sourceNum?filter.sourceNum:'';
    }else{
      payload.startCreatedTime = '';
      payload.endCreatedTime = '';
      payload.waveNum = '';
      payload.sourceNum = '';
    }
    this.props.dispatch({
      type:'transportOrder/getReShipBills',
      payload:{
        ...payload,     
      },
      
      callback:response=>{
        if(response&&response.success){
          data.list = response.data?response.data:[]
          this.setState({
            data:{...data}
          })
        }
      }
    })
  }

  onOk = ()=>{
    const { selectedRows } = this.state;
    if(selectedRows.length==0){
      message.warning('请先选择行');
      return;
    }
    let list = [];
    selectedRows.forEach(row=>{
      list.push({
        orderStat: OrderStat.Reschedule.name,
        storeUuid: row.deliveryPoint.uuid,
        ownerUuid: row.owner.uuid
      })
    })
    this.props.onAddToOrder(list);
    this.setState({
      selectedRows:[]
    })
  }

  onCancel = ()=>{
    this.setState({
      selectedRows:[]
    })
    this.props.onCancel(false)
  }

  handleSelectRows = rows => {
    this.setState({
        selectedRows: rows,
    });
  };

  columns = [
    {
      title:'线路',
      dataIndex:'archLineCode',
      width:100,
      render:val=>val?val:<Empty/>
    },
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'deliveryPoint',
      width: 130,
      render:val=>{
        let data = {
          uuid:val.uuid,
          code:val.code,
          name:val.name,
        }
      return val?<EllipsisCol colValue={convertCodeName(data)}/>:<Empty  />

      }
    },
    {
      title: vehicleDispatchingLocale.cartonCount,
      dataIndex: 'cartonCount',
      width: 130,
    },
    {
      title: vehicleDispatchingLocale.realCartonCount,
      dataIndex: 'realCartonCount',
      width: 140,
      render:(val,record)=>val&&val!=0?val:(record.cartonCount!=undefined?record.cartonCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.containerCount,
      dataIndex: 'containerCount',
      width: 130,
    },
    {
      title: vehicleDispatchingLocale.realContainerCount,
      dataIndex: 'realContainerCount',
      width: 140,
      render:(val,record)=>val&&val!=0?val:(record.containerCount!=undefined?record.containerCount:<Empty/>)
    },
    {
      title: vehicleDispatchingLocale.volume,
      dataIndex: 'volume',
      width: 100,
    },
    {
      title: vehicleDispatchingLocale.weight,
      dataIndex: 'weight',
      width: 100,
    },
    {
      title: commonLocale.ownerLocale,
      dataIndex: 'owner',
      width: 130,
      render:val=>convertCodeName(val)
    },
    {
      title: '地址',
      width: 150,
      render: (record) =>record ?<EllipsisCol colValue={record.deliveryPoint.address} /> : null
    },
    {
      title: '班组',
      dataIndex: 'classGroupCode',
      width: 130,
      render:val=>val?val:<Empty/>

    },
    {
      title: '单号',
      dataIndex: 'billNumbers',
      width: 130,
      render:val=><EllipsisCol colValue={val.join('、')}/>
    }
  ];

  render(){
    const { visible,list,selectedRows,data } = this.state
    const { loading } = this.props;
    return <div>
      <Modal 
        visible = {visible}
        title = '再排单'
        width='70%'
        onCancel = {this.onCancel}
        onOk = {this.onOk}
      >
        <OrderSearchForm
          refresh={this.refresh}>         
        </OrderSearchForm>
        <StandardTable  
          columns = {this.columns}
          data = {data}
          noPagination
          rowKey={record => record.uuid}
          selectedRows={selectedRows}
          loading={loading}
          newScroll={{
            x:1800,
            y:500
          }}
          size="small"
          defaultPageSize={50}
          onSelectRow={this.handleSelectRows}
        />
      </Modal>
    </div>
  }
}