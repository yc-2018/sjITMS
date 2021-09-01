import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import { loginCompany } from '@/utils/LoginContext';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import { pickUpBillLocale } from './PickUpBillLocale';

@connect(({ pickup, loading }) => ({
  pickup,
  loading: loading.models.pickup,
}))
@Form.create()
export default class PickUpBillElectronicLabelForm extends SearchForm {
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
   * 绘制列
   */
  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    let cols = [];

    cols.push(
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="waveBillNumber" label={pickUpBillLocale.waveBillNumber}>
        {getFieldDecorator('waveBillNumber', {
          initialValue: filterValue.waveBillNumber
        })(
          <Input placeholder={placeholderLocale(pickUpBillLocale.waveBillNumber)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="pickArea" label={pickUpBillLocale.pickarea}>
        {getFieldDecorator('pickArea')(
          <PickareaSelect multiple placeholder={placeholderChooseLocale(pickUpBillLocale.pickarea)} />
        )
        }
      </SFormItem>
    );
    return cols;
  }
}