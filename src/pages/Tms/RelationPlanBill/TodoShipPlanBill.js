import { connect } from 'dva';
import moment from 'moment';
import { PureComponent } from 'react';

import { Form, message, Input, Spin, Card, Select } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale,tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import UserSelect from '@/pages/Component/Select/UserSelect';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import Empty from '@/pages/Component/Form/Empty';
import { Type, MemberType,State } from '../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import CreatePage from '../VehicleDispatching/Utils/CreatePage';
import NavigatorPanel from '../VehicleDispatching/Utils/NavigatorPanel';
import { relationPlanBillLocale } from './RelationPlanBillLocale';

@connect(({ relationplanbill,shipPlanBillDispatch, loading }) => ({
  relationplanbill,shipPlanBillDispatch,
  loading: loading.models.shipPlanBillDispatch? loading.models.shipPlanBillDispatch:false,
}))
@Form.create()
export default class TodoShipPlanBill extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      title:  relationPlanBillLocale.todoTitle,
      entity:{},
      vehicleStr:'',
      driver:undefined,
      shipPlanBillNumber:undefined,
      selectedRows:[],
      selectedRowKeys:[],
      newList:[],
      shipPlanBillList:[],
    }
  }
  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
  }

  componentWillReceiveProps(nextProps) {
    const { entity } = this.state;

    if(nextProps.newList!=this.props.newList&&Array.isArray(nextProps.newList)&&nextProps.newList.length!=0){
      entity.orderDetails = entity.orderDetails.concat(nextProps.newList);
      this.setState({
        newList:nextProps.newList,
        entity:this.state.entity
      })
    }

    if(nextProps.shipPlanBillDispatch.data&&nextProps.shipPlanBillDispatch.data!=this.props.shipPlanBillDispatch.data){
      this.setState({
        shipPlanBillList:nextProps.shipPlanBillDispatch.data.list
      })
    }

    if(nextProps.relationplanbill.shipPlanBill&&nextProps.relationplanbill.shipPlanBill!=this.props.relationplanbill.shipPlanBill){
      this.setState({
        entity:nextProps.relationplanbill.shipPlanBill
      })
      this.props.targetShipPlanBillToNew(nextProps.relationplanbill.shipPlanBill); 
    }
  }

  resetValue = ()=>{
    this.props.form.resetFields();
    this.setState({
      shipPlanBillList:[],
      entity:{},
      vehicleStr:'',
      driver:undefined,
      shipPlanBillNumber:undefined,
      selectedRows:[],
      selectedRowKeys:[],
      newList:[],
    })
  }
  /**
   * 返回选中行
   */
  getSelectRows =()=>{
    const { entity,selectedRows } = this.state;
    if(selectedRows.length==0){
      message.warning('请先选择行');
      return false;
    }
    selectedRows.forEach(row=>{
      if(entity.orderDetails.indexOf(row)!=-1){
        entity.orderDetails.splice(entity.orderDetails.indexOf(row),1);
      } 
    });
    this.setState({
      selectedRows:[],
      selectedRowKeys:[],
    });
    return this.state.selectedRows;
  }

  rowSelection=(selectedRowKeys, selectedRows)=>{
    this.setState({
      selectedRows:selectedRows,
      selectedRowKeys:selectedRowKeys,
    })
  }


  userChange = (e)=>{
    this.props.form.setFieldsValue({
      shipPlanBillNumber:undefined
    });

    let list = [];
    let queryFilter = {
      page: 0,
      pageSize: 1000,
      searchKeyValues: {
        vehicleStr:this.props.form.getFieldValue('vehicleStr')?this.props.form.getFieldValue('vehicleStr'):undefined,
        driverCodeName:JSON.parse(e).code,
        stat:State.Delivering.name
      },
    }
    this.props.dispatch({
      type: 'shipPlanBillDispatch/query',
      payload: queryFilter,
    });
  }

  queryShipPlanBillList = (value) => {
    if(value==true){
      this.props.form.setFieldsValue({
        shipPlanBillNumber:undefined
      });
    }

    let list = [];
    let queryFilter = {
      page: 0,
      pageSize: 1000,
      searchKeyValues: {
        vehicleStr:this.props.form.getFieldValue('vehicleStr'),
        billNumber:(value!=undefined&&value!=true)?value:this.props.form.getFieldValue('shipPlanBillNumber'),
        driverCodeName:this.props.form.getFieldValue('driver')?JSON.parse(this.props.form.getFieldValue('driver')).code:undefined,
        stat:State.Delivering.name
      },
    }
    this.props.dispatch({
      type: 'shipPlanBillDispatch/query',
      payload: queryFilter,
    });
  }

  queryShipPlanBill = (value)=>{
    this.props.dispatch({
      type: 'relationplanbill/getShipPlanByBillNumber',
      payload: value,
    });
  }


  getShipPlanBillNumberOptions = () => {
		const billNumberOptions = [];
		this.state.shipPlanBillList.forEach(e => {
			billNumberOptions.push(
				<Select.Option key={e.billNumber} value={e.billNumber}>{e.billNumber}</Select.Option>
			);
		});
		return billNumberOptions;
	}

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { vehicleStr,driver,shipPlanBillNumber,entity } = this.state;
    let basicCols = [
      <CFormItem key='vehicleStr' label={relationPlanBillLocale.vehicleStr}>
        {
          getFieldDecorator('vehicleStr', {
            initialValue: vehicleStr,
          })(
            <Input placeholder={placeholderLocale(relationPlanBillLocale.vehicleStr)} onBlur={()=>this.queryShipPlanBillList(true)}/>
            )
        }
      </CFormItem>,
      <CFormItem key='driver' label={relationPlanBillLocale.driver}>
        {
          getFieldDecorator('driver', {
            initialValue: driver,
          })(
            <UserSelect single={true} placeholder={placeholderChooseLocale(relationPlanBillLocale.driver)} onChange={(e)=>this.userChange(e)}/>)
        }
      </CFormItem>,
       <CFormItem key='shipPlanBillNumber' label={relationPlanBillLocale.shipPlanBillNumber}>
       {
         getFieldDecorator('shipPlanBillNumber', {
           initialValue: shipPlanBillNumber,
         })(
          <Select showSearch={true} onSearch ={this.queryShipPlanBillList} onChange={this.queryShipPlanBill} placeholder={placeholderLocale(relationPlanBillLocale.shipPlanBillNumber)}>
            {this.getShipPlanBillNumberOptions()}
          </Select>
        )
       }
     </CFormItem>,
      <CFormItem key='state' label={relationPlanBillLocale.state}>
        {
          getFieldDecorator('state', {
            initialValue: entity.stat,
          })(
            entity.stat?<p>{State[entity.stat].caption}</p>:<Empty/>
          )
        }
      </CFormItem>,

    ];

    return [
      <FormPanel key='basicInfo' title={relationPlanBillLocale.searchTitle} cols={basicCols} />,
    ];
  }

  drawTable = () => {
    const { entity,selectedRows,selectedRowKeys } = this.state;
    let itemsCols = [
      {
        title: relationPlanBillLocale.orderNumber,
        key: 'orderNumber',
        dataIndex:'orderNumber',
        width: 200,
        render:val=>val?val:<Empty/>
      },
      {
        title: relationPlanBillLocale.pickUpPoint,
        key: 'pickUpPoint',
        dataIndex:'pickUpPoint',
        width: 150,
        render:val=>val?val.name:<Empty/>
      },
      {
        title: relationPlanBillLocale.deliveryPoint,
        key: 'deliveryPoint',
        dataIndex:'deliveryPoint',
        width: 150,
        render:val=>val?val.name:<Empty/>
      },
      {
        title: relationPlanBillLocale.cartonCount,
        key: 'cartonCount',
        dataIndex:'cartonCount',
        width: 150,
      },
      {
        title: relationPlanBillLocale.containerCount,
        key: 'containerCount',
        dataIndex:'containerCount',
        width: 150,
      },
      {
        title: relationPlanBillLocale.volume,
        key: 'volume',
        dataIndex:'volume',
        width: 150,
      },
      {
        title: relationPlanBillLocale.weight,
        key: 'weight',
        dataIndex:'weight',
        width: 150,
      },
    ];
    return (
      <ItemEditTable
        title={relationPlanBillLocale.orderInfo}
        columns={itemsCols}
        data={entity.orderDetails ? entity.orderDetails: []}
        notNote
        fixed
        noLine
        noAddandDelete
        noSelection={entity.relationPlanBillNum?true:false}
        rowSelection = {this.rowSelection}
        selectedRowKeys = {selectedRowKeys}
        selectedRows = {selectedRows}
      />
    )
  }
  render() {
    
    return (
      <div style={{marginTop:'17px',width:'100%'}}>
        <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading} >
          <NavigatorPanel title={this.state.title}/>
          <Card bordered={false} style={{}}>
              <Form onChange={this.onChange} autoComplete="off">
                  {this.drawFormItems()}
                  {this.drawTable && this.drawTable()}
              </Form>
          </Card>
        </Spin>

      </div>
    );
  }
}
