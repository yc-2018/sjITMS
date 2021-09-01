import { connect } from 'dva';
import moment from 'moment';
import { Form, Input,Select,DatePicker } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { placeholderLocale, commonLocale } from '@/utils/CommonLocale';
import CarrierSelect from '@/pages/Component/Select/CarrierSelect';
import { State, Type } from './ShipPlanBillDispatchContants';
import { shipPlanBillDispatchLocale } from './ShipPlanBillDispatchLocale';
import ScheduleGroupSelect from '@/pages/Component/Select/ScheduleGroupSelect';
const { RangePicker } = DatePicker;

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

const typeOptions = [];
typeOptions.push(<Option key='TypeAll' value=''>{commonLocale.allLocale}</Option>)
Object.keys(Type).forEach(function (key) {
  typeOptions.push(<Option key={Type[key].name} value={Type[key].name}>{Type[key].caption}</Option>);
});
@connect(({ shipPlanBillDispatch, loading }) => ({
  shipPlanBillDispatch,
  loading: loading.models.shipPlanBillDispatch,
}))
@Form.create()
export default class ShipPlanBillDispatchSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
    }
  }

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle } = this.state;
    let createTimeInitial = filterValue.createTime && filterValue.createTime.length == 2 ? [moment(filterValue.createTime[0]), moment(filterValue.createTime[1])] : null;
    
    let cols = [];

    
    cols.push(
      <SFormItem md={6} key="billNumber" label={shipPlanBillDispatchLocale.shipPlanBillNum}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber ? filterValue.billNumber : ''
        })(
          <Input placeholder={placeholderLocale(shipPlanBillDispatchLocale.shipPlanBillNum)}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem md={6} key="stat" label={shipPlanBillDispatchLocale.stat}>
        {getFieldDecorator('stat', {
          initialValue: filterValue.stat ? filterValue.stat : ''
        })(
          <Select>
            {stateOptions}
          </Select>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem md={6} key="type" label={shipPlanBillDispatchLocale.type}>
        {getFieldDecorator('type', {
          initialValue: filterValue.type ? filterValue.type : ''
        })(
          <Select>
            {typeOptions}
          </Select>
        )}
      </SFormItem>
    );

    if (toggle) {
      cols.push(
        <SFormItem md={6} key="vehicleStr" label={shipPlanBillDispatchLocale.vehicleNum}>
          {getFieldDecorator('vehicleStr', {
            initialValue: filterValue.vehicleStr ? filterValue.vehicleStr : ''
          })(
            <Input placeholder={placeholderLocale(shipPlanBillDispatchLocale.vehicleNum)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="carrier" label={shipPlanBillDispatchLocale.carrier}>
          {getFieldDecorator('carrier', {
              initialValue: filterValue.carrier ? filterValue.carrier : ''
          })(
              <CarrierSelect hasAll />
          )}
      </SFormItem>
      );
      cols.push(
        <SFormItem  key="shipGroupCode" label={'排车作业组'}>
          {getFieldDecorator('shipGroupCode', {
            initialValue: filterValue.shipGroupCode ? filterValue.shipGroupCode : undefined,
          })(
            <ScheduleGroupSelect placeholder={placeholderLocale('排车作业组')}/>
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem md={6} key="driverCodeName" label={'司机工号'}>
          {getFieldDecorator('driverCodeName', {
            initialValue: filterValue.driverCodeName ? filterValue.driverCodeName : ''
          })(
            <Input placeholder={placeholderLocale('司机工号')}/>
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="createTime" label={'生成时间'}>
          {getFieldDecorator('createTime',
            { initialValue: createTimeInitial }
          )(
            <RangePicker style={{ width: '120%' }} />
          )
          }
        </SFormItem>
      );
    }
    return cols;
  }
}