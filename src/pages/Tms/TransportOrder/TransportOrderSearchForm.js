import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select, DatePicker, Tooltip, Icon } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { State, orderBillType, urgencyLevel } from './TransportOrderContants';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import moment from 'moment';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { alcNtcLocale } from './TransportOrderLocale';
import {orgType} from '@/utils/OrgType';
import { addressToStr } from '@/utils/utils';
import ScheduleGroupSelect from '@/pages/Component/Select/ScheduleGroupSelect';

const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});

const orderTypeOptions = [];
orderTypeOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>)
Object.keys(orderBillType).forEach(function (key) {
  orderTypeOptions.push(<Option value={orderBillType[key].name} key={orderBillType[key].name}>{orderBillType[key].caption}</Option>);
});

const urgencyLevelOptions = [];
urgencyLevelOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>)
Object.keys(urgencyLevel).forEach(function (key) {
  urgencyLevelOptions.push(<Option value={urgencyLevel[key].name} key={urgencyLevel[key].name}>{urgencyLevel[key].caption}</Option>);
});
@connect(({ store, loading }) => ({
  store,
  loading: loading.models.store
}))
@Form.create()
export default class TransportOrderSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,

    }
  }
  onReset = () => {
    // this.props.form.resetFields();
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  onFieldChange = (value, field) => {
    if (field === 'pickUpPoint') {
      const store = JSON.parse(value);
      this.props.dispatch({
        type: 'store/getByCompanyUuidAndUuid',
        payload: store.uuid,
        callback: response => {
          if (response && response.success && response.data) {
              this.setState({
                pickInfo: response.data
              })
          }
        }
      });
    }
    if (field === 'deliveryPoint') {
      const store = JSON.parse(value);
      this.props.dispatch({
        type: 'store/getByCompanyUuidAndUuid',
        payload: store.uuid,
        callback: response => {
          if (response && response.success && response.data) {
            this.setState({
              deliveryInfo: response.data
            })
          }
        }
      });
    }
  }

  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;
    const { toggle  } = this.state;
    let cols = [];
    let expireDateInitial = filterValue.expireDate && filterValue.expireDate.length == 2 ? [moment(filterValue.expireDate[0]), moment(filterValue.expireDate[1])] : null;
    cols.push(
      <SFormItem key="billNumber" label={`${commonLocale.billNumberLocal}`}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber
        })(
          <Input style={{ width: '103%' }} placeholder={placeholderLocale(`${commonLocale.billNumberLocal}`)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="stat" label={commonLocale.stateLocale}>
        {getFieldDecorator('stat', { initialValue: filterValue.stat ? filterValue.stat : '' })(
          <Select>{stateOptions}</Select>)}
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="wmsNumber" label={`${alcNtcLocale.wmsNum}`}>
          {getFieldDecorator('wmsNumber', {
            initialValue: filterValue.wmsNumber
          })(
            <Input placeholder={placeholderLocale(`${alcNtcLocale.wmsNum}`)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="sourceNumber" label={`${alcNtcLocale.sourceBillNumber}`}>
          {getFieldDecorator('sourceNumber', {
            initialValue: filterValue.sourceNumber
          })(
            <Input placeholder={placeholderLocale(`${alcNtcLocale.sourceBillNumber}`)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="waveNumber" label={`${alcNtcLocale.waveNum}`}>
          {getFieldDecorator('waveNumber', {
            initialValue: filterValue.waveNumber
          })(
            <Input style={{ width: '103%' }} placeholder={placeholderLocale(`${alcNtcLocale.waveNum}`)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="scheduleNumber" label={`${alcNtcLocale.shipplanbill}`}>
          {getFieldDecorator('scheduleNumber', {
            initialValue: filterValue.scheduleNumber
          })(
            <Input placeholder={placeholderLocale(`${alcNtcLocale.shipplanbill}`)} />
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
        <SFormItem key="orderType" label={alcNtcLocale.orderType}>
          {getFieldDecorator('orderType', { initialValue: filterValue.orderType ? filterValue.orderType : '' })(
            <Select>{orderTypeOptions}</Select>)}
        </SFormItem>
      );

      cols.push(
        <SFormItem key="urgencyLevel" label={alcNtcLocale.urgencyLevel}>
          {getFieldDecorator('urgencyLevel', { initialValue: filterValue.urgencyLevel ? filterValue.urgencyLevel : '' })(
            <Select style={{ width: '103%' }}>
              <Select.Option key={1} value={true}>是</Select.Option>
              <Select.Option key={0} value={false}>否</Select.Option>
            </Select>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="pickUpPointStr" label={alcNtcLocale.pickUpPoint}>
          {getFieldDecorator('pickUpPointStr', { initialValue: filterValue.pickUpPointStr ? filterValue.pickUpPointStr : '' })(
            <Input placeholder={placeholderLocale(`${alcNtcLocale.pickUpPoint}`)}/>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="deliveryPointStr" label={alcNtcLocale.deliveryPoint}>
          {getFieldDecorator('deliveryPointStr', { initialValue: filterValue.deliveryPointStr ? filterValue.deliveryPointStr : '' })(
            <Input placeholder={placeholderLocale(`${alcNtcLocale.deliveryPoint}`)}/>)}
        </SFormItem>
      );
      cols.push(<SFormItem  key="shipGroupCode" label={'排车作业组'}>
          {getFieldDecorator('shipGroupCode', {
            initialValue: filterValue.shipGroupCode ? filterValue.shipGroupCode : undefined,
          })(
            <ScheduleGroupSelect placeholder={placeholderLocale('排车作业组')}/>
          )}
        </SFormItem>
      );
      cols.push(<SFormItem key="dataSourceTime" label={'数据来源时间'}>
          {getFieldDecorator('dataSourceTime',
            { initialValue: expireDateInitial }
          )(
            <RangePicker
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '103%' }} />
          )
          }
        </SFormItem>
      );
    }
    return cols;
  }
}
