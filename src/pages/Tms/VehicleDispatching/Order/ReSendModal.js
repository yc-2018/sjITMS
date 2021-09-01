import { PureComponent } from "react";
import { Modal, Form, message } from "antd";
import { connect } from "dva";
import { commonLocale } from "@/utils/CommonLocale";
import { vehicleDispatchingLocale } from "../VehicleDispatchingLocale";
import { convertCodeName } from "@/utils/utils";
import EllipsisCol from "@/pages/Component/Form/EllipsisCol";
import StandardTable from "@/components/StandardTable";
import Empty from "@/pages/Component/Form/Empty";
import { OrderStat } from "../VehicleDispatchingContants";
@connect(({ vehicleDispatching, loading }) => ({
  vehicleDispatching,
  loading: loading.models.vehicleDispatching,
}))
@Form.create()
export default class ReSendModal extends PureComponent{

  constructor(props){
    super(props);
    this.state = {
      visible:props.visible,
      selectedRows: [],
      data:{
        list:[]
      }
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.visible!=undefined&&nextProps.visible!=this.props.visible){
      this.setState({
        visible:nextProps.visible
      },()=>{
        if(nextProps.visible==true){
          this.refresh();
        }
      });
    }
  }
  
  refresh = ()=>{
    this.props.dispatch({
      type:'transportOrder/getWaitResendBills',
      callback:response=>{
        if(response&&response.success){
          this.state.data.list = response.data?response.data:[]
          this.setState({
            data :{...this.state.data}
          })
        }
      }
    })
  }

  onCancel = ()=>{
    this.setState({
      selectedRows:[]
    })
    this.props.onCancel(false)
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
        orderStat: OrderStat.Resend.name,
        storeUuid: row.deliveryPoint.uuid,
        ownerUuid: row.owner.uuid
      })
    })
    this.props.onAddToOrder(list);
    this.setState({
      selectedRows:[]
    })
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
      width:140
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
      return convertCodeName(data);
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
    },
    {
      title: '单号',
      dataIndex: 'billNumbers',
      width: 130,
      render:val=>val?<EllipsisCol colValue={val.join('、')}/>:<Empty/>
    }
  ];

  render(){
    const { visible,data,selectedRows } = this.state
    const { loading } = this.props;
    return <div>
      <Modal 
        visible = {visible}
        title = '重送单'
        width='70%'
        onCancel = {this.onCancel}
        onOk = {this.onOk}
      >
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