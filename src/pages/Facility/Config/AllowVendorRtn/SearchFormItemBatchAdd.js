import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

@Form.create()
export default class BatchSearchForm extends SearchForm {
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
      <SFormItem key="codeName" label={commonLocale.inVendorLocale}>
        {getFieldDecorator('codeName', {
          initialValue: fieldsValue.vendorCode
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
        )}
      </SFormItem>
    ];
    return cols;
  }
}