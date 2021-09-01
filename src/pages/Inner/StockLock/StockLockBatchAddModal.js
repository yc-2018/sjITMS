import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
@Form.create()
export default class RegistrationForm extends SearchForm {
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
  handleFieldChange= (data) => {
    this.props.change(data)
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { fieldsValue } = this.props;
    const { toggle } = this.state;
    let cols = [
      <SFormItem key="binCodeLike" label={commonLocale.bincodeLocale}>
        {getFieldDecorator('binCodeLike', {
          initialValue: fieldsValue.bincodeLocale
        })(
          <Input placeholder={placeholderLocale(commonLocale.bincodeLocale)} />
        )}
      </SFormItem>,
      <SFormItem key="articleCodeOrNameLike" label={commonLocale.articleLocale}>
        {getFieldDecorator('articleCodeOrNameLike', {
          initialValue: fieldsValue.articleCodeOrNameLike
        })(
          <Input placeholder={placeholderLocale(commonLocale.articleLocale)} />
        )}
      </SFormItem>,
    ];
    return cols;
  }
}
