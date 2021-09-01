import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select, DatePicker } from 'antd';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { wrhCloseState, getStateCaption } from './WrhCloseBillState';
import { wrhCloseType, getTypeCaption } from './WrhCloseBillType';

const Option = Select.Option;

@Form.create()
export default class WrhCloseBillSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
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

    let cols = [
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', { initialValue: filterValue.billNumber })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>,
      <SFormItem key="type" label='单据类型'>
        {getFieldDecorator('type', { initialValue: filterValue.type ? filterValue.type : '' })(
          <Select
            placeholder={placeholderChooseLocale('单据类型')}
            style={{ width: '100%' }}
          >
            <Option key="all" value=''>全部</Option>
            <Option value={wrhCloseType.CLOSE.name}>{wrhCloseType.CLOSE.caption}</Option>
            <Option value={wrhCloseType.UNCLOSE.name}>{wrhCloseType.UNCLOSE.caption}</Option>
          </Select>
        )}
      </SFormItem>,
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state', { initialValue: filterValue.state ? filterValue.state : '' })(
          <Select
            placeholder={placeholderChooseLocale(commonLocale.stateLocale)}
            style={{ width: '100%' }}
          >
            <Option key="all" value=''>全部</Option>
            <Option value={wrhCloseState.SAVED.name}>{wrhCloseState.SAVED.caption}</Option>
            <Option value={wrhCloseState.AUDITED.name}>{wrhCloseState.AUDITED.caption}</Option>
          </Select>
        )}
      </SFormItem>
    ];

    if (toggle) {
      cols.push(
        <SFormItem key="closer" label='封仓人'>
          {getFieldDecorator('closer', { initialValue: filterValue.closer })(
            <UserSelect single hasAll placeholder={placeholderChooseLocale('封仓人')} />)}
        </SFormItem>
      );

      cols.push(
        <SFormItem key="binCodes" label={commonLocale.bincodeLocale}>
          {getFieldDecorator('binCodes', {
            initialValue: filterValue.binCodes
          })(
            <Input placeholder={placeholderLocale(commonLocale.bincodeLocale)} />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
