import { Input, Select, Form, DatePicker } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { orgType } from '@/utils/OrgType';
import { STATE } from '@/utils/constants';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { state } from './PreviewContants';
import { previewLocale } from './PreviewLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import moment from 'moment';

const { RangePicker } = DatePicker;

const stateOptions = [];
stateOptions.push(<Select.Option key='stateAll' value=''>全部</Select.Option>);
Object.keys(state).forEach(function(key) {
  stateOptions.push(
    <Select.Option key={state[key].name} value={state[key].name}>{state[key].caption}</Select.Option>,
  );
});

@Form.create()
export default class PreviewBillSearchForm extends SearchForm {

  constructor(props) {
    super(props);

    this.state = {
      toggle: false,
      showLimitDays: true,
    };
  }

  onReset = () => {
    this.props.refresh();
  };

  onSearch = (data) => {
    this.props.refresh(data);
  };

  drawCols = () => {
    let cols = [];
    const { toggle } = this.state;
    const { form: { getFieldDecorator }, filterValue } = this.props;
    let uploadDateInitial = filterValue.uploadDate && filterValue.uploadDate.length == 2 ?
      [moment(filterValue.uploadDate[0]), moment(filterValue.uploadDate[1])] : null;

    cols.push(
      <SFormItem key="groupNo" label={'预检组号'}>
        {getFieldDecorator('groupNo', {
          initialValue: filterValue.groupNo ? filterValue.groupNo : '',
        })(
          <Input placeholder={placeholderLocale('预检组号')}/>,
        )}
      </SFormItem>,
    );
    cols.push(
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber ? filterValue.billNumber : '',
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)}/>,
        )}
      </SFormItem>,
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state', {
          initialValue: filterValue.state ? filterValue.state : '',
        })(
          <Select>
            {stateOptions}
          </Select>,
        )}
      </SFormItem>,
    );
    if (toggle) {

      cols.push(
        <SFormItem key="vendor" label={'供应商'}>
          {getFieldDecorator('vendor', {
            initialValue: filterValue.vendor,
          })(
            <OrgSelect
              upperUuid={loginCompany().uuid}
              state={STATE.ONLINE}
              type={orgType.vendor.name}
              single
              placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
            />,
          )}
        </SFormItem>,
      );
      cols.push(
        <SFormItem key="orderBillNumber" label={'订单号'}>
          {getFieldDecorator('orderBillNumber', {
            initialValue: filterValue.orderBillNumber,
          })(
            <Input placeholder={placeholderLocale('订单号')}/>,
          )}
        </SFormItem>,
      );
    }
    return cols;
  };
}
