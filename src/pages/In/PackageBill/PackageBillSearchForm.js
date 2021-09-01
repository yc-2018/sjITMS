import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { orderLocale } from './PackageBillLocale';
import { State, LogisticMode } from './PackageBillContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import moment from 'moment';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { PRETYPE } from '@/utils/constants';
import {orgType} from '@/utils/OrgType';
const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

@connect(({ packageBill, loading }) => ({
  packageBill,
  loading: loading.models.packageBill,
}))
@Form.create()
export default class PackageBillSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
    }
  }
  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  /**
   * 绘制列
   */
  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    const { toggle } = this.state;
    let cols = [];
    let expireDateInitial = filterValue.expireDate && filterValue.expireDate.length == 2 ? [moment(filterValue.expireDate[0]), moment(filterValue.expireDate[1])] : null;
    let createTimeInitial = filterValue.createTime && filterValue.createTime.length == 2 ? [moment(filterValue.createTime[0]), moment(filterValue.createTime[1])] : null;
    cols.push(
      <SFormItem key="billNumberAndSource" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumberAndSource', {
          initialValue: filterValue.billNumberAndSource ? filterValue.billNumberAndSource : ''
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          {
            initialValue: filterValue.state ? filterValue.state : ''
          }
        )(
          <Select>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
        {
          getFieldDecorator('owner', {
            initialValue: filterValue.owner ? filterValue.owner : '',
          })(
            <OwnerSelect onlyOnline />)
        }
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="customerCodeAndName" label={'客户'}>
          {getFieldDecorator('customerCodeAndName',
            { initialValue: filterValue.customerCodeAndName ? filterValue.customerCodeAndName : '' }
          )(
            <Input placeholder={placeholderLocale('客户')}/>)
          }
        </SFormItem>
      );
    }
    return cols;
  }
}
