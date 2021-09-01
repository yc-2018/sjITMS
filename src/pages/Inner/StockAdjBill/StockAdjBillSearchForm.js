import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select, DatePicker } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { State, getStateCaption, AdjType, getAdjTypeCaption } from './StockAdjBillContants';
import { stockAdjBillLocale } from './StockAdjBillLocale';
import moment from 'moment';
const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

const typeOptions = [];
typeOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(AdjType).forEach(function (key) {
  typeOptions.push(<Option key={AdjType[key].name} value={AdjType[key].name}>{AdjType[key].caption}</Option>);
});

@Form.create()
export default class StockAdjBillSearchForm extends SearchForm {
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
    let uploadDateInitial = filterValue.uploadDate && filterValue.uploadDate.length == 2 ? [moment(filterValue.uploadDate[0]), moment(filterValue.uploadDate[1])] : null;
    let cols = [
      <SFormItem key="billNumberLike" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumberLike', {
          initialValue: filterValue.billNumberLike
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>,
      <SFormItem key="stateEquals" label={commonLocale.stateLocale}>
        {getFieldDecorator('stateEquals',
          {
            initialValue: filterValue.stateEquals ? filterValue.stateEquals : ' '
          }
        )(
          <Select initialValue=' '>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>,
      <SFormItem key="adjer" label={stockAdjBillLocale.adjer}>
        {getFieldDecorator('adjer', { initialValue: filterValue.adjer })(
          <UserSelect single placeholder={placeholderChooseLocale(stockAdjBillLocale.adjer)} />)}
      </SFormItem>
    ];


    if (toggle == false)
      return cols;

    cols.push(
      <SFormItem key="typeEquals" label={stockAdjBillLocale.adjType}>
        {getFieldDecorator('typeEquals',
          {
            initialValue: filterValue.typeEquals ? filterValue.typeEquals : ' '
          }
        )(
          <Select initialValue=' '>
            {typeOptions}
          </Select>
        )
        }
      </SFormItem>
    );

    cols.push(
      <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
        {getFieldDecorator('owner', { initialValue: filterValue.owner ? filterValue.owner : '' })(
          <OwnerSelect onlyOnline />)}
      </SFormItem>
    );

    cols.push(
      <SFormItem key="wrh" label={commonLocale.inWrhLocale}>
        {getFieldDecorator('wrh', { initialValue: filterValue.wrh ? filterValue.wrh : '' })(
          <WrhSelect hasAll />)}
      </SFormItem>
    );

    return cols;
  }
}
