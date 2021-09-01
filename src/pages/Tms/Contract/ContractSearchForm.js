import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State, AlcClassify } from './ContractContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { contractLocal } from './ContractLocal';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';


@Form.create()
export default class ContractSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      // toggle: false,
      showLimitDays: false,
    }
  }

  onReset = () => {
    this.props.form.resetFields();
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;
    const { toggle } = this.state;
    let cols = [];
    cols.push(
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)}/>
        )}
      </SFormItem>
    );
    return cols;
  }
}
