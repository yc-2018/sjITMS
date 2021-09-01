import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import CarrierSelect from '@/pages/Component/Select/CarrierSelect';
import { guid } from '@/utils/utils';
import { loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';

@Form.create()
export default class UserSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }

    drawCols = () => {
      const { getFieldDecorator } = this.props.form;
      const { filterValue } = this.props;

      let cols = [
          <SFormItem key="codeName" label={'代码/名称'} labelSpan={'10'}>
              {getFieldDecorator('codeName', {
                  initialValue: filterValue.codeName
              })(
                  <Input placeholder={placeholderLocale('代码/名称')} />
              )}
          </SFormItem>,
          

      ];
      return cols;
    }
}
