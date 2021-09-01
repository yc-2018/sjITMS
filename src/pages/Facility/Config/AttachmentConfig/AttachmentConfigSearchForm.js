import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { attachmentConfigLocale } from './AttachmentConfigLocale';

const FormItem = Form.Item;

@Form.create()
export default class AttachmentConfigSearchForm extends ConfigSearchForm {

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    return [
      <SFormItem label={commonLocale.attachMent}>
        {getFieldDecorator('codeNameLike', {
          initialValue: filterValue.codeNameLike
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>
    ];
  }
}
