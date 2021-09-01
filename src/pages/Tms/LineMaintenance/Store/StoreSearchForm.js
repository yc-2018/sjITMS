import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '../SearchForm';
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
export default class StoreSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
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
    let cols = [];
    cols.push(
      <SFormItem key="codeName1" label={'门店'} md={12}>
        {getFieldDecorator('codeName1', {
          initialValue: filterValue.codeName1 ? filterValue.codeName1 : ''
        })(
          <Input placeholder={placeholderLocale('门店')} />
        )}
      </SFormItem>,
    );
    return cols;
  }
}
