import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

@Form.create()
export default class PickAreaSearchForm extends SearchForm {

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (filter) => {
    this.props.refresh(filter);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const {filterValue}=this.props;
    return [
      <SFormItem key="codeName" label={commonLocale.pickAreNameLocale}>
        {getFieldDecorator('codeName', {
          initialValue: filterValue.codeName
        })(<Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />)}
      </SFormItem>
    ];
  }
}
