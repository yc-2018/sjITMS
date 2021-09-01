import { connect } from 'dva';
import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import UserSelect from '@/pages/Component/Select/UserSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { placeholderLocale, placeholderChooseLocale, commonLocale } from '@/utils/CommonLocale';
import { loginCompany } from '@/utils/LoginContext';
import StoreSelect from '@/pages/Component/Select/StoreSelect';
import { checkReceiptBillLocale } from './CheckReceiptBillLocale';

@connect(({ checkReceiptBill, loading }) => ({
  checkReceiptBill,
  loading: loading.models.checkReceiptBill,
}))
@Form.create()
export default class CheckReceiptBillSearchForm extends SearchForm {
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
    let cols = [];

    cols.push(
      <SFormItem key='vehicleName' label={checkReceiptBillLocale.vehicleName}>
        {getFieldDecorator('vehicleName',
        { initialValue: filterValue.vehicleName ? filterValue.vehicleName : '' }
      )(
        <Input placeholder={placeholderLocale('车牌号')} />)
      }
      </SFormItem>
    );

    cols.push(
      <SFormItem key='shipPlanBillNumber' label={checkReceiptBillLocale.shipPlanBillNumber}>
        {getFieldDecorator('shipPlanBillNumber',
        { initialValue: filterValue.shipPlanBillNumber ? filterValue.shipPlanBillNumber : '' }
      )(
        <Input placeholder={placeholderLocale(checkReceiptBillLocale.shipPlanBillNumber)} />)
      }
      </SFormItem>);
    cols.push(
      <SFormItem key='orderSourceNumber' label={"来源单号"}>
      {getFieldDecorator('orderSourceNumber',
      { initialValue: filterValue.orderSourceNumber ? filterValue.orderSourceNumber : '' }
    )(
      <Input placeholder={placeholderLocale("物流来源单号")} />)
    }
    </SFormItem>);
    cols.push(
      <SFormItem key='receipted' label={checkReceiptBillLocale.isReceipted}>
        {getFieldDecorator('receipted',
        { initialValue: filterValue.receipted!=undefined ? filterValue.receipted : "0" }
      )(
        <Select initialValue={"0"} placeholder={placeholderChooseLocale(checkReceiptBillLocale.isReceipted)}>
          <Select.Option value={"1"} key={"1"}>是</Select.Option>
          <Select.Option value={"0"} key={"0"}>否</Select.Option>
        </Select>
      )
      }
      </SFormItem>
    );

    if (toggle) {
      cols.push(
        <SFormItem key="driverCodeName" label={checkReceiptBillLocale.driver}>
            {
                getFieldDecorator('driverCodeName', {
                    initialValue: filterValue.driverCodeName ? filterValue.driverCodeName : undefined
                })(
                    <UserSelect single={true} placeholder={placeholderChooseLocale(checkReceiptBillLocale.driver)} />)
            }
        </SFormItem>
      );

      cols.push(
        <SFormItem key="storeCodeName" label={commonLocale.inStoreLocale}>
          {getFieldDecorator('storeCodeName', {
              initialValue: filterValue.storeCodeName ? filterValue.storeCodeName : undefined
          })(
              <OrgSelect upperUuid={loginCompany().uuid} placeholder={placeholderChooseLocale(commonLocale.inStoreLocale)} type={'STORE'}/>
          )}
        </SFormItem>
      )
    }
    return cols;
  }
}
