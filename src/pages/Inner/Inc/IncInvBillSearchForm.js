import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select, DatePicker } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State } from './IncInvBillContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { incLocale } from './IncInvBillLocale';
import moment from 'moment';
const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});
@Form.create()
export default class IncInvBillSearchForm extends SearchForm {
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
      <SFormItem key="wrh" label={commonLocale.inWrhLocale}>
        {getFieldDecorator('wrh', { initialValue: filterValue.wrh ? filterValue.wrh : ''})(
          <WrhSelect hasAll />)}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state', { initialValue: filterValue.state ? filterValue.state : '' })(
          <Select>{stateOptions}</Select>)}
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
          {
            getFieldDecorator('owner', {
                initialValue: filterValue.owner ? filterValue.owner : ''
              })(
            <OwnerSelect onlyOnline />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="containerBarcodes" label={commonLocale.containerLocale}>
          {getFieldDecorator('containerBarcodes', {
            initialValue: filterValue.containerBarcodes
          })(
            <Input placeholder={placeholderLocale(incLocale.containerBarCodes)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="incer" label={incLocale.incer}>
          {getFieldDecorator('incer', { initialValue: filterValue.incer })(
            <UserSelect single placeholder={placeholderChooseLocale(incLocale.incer)} />)}
        </SFormItem>,
      );
      cols.push(
        <SFormItem key="articleCodes" label={commonLocale.inArticleLocale}>
          {getFieldDecorator('articleCodes', {
            initialValue: filterValue.articleCodes
          })(
            <Input placeholder={placeholderLocale(commonLocale.inArticleCodesLocale)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="binCodes" label={commonLocale.bincodeLocale}>
          {getFieldDecorator('binCodes', {
            initialValue: filterValue.binCodes
          })(
            <Input placeholder={placeholderLocale(incLocale.binCodes)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="uploadDate" label={commonLocale.inUploadDateLocale}>
          {getFieldDecorator('uploadDate', {
            initialValue: uploadDateInitial
          })(
            <RangePicker style={{ width: '100%' }} />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
