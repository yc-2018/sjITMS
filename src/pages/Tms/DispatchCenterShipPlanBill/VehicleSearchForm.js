import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import CarrierSelect from '@/pages/Component/Select/CarrierSelect';
import { guid } from '@/utils/utils';
import { loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { WorkType } from '@/pages/Account/User/WorkTypeConstants';
const Option = Select.Option;

@Form.create()
export default class DriverSearchForm extends SearchForm {
  constructor(props) {
    super(props);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    let cols = [
      <SFormItem key="codeOrPlate" label={'代码/车牌'} md={8}>
        {getFieldDecorator('codeOrPlate', {
          initialValue: filterValue.codeOrPlate ? filterValue.codeOrPlate : ''
        })(
          <Input placeholder={placeholderLocale('代码/车牌')} />
        )}
      </SFormItem>
    ];
    return cols;
  }
}
