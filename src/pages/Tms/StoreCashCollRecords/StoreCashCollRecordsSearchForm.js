import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import StoreSelect from '@/pages/Component/Select/StoreSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { storeLocale } from './StoreCashCollRecordsLocale';
import {PRETYPE} from '@/utils/constants';
@connect(({ store,pretype,loading }) => ({
  store,
  pretype,
  loading: loading.models.store,
}))
@Form.create()
export default class StoreSearchForm extends SearchForm {
  constructor(props) {
    super(props);
  }

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    data.owner = data.owner ? JSON.parse(data.owner) : undefined;
    data.ownerUuid = data.owner ? data.owner.uuid : undefined;
    this.props.refresh(data);
  }

  /**
   * 绘制列
   */
  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    let cols = [];
    cols.push(
      <SFormItem key="plateNumber" label={storeLocale.vehicleNum}>
        {getFieldDecorator('plateNumber', {
          initialValue: filterValue ? filterValue.plateNumber : ''
        })(
          <Input placeholder={placeholderLocale(storeLocale.vehicleNum)}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="shipPlanBillNumber" label={storeLocale.shipPlanBill}>
        {getFieldDecorator('shipPlanBillNumber', {
          initialValue: filterValue ? filterValue.shipPlanBillNumber : ''
        })(
          <Input placeholder={placeholderLocale(storeLocale.shipPlanBill)}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="vehicleEmployeeCodeName" label={storeLocale.driver}>
        {getFieldDecorator('vehicleEmployeeCodeName', {
          initialValue: filterValue ? filterValue.vehicleEmployeeCodeName : ''
        })(
          <Input placeholder={placeholderLocale(storeLocale.driver)}/>
        )}
      </SFormItem>
    );

    cols.push(
      <SFormItem key="deliveryPointCode" label={commonLocale.inStoreLocale}>
        {getFieldDecorator('deliveryPointCode', {
          initialValue: filterValue ? filterValue.deliveryPointCode : ''
        })(
          <StoreSelect
            placeholder={placeholderChooseLocale(commonLocale.inStoreLocale)}
            showSearch={true}
            single
          />
        )}
      </SFormItem>
    );
    return cols;
  }
}
