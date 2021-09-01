import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { pickareaStorageConfigLocale } from './PickareaStorageConfigLocale';
import SFormItem from '@/pages/Component/Form/SFormItem';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

const FormItem = Form.Item;

@Form.create()
export default class PickareaStorageConfigSearchForm extends ConfigSearchForm {

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
      <SFormItem label={pickareaStorageConfigLocale.pickareaStorageConfigPickarea}>
        {getFieldDecorator('pickareaCodeName', {
          initialValue: filterValue.pickareaCodeName
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>
    ];
  }
}
