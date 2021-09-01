import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { inWrhBillLocale } from './InWrhBillLocale';
import { State, OperateType } from './InWrhBillContants';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { loginCompany,loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import moment from 'moment';
const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
const operateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});
operateOptions.push(<Option key='operateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(OperateType).forEach(function (key) {
  operateOptions.push(<Option key={OperateType[key].name} value={OperateType[key].name}>{OperateType[key].caption}</Option>);
});

@connect(({ inwrh, loading }) => ({
  inwrh,
  loading: loading.models.inwrh,
}))
@Form.create()
class InWrhBillSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
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
    let cols = [];
    let dateInitial = filterValue.inTime && filterValue.inTime.length == 2 ? [moment(filterValue.inTime[0]), moment(filterValue.inTime[1])] : null;
    cols.push(
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal }>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber ? filterValue.billNumber : ''
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          {
            initialValue: filterValue.state ? filterValue.state : ''
          }
        )(
          <Select>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="inTime" label={inWrhBillLocale.time}>
        {getFieldDecorator('inTime',
          { initialValue: dateInitial }
        )(
          <RangePicker/>
        )
        }
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="vehicleNum" label={inWrhBillLocale.carNumber}>
          {getFieldDecorator('vehicleNum', {
            initialValue: filterValue.vehicleNum ? filterValue.vehicleNum : ''
          })(
            <Input placeholder={placeholderLocale(inWrhBillLocale.carNumber)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="vendor" label={commonLocale.inVendorLocale}>
          {getFieldDecorator('vendor',
            { initialValue: filterValue.vendor ? filterValue.vendor : undefined }
          )(
            <OrgSelect
              upperUuid={loginCompany().uuid}
              state={STATE.ONLINE}
              type={'VENDOR'}
              single
              placeholder={placeholderChooseLocale(commonLocale.inVendorLocale)}
            />)
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="operateMethod" label={inWrhBillLocale.operateType}>
          {getFieldDecorator('operateMethod',
            {
              initialValue: filterValue.operateMethod ? filterValue.operateMethod : ''
            }
          )(
            <Select>
              {operateOptions}
            </Select>
          )
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="driverName" label={inWrhBillLocale.driver}>
          {getFieldDecorator('driverName',
            {
              initialValue: filterValue.driverName
            }
          )(
            <Input placeholder={placeholderLocale('司机姓名')} />
          )
          }
        </SFormItem>
      );
    }
    return cols;
  }
}

export default connect(({ global, setting }) => ({
  collapsed: global.collapsed,
  layout: setting.layout
}))(InWrhBillSearchForm);
