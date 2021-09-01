import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import SFormItem from '../SFormItem';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '../SearchForm';
import { vehicleDispatchingLocale } from '../../VehicleDispatching/VehicleDispatchingLocale';
import VendorSelect from '@/pages/Component/Select/VendorSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { STATE } from '@/utils/constants';
import { orgType } from '@/utils/OrgType';
import TeamSelect from '@/pages/Component/Select/TeamSelect';
import StoreSelect from '@/pages/Component/Select/StoreSelect';
const { RangePicker } = DatePicker;

@connect(({ order, loading }) => ({
  order,
  loading: loading.models.order,
}))
@Form.create()
export default class OrderSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showColCount:3
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
    let dateInitial = filterValue.date && filterValue.date.length == 2 ?
    [moment(filterValue.date[0]), moment(filterValue.date[1])] : null;
    cols.push(
      <SFormItem key="billNumber" label={'订单单号'}>
          {getFieldDecorator('billNumber', {
            initialValue: filterValue.billNumber ? filterValue.billNumber : ''
          })(
            <Input placeholder={placeholderLocale('订单单号')} />
          )}
        </SFormItem>
    );
    cols.push(
      <SFormItem key="classGroup" label={'班组'}>
        {getFieldDecorator('classGroup', {
          initialValue: filterValue.classGroup ? filterValue.classGroup : undefined
        })(
          <TeamSelect placeholder={placeholderLocale('班组')}/>
        )}
      </SFormItem>
    );
   
    if (toggle) {
      cols.push(
        <SFormItem key="selfhandover" label={'是否自提'}>
          {getFieldDecorator('selfhandover', {
            initialValue: filterValue.selfhandover ? filterValue.selfhandover : ''
          })(
            // <Input placeholder={placeholderLocale('是否自提')} />
            <Select>
              <Select.Option key="" value={''}>全部</Select.Option>
              <Select.Option key="1" value={"1"}>是</Select.Option>
              <Select.Option key="0" value={'0'}>否</Select.Option>
            </Select>
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="store" label={commonLocale.inStoreLocale}>
          {getFieldDecorator('store', {
            initialValue: filterValue.store ? filterValue.store : undefined
          })(
            <OrgSelect
              placeholder={placeholderLocale(commonLocale.codeLocale)}
              upperUuid={loginCompany().uuid}
              type={orgType.store.name}
              placeholder={placeholderLocale(commonLocale.inStoreLocale)}
              single
            />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="date" label={'下单日期'}>
          {getFieldDecorator('date', { initialValue: dateInitial })(
            <RangePicker style={{ width: '260%' }} />)}
        </SFormItem>
      );
      cols.push(
        <br/>
      );
    }
    return cols;
  }
}
