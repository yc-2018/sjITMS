import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select,Col } from 'antd';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { categoryStorageConfigLocale } from './CategoryStorageConfigLocale';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';
const FormItem = Form.Item;
@Form.create()
export default class CarrierSearchForm extends ConfigSearchForm {

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
      <SFormItem label={commonLocale.articleCategory}>
        {getFieldDecorator('categoryCodeName', {
          initialValue: filterValue.categoryCodeName
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>
    ];
	}
}
