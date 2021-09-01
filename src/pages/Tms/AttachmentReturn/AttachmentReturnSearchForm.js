import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { loginCompany } from '@/utils/LoginContext';
import AttachmentSelect from '@/pages/Component/Select/AttachmentSelect';
@Form.create()
export default class AttachmentReturnSearchForm extends SearchForm {

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
      <SFormItem key="store" label={commonLocale.inStoreLocale}>
        {getFieldDecorator('store', {
          initialValue: filterValue.store
        })(
          <OrgSelect
            autoFocus
            showSearch
            placeholder={placeholderLocale(commonLocale.inStoreLocale)}
            upperUuid={loginCompany().uuid}
            type={'STORE'}
          />
        )}
      </SFormItem>,
      <SFormItem key="attachment" label={'附件'}>
        {getFieldDecorator('attachment', {
          initialValue: filterValue.attachment
        })(
           <AttachmentSelect placeholder={placeholderLocale('附件')}/>
        )}
      </SFormItem>,
      <SFormItem key="shipBillNumber" label={'装车单号'}>
        {getFieldDecorator('shipBillNumber', {
          initialValue: filterValue.shipBillNumber
        })(
          <Input placeholder={placeholderLocale('装车单号')}/>
        )}
      </SFormItem>,
		];
	}
}