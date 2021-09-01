import { connect } from 'dva';
import moment from 'moment';
import { Form, message, InputNumber,Tabs,Select } from 'antd';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale,tooLongLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { convertCodeName } from '@/utils/utils';
import { itemColWidth, colWidth } from '@/utils/ColWidth';
import ItemEditTable from '@/pages/Component/Form/ItemEditTable';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import SerialArchDispatchCenterSelect from '@/pages/Component/Select/SerialArchDispatchCenterSelect';
import Empty from '@/pages/Component/Form/Empty';
import ViewTablePanel from '@/pages/Component/Form/ViewTablePanel';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import { MemberType, State } from './ShipPlanBillDispatchContants';
import { shipPlanBillDispatchLocale } from './ShipPlanBillDispatchLocale';
import styles from './ShipPlanBillDispatch.less';
import VehicleSelect from '../VehicleDispatching/Utils/VehicleSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';

const TabPane = Tabs.TabPane;

@connect(({ shipPlanBillDispatch, loading }) => ({
  shipPlanBillDispatch,
  loading: loading.models.shipPlanBillDispatch,
}))
@Form.create()
export default class ShipPlanBillDispatchCreatePage extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale,
      entity: {},
    }
  }
  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shipPlanBillDispatch.entity && this.props.shipPlanBillDispatch.entityUuid) {
      this.setState({
        entity: nextProps.shipPlanBillDispatch.entity,
        title: shipPlanBillDispatchLocale.shipPlanBillNum + '：' + nextProps.shipPlanBillDispatch.entity.billNumber,

      });
    }
  }

  refresh = () => {
    this.props.dispatch({
      type: 'shipPlanBillDispatch/get',
      payload: this.props.shipPlanBillDispatch.entityUuid
    });
  }

  onCancel = () => {
    this.props.dispatch({
      type: 'shipPlanBillDispatch/showPage',
      payload: {
        showPage: 'query'
      }
    });
  }
  onView = (uuid)=>{
    this.props.dispatch({
      type: 'shipPlanBillDispatch/showPage',
      payload: {
        showPage: 'view',
        entityUuid: uuid
      }
    });
  }

  onSave = (data) => {
    let serialArch={};
    let vehicle={};
    if(data.serialArch){
      serialArch = JSON.parse(data.serialArch)
    }

    if(data.vehicle){
      vehicle = JSON.parse(data.vehicle)
    }


    let vehicleDispatching = {
      ...this.state.entity,
      ...data,
      serialArch:serialArch,
      vehicle:vehicle,
    };

    if(!vehicleDispatching.orderDetails){
      vehicleDispatching.orderDetails = [];
    }

    if(vehicleDispatching.memberDetails.length==0){
      message.warning('人员明细不能为空')
      return;
    }

    this.props.dispatch({
      type:'vehicleDispatching/onModifyShipPlan',
      payload: vehicleDispatching,
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.onView(vehicleDispatching.uuid)
        }
      }
    })
  }

  onVehicleChange = (vehicleUcn, vehicleTypeUcn, carrierUcn,employees) => {
    const { entity } = this.state;
    entity.memberDetails.length = 0;

    let vehicle = JSON.parse(vehicleUcn);
    if (!entity.vehicle || (entity.vehicle.uuid != vehicleUcn.uuid)) {
        entity.vehicle = vehicle;
        entity.vehicleType = vehicleTypeUcn;
        entity.carrier = carrierUcn;
    }

    employees&&employees.forEach((employe,index)=>{
      entity.memberDetails&&entity.memberDetails.push({
        line:index+1,
        member:{
          uuid:employe.empUuid,
          code:employe.empCode,
          name:employe.empName,
        },
        memberType:employe.workType
      })
    })
    this.setState({
        entity: { ...entity }
    });
}


/**
 * 表格变化时
 * @param {*} e
 * @param {*} fieldName
 * @param {*} key
 */
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


  drawFormItems = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    let basicCols = [
      <CFormItem key='billNumber' label={shipPlanBillDispatchLocale.billNumber}>
        {
          getFieldDecorator('billNumber', {
            initialValue: entity.billNumber,
          })(
            <span>{entity.billNumber}</span>
          )
        }
      </CFormItem>,
      <CFormItem label={shipPlanBillDispatchLocale.serialArch} key='serialArch'>
        {getFieldDecorator('serialArch', {
          initialValue: entity.serialArch?JSON.stringify(entity.serialArch):undefined,
          rules: [
            { required: true, message: notNullLocale(shipPlanBillDispatchLocale.serialArch) }
          ],
        })(
          <span>{convertCodeName(entity.serialArch)}</span>
        )}
      </CFormItem>,
      <CFormItem label={shipPlanBillDispatchLocale.vehicle} key='vehicle'>
        {getFieldDecorator('vehicle', {
          initialValue: entity.vehicle?JSON.stringify(entity.vehicle):undefined,
          rules: [
            { required: true, message: notNullLocale(shipPlanBillDispatchLocale.vehicle) }
          ],
        })(
          entity.stat&&entity.stat==State.Approved.name?<span>{entity.vehicle?convertCodeName(entity.vehicle):''}</span>:
          <VehicleSelect
              onChange={this.onVehicleChange}
              placeholder={shipPlanBillDispatchLocale.vehicle}
          />
        )}
      </CFormItem>,
      <CFormItem label={shipPlanBillDispatchLocale.vehicleType} key='vehicleType'>
        {getFieldDecorator('vehicleType', {
          initialValue: entity.vehicleType? entity.vehicleType:undefined,
        })(
          entity.vehicleType?<p>{convertCodeName(entity.vehicleType)}</p>:<Empty/>
        )}
      </CFormItem>,
      <CFormItem label={shipPlanBillDispatchLocale.carrier} key='carrier'>
        {getFieldDecorator('carrier', {
          initialValue: entity.carrier?entity.carrier:undefined,
        })(
          entity.carrier?<p>{convertCodeName(entity.carrier)}</p>:<Empty/>
        )}
      </CFormItem>,
      <CFormItem label={shipPlanBillDispatchLocale.order} key='order'>
        {getFieldDecorator('order', {
            initialValue: entity.order,
            rules: [
              { required: true, message: notNullLocale(shipPlanBillDispatchLocale.order) }
            ],
          })(
            <InputNumber style={{width:'100%'}} min={1} placeholder={placeholderLocale(shipPlanBillDispatchLocale.order)}/>
          )}
      </CFormItem>,
    ];

    return [
      <FormPanel key='basicInfo' title={commonLocale.basicInfoLocale} cols={basicCols} />,
    ];
  }

  drawTable = () => {
    const { entity } = this.state;
    let orderDetailsCols = [
      {
        title: commonLocale.lineLocal,
        key: 'line',
        dataIndex:'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: shipPlanBillDispatchLocale.orderNumber,
        key: 'orderNumber',
        dataIndex:'orderNumber',
        width: 200,
      },
      {
        title: shipPlanBillDispatchLocale.pickUpPoint,
        key: 'pickUpPoint',
        dataIndex:'pickUpPoint',
        width: 200,
        render:val=>val?val.address:<Empty/>
      },
      {
        title: shipPlanBillDispatchLocale.deliveryPoint,
        key: 'deliveryPoint',
        dataIndex:'deliveryPoint',
        width: 200,
        render:val=>val?val.address:<Empty/>
      },
      {
        title: shipPlanBillDispatchLocale.cartonCount,
        key: 'cartonCount',
        dataIndex:'cartonCount',
        width: 100,
      },
      {
        title: shipPlanBillDispatchLocale.containerCount,
        key: 'containerCount',
        dataIndex:'containerCount',
        width: 100,
      },
      {
        title: shipPlanBillDispatchLocale.weight,
        key: 'weight',
        dataIndex:'weight',
        width: 100,
      },
      {
        title:shipPlanBillDispatchLocale.volume,
        key: 'volume',
        dataIndex:'volume',
        width: 100,
      },
    ];
    let memberDetailsCols = [
      {
        title: commonLocale.lineLocal,
        key: 'line',
        dataIndex:'line',
        width: itemColWidth.lineColWidth,
      },
      {
        title: shipPlanBillDispatchLocale.member,
        dataIndex: 'member',
        width: colWidth.codeNameColWidth,
        render:(val,record)=>{
        return entity.stat&&entity.stat==State.Approved.name?<p>{convertCodeName(val)}</p>:  <UserSelect 
            value={record && record.member ? JSON.stringify(record.member):undefined} 
            single={true} 
            onChange={e => this.handleFieldChange(e, 'member', record.line)}
            placeholder = {placeholderLocale('人员')}
          />;
        }
      },
      {
        title: shipPlanBillDispatchLocale.memberType,
        dataIndex: 'memberType',
        width: colWidth.enumColWidth,
        render :(val,record)=>{
          return entity.stat&&entity.stat==State.Approved.name?<p>{MemberType[val].caption}</p>: <Select 
            value={record && record.memberType ? record.memberType:undefined} 
            onChange={e => this.handleFieldChange(e, 'memberType', record.line)}
            placeholder = {placeholderLocale(shipPlanBillDispatchLocale.memberType)}

          >
            <Select.Option value={MemberType.DRIVER.name}>{MemberType.DRIVER.caption}</Select.Option>
            <Select.Option value={MemberType.STEVEDORE.name}>{MemberType.STEVEDORE.caption}</Select.Option>
            <Select.Option value={MemberType.DEPUTYDRIVER.name}>{MemberType.DEPUTYDRIVER.caption}</Select.Option>
            <Select.Option value={MemberType.DELIVERYMAN.name}>{MemberType.DELIVERYMAN.caption}</Select.Option>
          </Select>
        }
      },
    ];
    let tabs =<Tabs defaultActiveKey="orderDetails" className={styles.ItemTabs}>
      <TabPane tab={shipPlanBillDispatchLocale.orderDetails} key="orderDetails">
        <ViewTablePanel
          title={commonLocale.itemsLocale}
          columns={orderDetailsCols}
          data={this.state.entity.orderDetails?this.state.entity.orderDetails:[]}
        />
      </TabPane>
      <TabPane tab={shipPlanBillDispatchLocale.memberDetails} key="memberDetails">
        <div style={{marginTop:'20px'}}>
          {
            entity.stat&&entity.stat==State.Approved.name?
            <ViewTablePanel
              title={commonLocale.itemsLocale}
              columns={memberDetailsCols}
              data={this.state.entity.memberDetails?this.state.entity.memberDetails:[]}
            />
            :<ItemEditTable
            columns={memberDetailsCols}
            notNote={true}
            noBatchRemove={true}
            data={this.state.entity.memberDetails ? this.state.entity.memberDetails : []}
          />
          }
          
        </div>
      
      </TabPane>
    </Tabs>;
    return (
      <ViewPanel children={tabs} title={commonLocale.itemsLocale} />
    )
  }
}