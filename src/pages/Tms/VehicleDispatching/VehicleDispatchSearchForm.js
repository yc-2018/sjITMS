import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { vehicleDispatchingLocale } from './VehicleDispatchingLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import TeamSelect from '@/pages/Component/Select/TeamSelect';
import ScheduleGroupSelect from '@/pages/Component/Select/ScheduleGroupSelect';

@connect(({ order, loading }) => ({
  order,
  loading: loading.models.order,
}))
@Form.create()
export default class VehicleDispatchSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false
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
    cols.push(
      <SFormItem  key="shipGroupCode" label={'作业组'}>
        {getFieldDecorator('shipGroupCode', {
          initialValue: filterValue.shipGroupCode ? filterValue.shipGroupCode : undefined,
          rules: [
            { required: true, message: notNullLocale('作业组') }
          ],
        })(
          <ScheduleGroupSelect placeholder={placeholderLocale('作业组')}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="classGroup" label={'班组'}>
        {getFieldDecorator('classGroup', {
          initialValue: filterValue.classGroup ? filterValue.classGroup : undefined
        })(
          <TeamSelect placeholder={placeholderLocale('班组')} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="owner" label={commonLocale.ownerLocale}>
        {getFieldDecorator('owner', {
          initialValue: filterValue.owner ? filterValue.owner : ''
        })(
          <OwnerSelect hasAll placeholder={placeholderChooseLocale(commonLocale.ownerLocale)} />
        )}
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="deliveryPointCode" label={'门店代码'}>
          {getFieldDecorator('deliveryPointCode', {
            initialValue: filterValue.deliveryPointCode ? filterValue.deliveryPointCode : ''
          })(
            <Input placeholder={placeholderLocale('门店代码')} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="billNumber" label={'运输单号'}>
          {getFieldDecorator('billNumber', {
            initialValue: filterValue.billNumber ? filterValue.billNumber : ''
          })(
            <Input placeholder={placeholderLocale('运输单号')} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="sourceBillNumber" label={'运输来源单号'}>
          {getFieldDecorator('sourceBillNumber', {
            initialValue: filterValue.sourceBillNumber ? filterValue.sourceBillNumber : ''
          })(
            <Input placeholder={placeholderLocale('运输来源单号')} />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
