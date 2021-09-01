import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { putAwayTransferLocale } from './PutAwayTransferLocale';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { pickareaStorageConfigLocale } from '@/pages/Facility/Config/PickareaStorage/PickareaStorageConfigLocale';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

const FormItem = Form.Item;

@Form.create()
export default class PutAwayTransferConfigSearchForm extends ConfigSearchForm {

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
      <SFormItem label={putAwayTransferLocale.binCode}>
        {getFieldDecorator('binCode', {
          initialValue: filterValue.binCode
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
        )}
      </SFormItem>
    ];
  }
}
