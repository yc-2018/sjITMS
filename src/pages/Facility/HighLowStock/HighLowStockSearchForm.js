import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import BinTypeSelect from '@/pages/Component/Select/BinTypeSelect';
import { formatMessage } from 'umi/locale';
@Form.create()
export default class HighLowStockSearchForm extends SearchForm {

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
			<SFormItem key="articleName" label={formatMessage({ id: 'highLowStock.article' })}>
				{getFieldDecorator('articleName', {
					initialValue: filterValue.articleName
				})(
					<Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
				)}
			</SFormItem>,
        <SFormItem key="binCode" label={formatMessage({ id: 'highLowStock.binCode' })}>
				{getFieldDecorator('binCode', {
					initialValue: filterValue.binCode
				})(
					<Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
				)}
			</SFormItem>,
			<SFormItem key="binType" label={formatMessage({ id: 'highLowStock.binType' })}>
				{getFieldDecorator('binType', { initialValue:'' })(
					<BinTypeSelect hasAll={true} placeholder={placeholderChooseLocale(formatMessage({ id: 'highLowStock.binType' }))}/>)}
			</SFormItem>
		];
	}
}
