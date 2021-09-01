import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

@Form.create()
export default class VendorSearchForm extends SearchForm {
  constructor(props) {
    super(props);
  }
  onSearch = (data) => {
    data.owner = data.owner ? JSON.parse(data.owner) : undefined;
    data.ownerUuid = data.owner ? data.owner.uuid : undefined;
    this.props.refresh(data);
  }
  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    let cols = [
      <SFormItem key="codeName" label={'供应商'}>
        {getFieldDecorator('codeName', {
          initialValue: filterValue.codeName
        })(
          <Input placeholder={placeholderLocale('供应商')} />
        )}
      </SFormItem>,
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          { initialValue: filterValue.state }
        )(
          <BasicStateSelect />)
        }
      </SFormItem>,
        <SFormItem key="ownerUuid" label={commonLocale.inOwnerLocale}>
          {
            getFieldDecorator('owner', {
              initialValue: filterValue.owner ? JSON.stringify(filterValue.owner) : '',
            })(
              <OwnerSelect onlyOnline />)
          }
        </SFormItem>
    ];
    return cols;
  }
}
