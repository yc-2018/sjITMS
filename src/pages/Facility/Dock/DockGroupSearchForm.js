import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { dockLocale } from './DockLocale';
@Form.create()
export default class DockGroupSearchForm extends SearchForm {
  constructor(props) {
    super(props);
  }
  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;
    let cols = [
      <SFormItem key="codeNameLike" label={'码头集'}>
        {getFieldDecorator('dockGroupCodeNameLike', {
          initialValue: filterValue.dockGroupCodeNameLike
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>,
    ];
    return cols;
  }
}
