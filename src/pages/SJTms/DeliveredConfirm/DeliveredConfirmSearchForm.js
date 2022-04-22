import { connect } from 'dva';
import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import ShipPlanBillNumberSelect from './ShipPlanBillNumberSelect';
//import VehicleSelect from '../VehicleDispatching/Utils/VehicleSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { deliveredConfirmLocale } from './DeliveredConfirmLocale';
import { queryScheduleNo } from '@/services/tms/DeliveredConfirm';

@connect(({ deliveredConfirm, loading }) => ({
  deliveredConfirm,
  loading: loading.models.deliveredConfirm,
}))
@Form.create()
export default class DeliveredConfirmSearchForm extends SearchForm {
  constructor(props) {
    super(props);
  }

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  /**
   * 来源单号、车牌号、司机工号查询onChange监听带出排车单号 2021/10/25 by guankongjin
   * @param {*} queryType 
   * @returns 
   */
  onQueryChange = (queryType) => {
    var that = this
    return (event) => {
      let payload = {
        page: 0,
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dispatchCenterUuid: loginOrg().uuid,
          [queryType]: queryType == 'driverCode' ? JSON.parse(event).code : event.target.value
        }
      }
      this.props.dispatch({
        type: 'deliveredConfirm/queryScheduleNo',
        payload,
        callback: response => {
          if (response && response.success && response.data) {
            that.props.form.setFieldsValue({
              shipPlanNumber: response.data[0]
            })
          }
        }
      });
    }
  }

  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    let cols = [];
    cols.push(
      <SFormItem key='shipPlanNumber' label={deliveredConfirmLocale.shipPlanNumber}>
        {getFieldDecorator('shipPlanNumber',
        { 
          initialValue: filterValue.shipPlanNumber ? filterValue.shipPlanNumber : undefined,
          rules: [
            { required: true, message: notNullLocale(deliveredConfirmLocale.shipPlanNumber) }
          ]
        }
      )(
        <ShipPlanBillNumberSelect 
          vehicleStr={this.props.form.getFieldValue('vehicle')?this.props.form.getFieldValue('vehicle'):null} 
          driverCodeName={this.props.form.getFieldValue('driver')?JSON.parse(this.props.form.getFieldValue('driver')).name:null}
        />
      )
      }
      </SFormItem>
    );

    cols.push(
      <SFormItem key="sourceBillNumber" label={deliveredConfirmLocale.sourceNum}>
        {getFieldDecorator('sourceBillNumber', {
          initialValue: filterValue.sourceBillNumber ? filterValue.sourceBillNumber : ''
        })(
          <Input placeholder={placeholderLocale(deliveredConfirmLocale.sourceNum)} onChange={this.onQueryChange('sourceBillNumber')} />
        )}
      </SFormItem>
    );
    
    cols.push(
      <SFormItem key="plateNumber" label={deliveredConfirmLocale.vehicle}>
        {getFieldDecorator('plateNumber',
          { initialValue: filterValue.vehicle ? filterValue.vehicle : undefined }
        )(
          <Input placeholder={placeholderLocale(deliveredConfirmLocale.vehicle)} onChange={this.onQueryChange('plateNumber')} />)
        }
      </SFormItem>
    );

    cols.push(
      <SFormItem key="driverCode" label={deliveredConfirmLocale.driver}>
        {getFieldDecorator('driverCode',
          { initialValue: filterValue.driver ? filterValue.driver : undefined }
        )(
          <UserSelect single hasAll placeholder={placeholderChooseLocale(deliveredConfirmLocale.driver)}
            onChange={this.onQueryChange('driverCode')} />)}
      </SFormItem>
    );

    return cols;
  }
}