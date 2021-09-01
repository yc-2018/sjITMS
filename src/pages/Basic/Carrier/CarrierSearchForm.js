import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
@Form.create()
export default class CarrierSearchForm extends SearchForm {

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
			<SFormItem key="codeName" label={commonLocale.codeAndNameLocale}>
				{getFieldDecorator('codeName', {
					initialValue: filterValue.codeName
				})(
					<Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
				)}
			</SFormItem>,

			<SFormItem key="state" label={commonLocale.stateLocale}>
				{getFieldDecorator('state', { initialValue: filterValue.state })(
					<BasicStateSelect />)}
			</SFormItem>
		];
	}
}