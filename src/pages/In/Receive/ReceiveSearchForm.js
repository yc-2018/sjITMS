import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select, DatePicker } from 'antd';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import { State, Method, Type } from './ReceiveContants';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { receiveLocale } from './ReceiveLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import moment from 'moment';
import {orgType} from '@/utils/OrgType';
const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

const logisticModeOptions = [];
logisticModeOptions.push(<Option key='ModeAll' value=''>{commonLocale.allLocale}</Option>)
Object.keys(LogisticMode).forEach(function (key) {
  logisticModeOptions.push(<Option key={LogisticMode[key].name} value={LogisticMode[key].name}>{LogisticMode[key].caption}</Option>);
});

const methodOptions = [];
methodOptions.push(<Option key='methodAll' value=''>{commonLocale.allLocale}</Option>)
Object.keys(Method).forEach(function (key) {
  methodOptions.push(<Option key={Method[key].name} value={Method[key].name}>{Method[key].caption}</Option>);
});

const typeOptions = [];
typeOptions.push(<Option key='typeAll' value=''>{commonLocale.allLocale}</Option>)
Object.keys(Type).forEach(function (key) {
  typeOptions.push(<Option key={Type[key].name} value={Type[key].name}>{Type[key].caption}</Option>);
});
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
    let cols = [];
    let uploadDateInitial = filterValue.uploadDate && filterValue.uploadDate.length == 2 ?
      [moment(filterValue.uploadDate[0]), moment(filterValue.uploadDate[1])] : null;
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
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state', { initialValue: filterValue.state ? filterValue.state : '' })(
          <Select>{stateOptions}</Select>)}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="orderBillNumber" label={'订单号'}>
        {getFieldDecorator('orderBillNumber', {
          initialValue: filterValue.orderBillNumber
        })(
          <Input placeholder={placeholderLocale(commonLocale.inOrderBillNumberLocale)} />
        )}
      </SFormItem>
    );
    if (toggle) {
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
      loginOrg().type!=orgType.vendor.name && cols.push(
        <SFormItem key="vendor" label={commonLocale.inVendorLocale}>
          {getFieldDecorator('vendor', { initialValue: filterValue.vendor })(
            <OrgSelect
              placeholder={placeholderLocale(commonLocale.inVendorLocale + commonLocale.codeLocale)}
              upperUuid={loginCompany().uuid}
              type={orgType.vendor.name}
              single
            />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="logisticMode" label={commonLocale.inlogisticModeLocale}>
          {getFieldDecorator('logisticMode', { initialValue: filterValue.logisticMode ? filterValue.logisticMode : '' })(
            <Select>{logisticModeOptions}</Select>)}
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
        <SFormItem key="receiver" label={receiveLocale.receiver}>
          {getFieldDecorator('receiver', {
            initialValue: filterValue.receiver
          })(
            <UserSelect single placeholder={placeholderLocale(receiveLocale.receiver + commonLocale.codeLocale)} />)}
        </SFormItem>,
      );
      cols.push(
        <SFormItem key="type" label={receiveLocale.type}>
          {getFieldDecorator('type', { initialValue: filterValue.type ? filterValue.type : '' })(
            <Select>{typeOptions}</Select>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="containerBarcode" label={commonLocale.inContainerBarcodeLocale}>
          {getFieldDecorator('containerBarcode', {
            initialValue: filterValue.containerBarcode
          })(
            <Input placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="method" label={receiveLocale.method}>
          {getFieldDecorator('method', { initialValue: filterValue.method ? filterValue.method : '' })(
            <Select>{methodOptions}</Select>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="uploadDate" label={commonLocale.inUploadDateLocale}>
          {getFieldDecorator('uploadDate', {
            initialValue: uploadDateInitial
          })(
            <RangePicker />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
