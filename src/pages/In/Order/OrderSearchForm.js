import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { orderLocale } from './OrderLocale';
import { State, LogisticMode } from './OrderContants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import moment from 'moment';
import PreTypeSelect from '@/pages/Component/Select/PreTypeSelect';
import { PRETYPE } from '@/utils/constants';
import {orgType} from '@/utils/OrgType';
import { getQueryBillDays } from '@/utils/LoginContext';
const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

const logisticModeOptions = [];
logisticModeOptions.push(<Option key='ModeAll' value=''>{commonLocale.allLocale}</Option>)
Object.keys(LogisticMode).forEach(function (key) {
  logisticModeOptions.push(<Option key={LogisticMode[key].name} value={LogisticMode[key].name}>{LogisticMode[key].caption}</Option>);
});

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
      showLimitDays: true
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
    // console.log('form值===============',days)
    let cols = [];
    let expireDateInitial = filterValue.expireDate && filterValue.expireDate.length == 2 ? [moment(filterValue.expireDate[0]), moment(filterValue.expireDate[1])] : null;
    let createTimeInitial = filterValue.createTime && filterValue.createTime.length == 2 ? [moment(filterValue.createTime[0]), moment(filterValue.createTime[1])] : null;
    cols.push(
      <SFormItem key="billNumberAndSource" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumberAndSource', {
          initialValue: filterValue.billNumberAndSource ? filterValue.billNumberAndSource : ''
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="states" label={commonLocale.stateLocale}>
        {getFieldDecorator('states',
          {
            initialValue: filterValue.states ? filterValue.states : []
          }
        )(
          <Select mode={'multiple'}>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>
    );
    loginOrg().type!=orgType.vendor.name && cols.push(
      <SFormItem key="vendor" label={commonLocale.inVendorLocale}>
        {getFieldDecorator('vendor',
          { initialValue: filterValue.vendor ? filterValue.vendor : undefined }
        )(
          <OrgSelect
            upperUuid={loginCompany().uuid}
            state={STATE.ONLINE}
            type={orgType.vendor.name}
            single
            placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
          />)
        }
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
          {
            getFieldDecorator('owner', {
              initialValue: filterValue.owner ? filterValue.owner : '',
            })(
              <OwnerSelect onlyOnline />)
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="wrh" label={orderLocale.wrh}>
          {
            getFieldDecorator('wrh', {
              initialValue: filterValue.wrh ? filterValue.wrh : '',
            })(
              <WrhSelect hasAll />
            )
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="expireDate" label={commonLocale.inValidDateLocale}>
          {getFieldDecorator('expireDate',
            { initialValue: expireDateInitial }
          )(
            <RangePicker />
          )
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="logisticMode" label={commonLocale.inlogisticModeLocale}>
          {getFieldDecorator('logisticMode',
            { initialValue: filterValue.logisticMode ? filterValue.logisticMode : '' }
          )(
            <Select initialValue=''>
              {logisticModeOptions}
            </Select>
          )
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="articleCodes" label={commonLocale.inArticleLocale}>
          {getFieldDecorator('articleCodes',
            { initialValue: filterValue.articleCodes ? filterValue.articleCodes : '' }
          )(
            <Input placeholder={placeholderLocale(orderLocale.articleCodeMessege)} />)
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="createTime" label={orderLocale.createTime}>
          {getFieldDecorator('createTime',
            { initialValue: createTimeInitial }
          )(
            <RangePicker />
          )
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="type" label={orderLocale.type}>
          {getFieldDecorator('type', {
              initialValue: filterValue.type ? filterValue.type : ''
          })(
            <PreTypeSelect 
              hasAll
              preType={PRETYPE.orderType}
              orgUuid={loginOrg().uuid}
            />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="pricing" label={orderLocale.isPricing}>
          {getFieldDecorator('pricing', {
              initialValue: filterValue.pricing ? 1 : 0
          })(
            <Select>
              <Option key='pricingAll' value=''>{commonLocale.allLocale}</Option>
              <Option value={1}>{commonLocale.yesLocale}</Option>
              <Option value={0}>{commonLocale.noLocale}</Option>
            </Select>
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
