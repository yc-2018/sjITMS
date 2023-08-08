/*
 * @Author: Liaorongchang
 * @Date: 2023-07-18 14:30:35
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-07-21 09:23:57
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, DatePicker, Select } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { getApplicationSelect } from '@/services/cost/ApplicationForm';
import moment from 'moment';

const { MonthPicker } = DatePicker;

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class ApplicationFormCreatePage extends QuickCreatePage {
  state = {
    ...this.state,
    applicantSelect: [],
  };

  monthSelectComponent = props => {
    const monthFormat = 'YYYY-MM';
    return (
      <MonthPicker {...props} defaultValue={moment('2023-07', monthFormat)} format={monthFormat} />
    );
  };

  applicantSelectComponent = props => {
    const { applicantSelect } = this.state;
    console.log("applicantSelect",applicantSelect);
    return (
      <Select {...props} showSearch allowClear>
        {applicantSelect.map(item => {
          return <Option value={item}>{item}</Option>;
        })}
      </Select>
    );
  };

  getApplicationSelect = async () => {
    const { MONTH, PLANUUID } = this.entity.cost_application_form[0];
    const response = await getApplicationSelect(PLANUUID, MONTH);
    if (response.success && response.data) {
      this.setState({ applicantSelect: response.data });
    } else {
      this.setState({ applicantSelect: [] });
    }
  };

  formLoaded = () => {
    const { formItems, tableItems } = this.state;
    formItems.cost_application_form_MONTH.component = this.monthSelectComponent;
    tableItems.cost_application_form_dtl_APPLICANT.component = this.applicantSelectComponent;
  };

  exHandleChange = e => {
    const { tableItems } = this.state;

    if (
      e.fieldName == 'PLANUUID' &&
      e.valueEvent.value != undefined &&
      this.entity.cost_application_form[0].MONTH != undefined
    ) {
      this.getApplicationSelect();
    } else if (
      e.fieldName == 'MONTH' &&
      e.valueEvent.format('yyyy-MM') != undefined &&
      this.entity.cost_application_form[0].PLANUUID != undefined
    ) {
      this.getApplicationSelect();
    }
  };
}
