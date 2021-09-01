import { connect } from 'dva';
import { Form, Input,Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { placeholderLocale, commonLocale } from '@/utils/CommonLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { State } from '../ShipPlanBillDispatch/ShipPlanBillDispatchContants';
import { dispatchReturnLocale } from './DispatchReturnLocale';

const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

@connect(({ dispatchReturn, loading }) => ({
  dispatchReturn,
  loading: loading.models.dispatchReturn,
}))
@Form.create()
export default class DispatchReturnSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      // toggle: false,
    }
  }

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }

  drawCols = () => {
    const { form, filterValue } = this.props;
    const { getFieldDecorator } = form;
    // const { toggle } = this.state;
    let cols = [];

    cols.push(
      <SFormItem key='scheduleBillNumber' label={dispatchReturnLocale.shipPlanBillNumber}>
        {getFieldDecorator('scheduleBillNumber',
        { initialValue: filterValue.scheduleBillNumber ? filterValue.scheduleBillNumber : '' }
      )(
        <Input placeholder={placeholderLocale(dispatchReturnLocale.shipPlanBillNumber)} />)
      }
      </SFormItem>
    );
    cols.push(
      <SFormItem key='vehicleCodeName' label={dispatchReturnLocale.vehicleCodeName}>
        {getFieldDecorator('vehicleCodeName',
        { initialValue: filterValue.vehicleCodeName ? filterValue.vehicleCodeName : '' }
      )(
        <Input placeholder={placeholderLocale(dispatchReturnLocale.vehicleCodeName)} />)
      }
      </SFormItem>
    );
    cols.push(
      <SFormItem key='driver' label={dispatchReturnLocale.driver}>
        {getFieldDecorator('driver',
        { initialValue: filterValue.driver ? filterValue.driver : undefined }
      )(
        <UserSelect 
          single={true} 
          placeholder = {placeholderLocale(dispatchReturnLocale.driver)}
        />)
      }
      </SFormItem>
    );

    return cols;
  }
}