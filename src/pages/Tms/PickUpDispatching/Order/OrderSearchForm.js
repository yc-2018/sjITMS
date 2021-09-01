import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import SFormItem from '@/pages/Tms/BillDispatching/SFormItem';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Tms/BillDispatching/SearchForm';
import { vehicleDispatchingLocale } from '../../VehicleDispatching/VehicleDispatchingLocale';
import VendorSelect from '@/pages/Component/Select/VendorSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { STATE } from '@/utils/constants';
import { orgType } from '@/utils/OrgType';

@connect(({ order, loading }) => ({
  order,
  loading: loading.models.order,
}))
@Form.create()
export default class OrderSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      // showColCount:3
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
      <SFormItem key="sourceNum" label={'客户单号'}>
          {getFieldDecorator('sourceNum', {
            initialValue: filterValue.sourceNum ? filterValue.sourceNum : ''
          })(
            <Input placeholder={placeholderLocale('客户单号')} />
          )}
        </SFormItem>
    );
    cols.push(
      <SFormItem key="vendor" label={'供应商'}>
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
   
    if (toggle) {
      cols.push(
        <SFormItem key="deliveryPointAddress" label={'卸货点'}>
          {getFieldDecorator('deliveryPointAddress', {
            initialValue: filterValue.deliveryPointAddress ? filterValue.deliveryPointAddress : ''
          })(
            <Input placeholder={placeholderLocale('卸货点')} />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
