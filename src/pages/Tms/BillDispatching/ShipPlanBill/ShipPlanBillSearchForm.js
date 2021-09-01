import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SFormItem from '../SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '../SearchForm';
import { vehicleDispatchingLocale } from '../../VehicleDispatching/VehicleDispatchingLocale';
import TeamSelect from '@/pages/Component/Select/TeamSelect';
import ScheduleGroupSelect from '@/pages/Component/Select/ScheduleGroupSelect';
import { State } from '../../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  if(key ==='Saved'||key ==='Approved'){
    stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
  }
});

@connect(({ order, loading }) => ({
  order,
  loading: loading.models.order,
}))
@Form.create()
export default class ShipPlanBillSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showColCount:3
    }
  }
  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  /**
   * 绘制列
   */
  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle } = this.state;
    let cols = [];
    cols.push(
      <SFormItem key="billNumber" label={'排车单号'}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber ? filterValue.billNumber : ''
        })(
          <Input placeholder={placeholderLocale('排车单号')}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={vehicleDispatchingLocale.shipPlanBillState}>
        {getFieldDecorator('state', {
          initialValue: filterValue.state ? filterValue.state : ''
        })(
          <Select>
            {stateOptions}
          </Select>
        )}
      </SFormItem>
    );
    
    if (toggle) {
      cols.push(
        <SFormItem key="classGroup" label={'班组'}>
          {getFieldDecorator('classGroup', {
            initialValue: filterValue.classGroup ? filterValue.classGroup : undefined
          })(
            <TeamSelect placeholder={placeholderLocale('班组')}/>
          )}
        </SFormItem>
      );
     
      cols.push(
        <SFormItem  key="vehicleCode" label={'车辆'}>
          {getFieldDecorator('vehicleCode', {
            initialValue: filterValue.vehicleCode ? filterValue.vehicleCode : undefined,
          })(
            
            <Input readOnly={true} placeholder={placeholderLocale('车辆')} onClick={()=>{this.props.onClickVehicle()}}/>
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="shipGroupCode" label={'作业组'}>
          {getFieldDecorator('shipGroupCode', {
            initialValue: filterValue.shipGroupCode ? filterValue.shipGroupCode : undefined,
          })(
            <ScheduleGroupSelect placeholder={placeholderLocale('作业组')}/>
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
