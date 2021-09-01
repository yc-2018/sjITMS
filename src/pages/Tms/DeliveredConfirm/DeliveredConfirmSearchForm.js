import { connect } from 'dva';
import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import ShipPlanBillNumberSelect from './ShipPlanBillNumberSelect';
import VehicleSelect from '../VehicleDispatching/Utils/VehicleSelect';
import { deliveredConfirmLocale } from './DeliveredConfirmLocale';

@connect(({ deliveredConfirm, loading }) => ({
  deliveredConfirm,
  loading: loading.models.deliveredConfirm,
}))
@Form.create()
export default class DeliveredConfirmSearchForm extends SearchForm {
  constructor(props) {
    super(props);
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
    let cols = [];
    cols.push(
      <SFormItem key='vehicle' label={deliveredConfirmLocale.vehicle}>
        {getFieldDecorator('vehicle',
        { initialValue: filterValue.vehicle ? filterValue.vehicle : undefined }
      )(
        <Input placeholder={placeholderLocale(deliveredConfirmLocale.vehicle)} />)
      }
      </SFormItem>
    );

    cols.push(
      <SFormItem key='driver' label={deliveredConfirmLocale.driver}>
        {getFieldDecorator('driver',
        { initialValue: filterValue.driver ? filterValue.driver : undefined }
      )(
        <UserSelect single hasAll placeholder={placeholderChooseLocale(deliveredConfirmLocale.driver)} />)}

      </SFormItem>
    );

    cols.push(
      <SFormItem key='shipPlanNumber' label={deliveredConfirmLocale.shipPlanNumber}>
        {getFieldDecorator('shipPlanNumber',
        { 
          initialValue: filterValue.shipPlanNumber ? filterValue.shipPlanNumber : undefined,
          rules: [
            { required: true, message: notNullLocale(deliveredConfirmLocale.shipPlanNumber) }
          ],
        }
      )(
        <ShipPlanBillNumberSelect 
          vehicleStr={this.props.form.getFieldValue('vehicle')?this.props.form.getFieldValue('vehicle'):null} 
          driverCodeName={this.props.form.getFieldValue('driver')?JSON.parse(this.props.form.getFieldValue('driver')).name:null}
        />
      )
      }
      </SFormItem>
    );

    return cols;
  }
}