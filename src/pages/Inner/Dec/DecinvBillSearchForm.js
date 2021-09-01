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
import { decinvBillState, getStateCaption } from './DecinvBillState';
import { decLocale } from './DecInvBillLocale';
import moment from 'moment';
const { RangePicker } = DatePicker;
const Option = Select.Option;

@Form.create()
export default class ReceiveSearchForm extends SearchForm {
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
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>,
      <SFormItem key="wrh" label={commonLocale.inWrhLocale}>
        {getFieldDecorator('wrh', { initialValue: filterValue.wrh ? filterValue.wrh : '' })(
          <WrhSelect hasAll />)}
      </SFormItem>,
      <SFormItem key="decer" label={decLocale.decer}>
        {getFieldDecorator('decer', { initialValue: filterValue.decer })(
          <UserSelect single placeholder={placeholderChooseLocale(decLocale.decer)} />)}
      </SFormItem>
    ];

    if (toggle) {
      cols.push(
        <SFormItem key="state" label={commonLocale.stateLocale}>
          {getFieldDecorator('state', { initialValue: filterValue.state ? filterValue.state : '' })(
            <Select
              placeholder={placeholderChooseLocale(commonLocale.stateLocale)}
              style={{ width: '100%' }}
            >
              <Option key="all" value=''>全部</Option>
              <Option value={decinvBillState.SAVED.name}>{decinvBillState.SAVED.caption}</Option>
              <Option value={decinvBillState.AUDITED.name}>{decinvBillState.AUDITED.caption}</Option>
            </Select>
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
          {getFieldDecorator('owner', { initialValue: filterValue.owner ? filterValue.owner : '' })(
            <OwnerSelect onlyOnline />)}
        </SFormItem>
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
        <SFormItem key="binCode" label={commonLocale.bincodeLocale}>
          {getFieldDecorator('binCode', {
            initialValue: filterValue.binCode
          })(
            <Input placeholder={placeholderLocale(decLocale.includeBin)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="containerBarcodes" label={commonLocale.containerLocale}>
          {getFieldDecorator('containerBarcodes', {
            initialValue: filterValue.containerBarcodes
          })(
            <Input placeholder={placeholderLocale(decLocale.includeContainer)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="uploadDate" label={commonLocale.inUploadDateLocale}>
          {getFieldDecorator('uploadDate', {
            initialValue: filterValue.uploadDateInitial
          })(
            <RangePicker style={{ width: '100%' }} />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
