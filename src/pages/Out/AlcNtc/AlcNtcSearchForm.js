import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select, DatePicker, Tooltip, Icon } from 'antd';
import StoreGroupSelect from './StoreGroupSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import TypeSelect from './TypeSelect';
import { State, ShipState } from './AlcNtcContants';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { alcNtcLocale } from './AlcNtcLocale';
import {orgType} from '@/utils/OrgType';
import moment from 'moment';
const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});

const logisticModeOptions = [];
logisticModeOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>)
Object.keys(LogisticMode).forEach(function (key) {
  logisticModeOptions.push(<Option value={LogisticMode[key].name} key={LogisticMode[key].name}>{LogisticMode[key].caption}</Option>);
});

const shipStateOptions = [];
shipStateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>)
Object.keys(ShipState).forEach(function (key) {
  shipStateOptions.push(<Option value={ShipState[key].name} key={ShipState[key].name}>{ShipState[key].caption}</Option>);
});
@Form.create()
export default class AlcNtcSearchForm extends SearchForm {
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
    let groupStoresValue = [];
    if(filterValue && filterValue.groupStores) {
      groupStoresValue = filterValue.groupStores.split(',');
    }
    let stateValue = [];
    if(filterValue && filterValue.states) {
      stateValue = filterValue.states.split(',');
    }
    let expireDateInitial = filterValue.expireDate && filterValue.expireDate.length == 2 ?
      [moment(filterValue.expireDate[0]), moment(filterValue.expireDate[1])] : null;
    let pickUploadDate = filterValue.pickUploadDate && filterValue.pickUploadDate.length == 2 ?
      [moment(filterValue.pickUploadDate[0]), moment(filterValue.pickUploadDate[1])] : null;
    let shipUploadDateInitial = filterValue.shipUploadDate && filterValue.shipUploadDate.length == 2 ?
      [moment(filterValue.shipUploadDate[0]), moment(filterValue.shipUploadDate[1])] : null;
    let alcDateInitial = filterValue.alcDate && filterValue.alcDate.length == 2 ?
      [moment(filterValue.alcDate[0]), moment(filterValue.alcDate[1])] : null;
    let cols = [];
    cols.push(
      <SFormItem key="billNumber" label={`${commonLocale.billNumberLocal}`}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber
        })(
          <Input placeholder={placeholderLocale(`${commonLocale.billNumberLocal}`)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="states" label={commonLocale.stateLocale}>
        {getFieldDecorator('states', { initialValue: filterValue.states ? stateValue : [] })(
          <Select mode={'multiple'}>{stateOptions}</Select>)}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="expireDate" label={commonLocale.validDateLocale}>
        {getFieldDecorator('expireDate', {
          initialValue: expireDateInitial
        })(
          <RangePicker style={{ width: '100%' }} />
        )}
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        loginOrg().type==orgType.store.name ? 
        <SFormItem key="dc" label={commonLocale.inDCLocale}>
          {getFieldDecorator('dc', { initialValue: filterValue.dc})(
            <OrgSelect
              placeholder={placeholderLocale(commonLocale.codeLocale)}
              upperUuid={loginCompany().uuid}
              type={orgType.dc.name}
              single
            />)}
        </SFormItem>
        :
        <SFormItem key="store" label={commonLocale.inStoreLocale}>
          {getFieldDecorator('store', { initialValue: filterValue.store})(
            <OrgSelect
              placeholder={placeholderLocale(commonLocale.codeLocale)}
              upperUuid={loginCompany().uuid}
              type={orgType.store.name}
              single
            />)}
        </SFormItem> 
      );
      cols.push(
        <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
          {getFieldDecorator('owner', { initialValue: filterValue.owner ? filterValue.owner : '' })(
            <OwnerSelect onlyOnline />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="pickUploadDate" label={alcNtcLocale.pickUploadDate}>
          {getFieldDecorator('pickUploadDate', { initialValue: filterValue.pickUploadDateInitial })(
            <RangePicker style={{ width: '100%' }} />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="wrh" label={commonLocale.inWrhLocale}>
          {getFieldDecorator('wrh', { initialValue: filterValue.wrh ? filterValue.wrh : '' })(
            <WrhSelect hasAll onlyCompanyParam={loginOrg().type==orgType.store.name ? true : false} />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="logisticMode" label={commonLocale.inlogisticModeLocale}>
          {getFieldDecorator('logisticMode', { initialValue: filterValue.logisticMode ? filterValue.logisticMode : '' })(
            <Select>{logisticModeOptions}</Select>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="shipUploadDate" label={alcNtcLocale.shipUploadDate}>
          {getFieldDecorator('shipUploadDate', { initialValue: shipUploadDateInitial })(
            <RangePicker style={{ width: '100%' }} />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="articleCodes" label={commonLocale.inArticleLocale}
        >
          {getFieldDecorator('articleCodes', {
            initialValue: filterValue.articleCodes
          })(
            <Input placeholder={placeholderLocale(commonLocale.inArticleCodesLocale)}
            />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="shipState" label={alcNtcLocale.shipState}>
          {getFieldDecorator('shipState', { initialValue: filterValue.shipState ? filterValue.shipState : '' })(
            <Select>{shipStateOptions}</Select>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="alcDate" label={alcNtcLocale.alcDate}>
          {getFieldDecorator('alcDate', { initialValue: alcDateInitial })(
            <RangePicker style={{ width: '100%' }} />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="orderBillNumber" label={commonLocale.orderBillNumberLocal}>
          {getFieldDecorator('orderBillNumber', {
            initialValue: filterValue.orderBillNumber
          })(
            <Input placeholder={placeholderLocale(commonLocale.orderBillNumberLocal)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="waveBillNumber" label={commonLocale.waveLocal}
        >
          {getFieldDecorator('waveBillNumber', {
            initialValue: filterValue.waveBillNumber
          })(
            <Input placeholder={placeholderLocale(commonLocale.waveLocal)}
            />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="groupStores" label={'门店组'}>
          {getFieldDecorator('groupStores', { initialValue: filterValue.groupStores ? groupStoresValue : []})(
            <StoreGroupSelect
              onChange={this.onChange}
              placeholder={placeholderLocale(commonLocale.codeLocale)}
              multiple
            />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="groupName" label={alcNtcLocale.groupName}
        >
          {getFieldDecorator('groupName', {
            initialValue: filterValue.groupName
          })(
            <Input placeholder={placeholderLocale(alcNtcLocale.groupName)}
            />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="type" label={'配单类型'}
        >
          {getFieldDecorator('type', {
            initialValue: ''
          })(
            <TypeSelect
              placeholder={placeholderLocale('配单类型')}
              hasAll
            />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
