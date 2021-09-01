import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { guid } from '@/utils/utils';
import { loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';
import { WorkType } from '@/pages/Account/User/WorkTypeConstants';
const Option = Select.Option;

const driverOptions = [];
driverOptions.push(<Option key="all" value='' > 全部 </Option>);
Object.keys(WorkType).forEach(function (key) {
  driverOptions.push(<Option key={WorkType[key].name} value={WorkType[key].name}>{WorkType[key].caption}</Option>);
});

@Form.create()
export default class DriverSearchForm extends SearchForm {
  constructor(props) {
    super(props);
  }

  onReset = () => {
    this.props.refresh('reset');
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;

    let cols = [
      <SFormItem key="memberCodeName" label={'代码/名称'} md={8}>
        {getFieldDecorator('memberCodeName', {
          initialValue: filterValue && filterValue.memberCodeName ? filterValue.memberCodeName : ''
        })(
          <Input placeholder={placeholderLocale('代码/名称')} />
        )}
      </SFormItem>,
      <SFormItem key="memberType" label={'职能'} md={8}>
        {getFieldDecorator('memberType', {
          initialValue: filterValue && filterValue.memberType ? filterValue.memberType : ''
        })(
          <Select>
            {driverOptions}
          </Select>
        )}
      </SFormItem>,
    ];
    return cols;
  }
}
