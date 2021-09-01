import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormForClose from '@/pages/Component/Form/SFormForClose';
import { Form, Input } from 'antd';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
// import { binUsage } from '@/utils/BinUsage';
import CloseBinUsageSelect from '@/pages/Component/Select/CloseBinUsageSelect';
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
      <SFormItem key="binCode" label={commonLocale.inBinCodeLocale}>
        {getFieldDecorator('binCode', {
          initialValue: fieldsValue.binCode
        })(
          <Input placeholder={placeholderLocale(commonLocale.inBinCodeLocale)} />
        )}
      </SFormItem>,
      <SFormItem key="binUsage" label={commonLocale.inBinUsageLocale}>
        {getFieldDecorator('binUsage', {
          initialValue: fieldsValue.binUsage ? fieldsValue.binUsage:''
        })(
          <CloseBinUsageSelect />
        )}
      </SFormItem>
    ];
    return cols;
  }
}
