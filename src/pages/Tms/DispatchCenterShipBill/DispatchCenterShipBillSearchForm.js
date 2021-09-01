import { Form, Input, Select, DatePicker } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale, placeholderContainedLocale } from '@/utils/CommonLocale';
import { shipBillLocale } from './DispatchCenterShipBillLocale';
import { State } from './DispatchCenterShipBillContants';
import UserSelect from '@/pages/Component/Select/UserSelect';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

@Form.create()
export default class DispatchCenterShipBillSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
    }
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;
    const { toggle } = this.state;

    let cols = [
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>,
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          {
            initialValue: filterValue.state ? filterValue.state : ' '
          }
        )(
          <Select initialValue=' '>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>
    ];

    if (toggle == false)
      return cols;
    <SFormItem key="shipPlanBillNumber" label={shipBillLocale.shipPlanBillNumber}>
      {getFieldDecorator('shipPlanBillNumber', {
        initialValue: filterValue.shipPlanBillNumber
      })(
        <Input placeholder={placeholderLocale(shipBillLocale.shipPlanBillNumber)} />
      )}
    </SFormItem>
    cols.push(
      <SFormItem key="plateNumber" label={shipBillLocale.plateNumber}>
        {getFieldDecorator('plateNumber',
          {
            initialValue: filterValue.plateNumber ? filterValue.plateNumber : null
          }
        )(
          <Input placeholder={placeholderLocale(shipBillLocale.plateNumber)} />
        )}
      </SFormItem>
    );

    cols.push(
      <SFormItem key="vehicleEmployeeUuid" label={shipBillLocale.driver}>
        {
          getFieldDecorator('vehicleEmployeeUuid', {
            initialValue: filterValue.vehicleEmployeeUuid ? filterValue.vehicleEmployeeUuid : undefined
          })(
            <UserSelect autoFocus single={true} placeholder={placeholderChooseLocale(shipBillLocale.driver)} />)
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="pickUpPointCode" label={shipBillLocale.pickUpPoint}>
        {getFieldDecorator('pickUpPointCode', { initialValue: filterValue.pickUpPointCode ? filterValue.pickUpPointCode : '' })(
          <Input placeholder={placeholderLocale(`${shipBillLocale.pickUpPoint}`)}/>)}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="deliveryPointCode" label={shipBillLocale.deliveryPoint}>
        {getFieldDecorator('deliveryPointCode', { initialValue: filterValue.deliveryPointCode ? filterValue.deliveryPointCode : '' })(
          <Input placeholder={placeholderLocale(`${shipBillLocale.deliveryPoint}`)}/>)}
      </SFormItem>
    );


    return cols;
  }
}
