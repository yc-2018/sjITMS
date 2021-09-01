import { Form, Input } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { orgType } from '@/utils/OrgType';
@Form.create()
export default class SearchFormItemBatchAdd extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {

    }
  }
  onReset = () => {
    this.props.form.resetFields();
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { fieldsValue } = this.props;
    const { toggle } = this.state;
    let cols = [
      <SFormItem key="billNumberAndSource" label={commonLocale.orderBillNumberLocal}>
        {getFieldDecorator('billNumberAndSource', {
          initialValue: fieldsValue.billNumberAndSource
        })(
          <Input placeholder={placeholderLocale(commonLocale.orderBillNumberLocal)} />
        )}
      </SFormItem>,
      <SFormItem key="vendor" label={commonLocale.inVendorLocale}>
        {getFieldDecorator('vendor',
          { initialValue: fieldsValue.vendor ? fieldsValue.vendor : undefined }
        )(
          <OrgSelect
            upperUuid={loginCompany().uuid}
            state={STATE.ONLINE}
            type={orgType.vendor.name}
            single
            placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
          />)
        }
      </SFormItem>,
      <SFormItem key="bookBillNumber" label={'预约单号'}>
        {getFieldDecorator('bookBillNumber', {
          initialValue: fieldsValue.bookBillNumber
        })(
          <Input placeholder={placeholderLocale('预约单号')} />
        )}
      </SFormItem>
    ];
    return cols;
  }
}
