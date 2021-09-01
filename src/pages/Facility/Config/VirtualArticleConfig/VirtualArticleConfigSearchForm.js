import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select,Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { packageVirtualArticleConfigLocale } from './VirtualArticleConfigLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';

const FormItem = Form.Item;

@Form.create()
export default class VirtualArticleConfigSearchForm extends ConfigSearchForm {

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
      <SFormItem label={packageVirtualArticleConfigLocale.owner}>
        {getFieldDecorator('owner', {
          initialValue: filterValue.owner ? filterValue.owner : '',
        })(
          <OwnerSelect hasAll />
        )}
      </SFormItem>,
    ];
  }
}
