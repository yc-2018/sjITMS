import { connect } from 'dva';
import moment from 'moment';
import { Form, Input,Select,DatePicker, Button } from 'antd';
// import { SearchOutlined } from '@ant-design/icons';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { placeholderLocale, commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import CarrierSelect from '@/pages/Component/Select/CarrierSelect';
import { State, Type } from './DispatchCenterShipPlanBillContants';
import { shipPlanBillDispatchLocale } from './DispatchCenterShipPlanBillLocale';
import ScheduleGroupSelect from '@/pages/Component/Select/ScheduleGroupSelect';
import { articleLocale } from '../../Basic/Article/ArticleLocale';
import OwnerSelect from '@/components/MyComponent/OwnerSelect';
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
      showLimitDays: true
    }
  }

  onReset = () => {
    this.props.refresh('reset');
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  showDriverModalOrNot = () => {
    this.props.showDriverModal();
  }

  showVehicleModalOrNot = () => {
    this.props.showVehicleModal();
  }

  drawCols = () => {
    const { form, filterValue, vehicleDtl, driverDtl, driverList, vehicleList  } = this.props;
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
    cols.push(
      <SFormItem md={6} key="vehicleStr" label={shipPlanBillDispatchLocale.vehicleNum}>
        {getFieldDecorator('vehicleStr', {
          initialValue: vehicleDtl && vehicleDtl.plateNumber ? vehicleDtl.plateNumber : vehicleList ? vehicleList : filterValue.vehicleStr ? filterValue.vehicleStr : ''
        })(
          <Input.Search placeholder={placeholderLocale(shipPlanBillDispatchLocale.vehicleNum)} onSearch={this.showVehicleModalOrNot}/>
        )}</SFormItem>
    );
    cols.push(
      <SFormItem md={6} key="carrier" label={shipPlanBillDispatchLocale.carrier}>
        {getFieldDecorator('carrier', {
          initialValue: filterValue.carrier ? filterValue.carrier : ''
        })(
          <CarrierSelect hasAll />
        )}</SFormItem>
    );
    cols.push(
      <SFormItem md={6} key="shipGroupCode" label={'排车作业组'}>
        {getFieldDecorator('shipGroupCode', {
          initialValue: filterValue.shipGroupCode ? filterValue.shipGroupCode : undefined,
        })(
          <ScheduleGroupSelect placeholder={placeholderChooseLocale('排车作业组')}/>
        )}</SFormItem>
    );
    cols.push(
      <SFormItem md={6} key="driverCodeName" label={'司机工号'}>
        {getFieldDecorator('driverCodeName', {
          initialValue: driverDtl && driverDtl.member ? driverDtl.member.code : driverList ? driverList : filterValue.driverCodeName ? filterValue.driverCodeName : ''
        })(
          <Input.Search placeholder={placeholderLocale('司机工号')} onSearch={this.showDriverModalOrNot}/>
        )}</SFormItem>
    );
    cols.push(
      <SFormItem md={6} key="createTime" label={'生成时间'}>
        {getFieldDecorator('createTime',
          { initialValue: createTimeInitial })(<RangePicker style={{ width: '100%' }} />
        )}</SFormItem>
    );
    cols.push(
      <SFormItem key="owner" label={articleLocale.articleOwner}>
        {getFieldDecorator('ownerCode', {
          initialValue: filterValue ? filterValue.ownerCode : ''
        })(
          <OwnerSelect onlyOnline />
        )}
      </SFormItem>
    );
    return cols;
  }
}
