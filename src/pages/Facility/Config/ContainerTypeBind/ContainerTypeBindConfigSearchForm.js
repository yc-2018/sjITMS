import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { containerTypeBindLocale } from './ContainerTypeBindLocale';
import SFormItem from '@/pages/Component/Form/SFormItem';

const FormItem = Form.Item;

@Form.create()
export default class ContainerTypeBindConfigSearchForm extends ConfigSearchForm {

  onReset = () => {
    this.props.reset();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    return [
      <SFormItem label={containerTypeBindLocale.container}>
        {getFieldDecorator('containerTypeCodeAndName', {
          initialValue: filterValue.containerTypeCodeAndName
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>,
      <SFormItem label={containerTypeBindLocale.parentContainer}>
        {getFieldDecorator('parentContainerTypeCodeAndName', {
          initialValue: filterValue.parentContainerTypeCodeAndName
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>,
    ];
  }
}
