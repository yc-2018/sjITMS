import { connect } from 'dva';
import moment from 'moment';
import { Form, message, Input, Spin, Card, Button,Tabs,Select } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale,tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { convertCodeName } from '@/utils/utils';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { PureComponent, Fragment } from 'react';
import LoadingIcon from '@/components/MyComponent/LoadingIcon';
import Empty from '@/pages/Component/Form/Empty';
import { State } from '../ShipPlanBill/ShipPlanBillContants';
import { MemberType, Type } from '../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import VehicleSelect from '../VehicleDispatching/Utils/VehicleSelect';
import NavigatorPanel from '../VehicleDispatching/Utils/NavigatorPanel';
import CreatePage from '../VehicleDispatching/Utils/CreatePage';
import { relationPlanBillLocale } from './RelationPlanBillLocale';

const TabPane = Tabs.TabPane;

@connect(({ relationplanbill,shipPlanBillDispatch, loading }) => ({
  relationplanbill,shipPlanBillDispatch,
  loading: loading.models.relationplanbill? loading.models.relationplanbill:false,
}))
@Form.create()
export default class NewShipPlanBill extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      title:  relationPlanBillLocale.newTitle,
      entity:{
        orderDetails: [],
        memberDetails: [],
        companyUuid:loginCompany().uuid,
        dispatchCenterUuid:loginOrg().uuid,
      }, // 排车单
      vehicleNumber:'',
      driver:undefined,
      shipBillNumber:'',
      selectedRows:[],
      selectedRowKeys:[],
      todoList:[],
      targetShipPlanBill:props.targetShipPlanBill
    }
  }
  componentDidMount() {
    this.props.onRef && this.props.onRef(this)
  }

  componentWillReceiveProps(nextProps) {
    const { entity } = this.state
    if (nextProps.relationplanbill.shipPlanBillRelation&&nextProps.relationplanbill.shipPlanBillRelation!=this.props.relationplanbill.shipPlanBillRelation) {
      this.setState({
        entity: nextProps.relationplanbill.shipPlanBillRelation
      });
    }

    if (nextProps.targetShipPlanBill&&nextProps.targetShipPlanBill!=this.props.targetShipPlanBill) {
      this.setState({
        targetShipPlanBill: nextProps.targetShipPlanBill
      },()=>{
        this.getRelationPlanBill();
      });
      
    }
    if(nextProps.todoList!=this.props.todoList&&Array.isArray(nextProps.todoList)&&nextProps.todoList.length!=0){
      entity.orderDetails = entity.orderDetails.concat(nextProps.todoList);
      this.setState({
        todoList:nextProps.todoList,
        entity:this.state.entity
      })
    }
  }

  getRelationPlanBill = ()=>{
    if(this.state.targetShipPlanBill&&this.state.targetShipPlanBill.relationPlanBillUuid){
      this.props.dispatch({
        type: 'relationplanbill/getShipPlanByUuid',
        payload: this.state.targetShipPlanBill.relationPlanBillUuid
      });
    }
    
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

  handleCancel = (data) => {
    this.props.form.resetFields();
    this.setState({
      entity:{
        orderDetails: [],
        memberDetails: [],
        companyUuid:loginCompany().uuid,
        dispatchCenterUuid:loginOrg().uuid,
      }
    })
  }
  onSave = () => {
    const { form } = this.props;
    const { targetShipPlanBill } = this.state;
    form.validateFields((errors, fieldsValue) => {
      if (errors) return;

      
      let vehicleDispatching = {
        ...this.state.entity,
        ...fieldsValue,
      };
      if(vehicleDispatching.vehicle){
        vehicleDispatching.vehicle = JSON.parse(vehicleDispatching.vehicle)
      }
      vehicleDispatching.relationPlanBillUuid = targetShipPlanBill.uuid;
      vehicleDispatching.relationPlanBillNum = targetShipPlanBill.billNumber;
      vehicleDispatching.fType = Type.Move.name


      if(!vehicleDispatching.memberDetails||vehicleDispatching.memberDetails.length === 0){
        message.error('人员明细不能为空！');
        return;
      }
  
      for(let i = 0;i<vehicleDispatching.memberDetails.length;i++){
        if(!vehicleDispatching.memberDetails[i].member){
          message.error('第'+(i+1)+'行人员不能为空');
          return;
        }
        if(!vehicleDispatching.memberDetails[i].memberType){
          message.error('第'+(i+1)+'行职能不能为空');
          return;
        }
      }
      let hasDriver = false;
      for(let i = 0 ;i<vehicleDispatching.memberDetails.length;i++){
        if(vehicleDispatching.memberDetails[i].memberType === MemberType.DRIVER.name){
          hasDriver = true;
          break;
        }
      }
  
      if(hasDriver == false){
        message.error('必须设置驾驶员');
        return;
      }
      for(let i = 0 ;i<vehicleDispatching.memberDetails.length;i++){
        for(let j = i+1 ;j<vehicleDispatching.memberDetails.length;j++){
          if (vehicleDispatching.memberDetails[i].member.uuid === vehicleDispatching.memberDetails[i].member.uuid &&
              vehicleDispatching.memberDetails[i].memberType === vehicleDispatching.memberDetails[j].memberType){
                message.error('第'+(i+1)+'行与第'+(j+1)+'行内容重复！');
                return;
          }
        }
      }

      this.props.dispatch({
        type:'relationplanbill/onMove',
        payload: vehicleDispatching,
        callback: (response) => {
          if (response && response.success) {
            message.success(commonLocale.saveSuccessLocale);
            this.handleCancel();
            this.props.refreshTodoBillPage();
          }
        }
      });
    });
  }

  handleFieldChange(e, fieldName, line) {
    const { entity } = this.state;
    if (fieldName === 'member') {
      let member = {
        uuid: JSON.parse(e).uuid,
        code: JSON.parse(e).code,
        name: JSON.parse(e).name,
      }
      entity.memberDetails[line - 1].member = member;

    }else if (fieldName === 'memberType') {
      entity.memberDetails[line - 1].memberType = e;

    }
    this.setState({
      entity: {...entity}
    });
  }

  onVehicleChange = (vehicleUcn, vehicleTypeUcn, carrierUcn) => {
    const { entity } = this.state;
    let vehicle = JSON.parse(vehicleUcn);
    if (!entity.vehicle || (entity.vehicle.uuid != vehicleUcn.uuid)) {
        entity.vehicle = vehicle;
        entity.vehicleType = vehicleTypeUcn;
        entity.carrier = carrierUcn;
    }

    this.setState({
        entity: { ...entity }
    });
  }

  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { vehicleNumber,driver,shipBillNumber,entity } = this.state;

    let basicCols = [
      <CFormItem label={relationPlanBillLocale.vehicle} key='vehicle'>
        {getFieldDecorator('vehicle', {
          initialValue: entity.vehicle?JSON.stringify(entity.vehicle):undefined,
          rules: [
            { required: true, message: notNullLocale(relationPlanBillLocale.vehicle) }
          ],
        })(
          entity.uuid?<span>{convertCodeName(entity.vehicle)}</span>:<VehicleSelect
              onChange={this.onVehicleChange}
              placeholder={relationPlanBillLocale.vehicle}
          />
        )}
      </CFormItem>,
      <CFormItem label={relationPlanBillLocale.vehicleType} key='vehicleType'>
        {getFieldDecorator('vehicleType', {
          initialValue: entity.vehicleType? entity.vehicleType:undefined,
        })(
          entity.vehicleType?<p>{convertCodeName(entity.vehicleType)}</p>:<Empty/>
        )}
      </CFormItem>,
      <CFormItem label={relationPlanBillLocale.carrier} key='carrier'>
      {getFieldDecorator('carrier', {
        initialValue: entity.carrier?entity.carrier:undefined,
      })(
        entity.carrier?<p>{convertCodeName(entity.carrier)}</p>:<Empty/>
      )}
    </CFormItem>,
    ];

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
    ];
  }

  drawTable = () => {
    const { entity,selectedRowKeys,selectedRows,targetShipPlanBill } = this.state;
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
        title:relationPlanBillLocale.volume,
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

    let userCols = [
      {
        title: commonLocale.lineLocal,
        key: 'line',
        dataIndex:'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title:relationPlanBillLocale.member,
        dataIndex: 'member',
        width: colWidth.codeNameColWidth,
        render:(val,record)=>{
        return this.state.entity.uuid?(record.member?<span>{convertCodeName(record.member)}</span>:<Empty/>): <UserSelect 
            value={record && record.member ? JSON.stringify(record.member):undefined} 
            single={true} 
            onChange={e => this.handleFieldChange(e, 'member', record.line)}
            placeholder = {placeholderLocale('人员')}
          />;
        }
      },
      {
        title: relationPlanBillLocale.memberType,
        dataIndex: 'memberType',
        width: colWidth.enumColWidth,
        render :(val,record)=>{
          return this.state.entity.uuid?(record.memberType?<span>{MemberType[record.memberType].caption}</span>:<Empty/>):<Select 
            value={record && record.memberType ? record.memberType:undefined} 
            onChange={e => this.handleFieldChange(e, 'memberType', record.line)}
            placeholder = {placeholderLocale(relationPlanBillLocale.memberType)}

          >
            <Select.Option value={MemberType.DRIVER.name}>{MemberType.DRIVER.caption}</Select.Option>
            <Select.Option value={MemberType.STEVEDORE.name}>{MemberType.STEVEDORE.caption}</Select.Option>
          </Select>
        }
      },
    ];
    return (
      <Tabs defaultActiveKey="resource">
        <TabPane tab={relationPlanBillLocale.orderInfo} key={"orderDetails"}>
          <ItemEditTable
            columns={itemsCols}
            data={entity.orderDetails ? entity.orderDetails: []}
            notNote
            fixed
            noLine
            noAddandDelete
            rowSelection = {this.rowSelection}
            selectedRowKeys = {selectedRowKeys}
            selectedRows = {selectedRows}
            noSelection={targetShipPlanBill.relationPlanBillNum?true:false}

          />
        </TabPane>
        <TabPane tab={relationPlanBillLocale.memberInfo} key={"memberDetails"}>
          <ItemEditTable
            columns={userCols}
            noAddandDelete={this.state.entity.uuid?true:false}
            notNote={true}
            data={this.state.entity.memberDetails ? this.state.entity.memberDetails : []}
            getSelectedRows = {this.getSelectedRows}
            noSelection={entity.relationPlanBillNum?true:false}
          />
        </TabPane>
      </Tabs>
    )
  }

  drawAuditButtons(){
    const {entity} =this.state
    return (
      entity.uuid?null:<Fragment>
          <Button key="cancel" onClick={this.handleCancel}>
            重置
          </Button>
          <Button key="save" type="primary" onClick={this.onSave}>
            {commonLocale.saveLocale}
          </Button>
      </Fragment>
    );
  }
  render() {
    
    return (
          <div style={{marginTop:'17px',width:'100%'}}>
            <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading} >
              <NavigatorPanel title={this.state.title} action={this.drawAuditButtons()}/>
              <Card bordered={false} style={{}}>
                  <Form onChange={this.onChange} autoComplete="off">
                      {this.drawFormItems()}
                      {this.drawTable()}
                  </Form>
              </Card>
            </Spin>

          </div>
    );
}
}
