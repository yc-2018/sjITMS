import { connect } from 'dva';
import { Form, Input,Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { placeholderLocale, commonLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { pickUpConfirmLocale } from './PickUpConfirmLocale';
import VendorSelect from '@/pages/Component/Select/VendorSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { STATE } from '@/utils/constants';
import { orgType } from '@/utils/OrgType';
import { loginCompany } from '@/utils/LoginContext';
import ShipPlanBillSelect from '@/pages/Component/Select/ShipPlanBillSelect';


@connect(({ pickUpConfirm, loading }) => ({
  pickUpConfirm,
  loading: loading.models.pickUpConfirm,
}))
@Form.create()
export default class PickUpConfirmSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
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
    let cols = [];
    cols.push(
      <SFormItem key='shipPlanBillNumber' label={pickUpConfirmLocale.shipPlanBillNumber}>
        {getFieldDecorator('shipPlanBillNumber',
        { initialValue: filterValue.shipPlanBillNumber ? filterValue.shipPlanBillNumber : '' ,
          rules: [
            { required: true, message: notNullLocale(pickUpConfirmLocale.shipPlanBillNumber) }
          ],}
        )(
          <Input placeholder={placeholderLocale(pickUpConfirmLocale.shipPlanBillNumber)} />
        )
      }
      </SFormItem>
    );
    cols.push(
      <SFormItem key='plateNumber' label={pickUpConfirmLocale.plateNumber}>
        {getFieldDecorator('plateNumber',
        { initialValue: filterValue.plateNumber ? filterValue.plateNumber : '' }
      )(
        <Input placeholder={placeholderLocale(pickUpConfirmLocale.plateNumber)} />)
      }
      </SFormItem>
    );
    
    cols.push(
      <SFormItem key='vendor' label={commonLocale.vendorLocale}>
        {getFieldDecorator('vendor',
        { initialValue: filterValue.vendor ? filterValue.vendor : undefined }
      )(
        <OrgSelect
          upperUuid={loginCompany().uuid}
          state={STATE.ONLINE}
          type={orgType.vendor.name}
          single
          placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
        />)
      }
      </SFormItem>
    );

    return cols;
  }
}