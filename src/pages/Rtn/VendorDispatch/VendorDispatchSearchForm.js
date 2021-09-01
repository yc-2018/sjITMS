import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { vendorDispatchLocal } from './VendorDispatchLocale';
import { STATE } from './VendorDispatchContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(STATE).forEach(function(key) {
  stateOptions.push(<Option value={STATE[key].name} key={STATE[key].name}>{STATE[key].caption}</Option>);
});
@Form.create()
export default class VendorDispatchSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
    };
  }

  onReset = () => {
    this.props.form.resetFields();
    this.props.refresh();
  };

  onSearch = (data) => {
    this.props.refresh(data);
  };

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;
    let cols = [];
    cols.push(
      <SFormItem key="vendorCode" label={vendorDispatchLocal.code}>
        {getFieldDecorator('vendorCode', {
          initialValue: filterValue.vendorCode,
        })(
          <Input placeholder={placeholderLocale(vendorDispatchLocal.vendorCode)} />,
        )}
      </SFormItem>,
    );
    cols.push(
      <SFormItem key="vendorName" label={vendorDispatchLocal.name}>
        {getFieldDecorator('vendorName',
          { initialValue: filterValue.vendorName })(
          <Input placeholder={placeholderLocale(vendorDispatchLocal.vendorName)} />,
        )}
      </SFormItem>,
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          { initialValue: filterValue.state ? filterValue.state : '' })(
          <Select>{stateOptions}</Select>,
        )}
      </SFormItem>,
    );

    if (this.state.toggle) {
      cols.push(
        <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
          {
            getFieldDecorator('owner', {
              initialValue: filterValue.owner ? filterValue.owner : '',
            })(
              <OwnerSelect hasAll
                           placeholder={placeholderLocale(commonLocale.ownerLocale)} />)
          }
        </SFormItem>,
      );
    }

    return cols;
  };
}
