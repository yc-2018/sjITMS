import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

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
      <SFormItem key="codeName" label={commonLocale.inArticleLocale}>
        {getFieldDecorator('codeName', {
          initialValue: fieldsValue.codeName
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)}
          style={{ width: '100%' }}/>
        )}
      </SFormItem>,
    ];
    return cols;
  }
}
