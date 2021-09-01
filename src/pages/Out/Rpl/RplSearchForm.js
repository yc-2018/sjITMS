import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select, DatePicker } from 'antd';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import { State, RplGenFrom ,RplBillType, RplDateType} from './RplContants';
import { LogisticMode } from '@/pages/In/Order/OrderContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { rplLocale } from './RplLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { getRplModeOptions } from '@/pages/Facility/PickArea/PickAreaContants';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});

const modeOptions = [];
modeOptions.push(<Option value='' key='modeAll'>全部</Option>);
modeOptions.push(getRplModeOptions());

const typeOptions = [];
typeOptions.push(<Option key='typeAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(RplBillType).forEach(function (key) {
  typeOptions.push(<Option value={RplBillType[key].name} key={RplBillType[key].name}>{RplBillType[key].caption}</Option>);
});

const genFromOptions = [];
genFromOptions.push(<Option key='genFromAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(RplGenFrom).forEach(function (key) {
  genFromOptions.push(<Option value={RplGenFrom[key].name} key={RplGenFrom[key].name}>{RplGenFrom[key].caption}</Option>);
});

const dateTypeOptions = [];
dateTypeOptions.push(<Option key='genFromAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(RplDateType).forEach(function(key){
  dateTypeOptions.push(<Option value={RplDateType[key].name} key={RplDateType[key].name}>{RplDateType[key].caption}</Option>)
})
@Form.create()
export default class RplSearchForm extends SearchForm {
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
    let stateValue = [];
    if(filterValue && filterValue.states) {
      stateValue = filterValue.states.split(',');
    }
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
      <SFormItem key="states" label={commonLocale.stateLocale}>
        {getFieldDecorator('states', { initialValue: filterValue.states ? stateValue: [] })(
          <Select mode={'multiple'}>{stateOptions}</Select>)}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="mode" label={rplLocale.mode}>
        {getFieldDecorator('mode', { initialValue: filterValue.mode ? filterValue.mode : '' })(
          <Select>{modeOptions}</Select>)}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="rplDateType" label={'单据类型'}>
        {getFieldDecorator('rplDateType', { initialValue: filterValue.rplDateType ? filterValue.rplDateType : '' })(
          <Select>{dateTypeOptions}</Select>)}
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="pickarea" label={rplLocale.pickArea}>
          {getFieldDecorator('pickarea', { initialValue: filterValue.pickarea})(
            <PickareaSelect placeholder={placeholderChooseLocale(rplLocale.pickArea)}/>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="waveBillNumber" label={rplLocale.waveBillNumber}>
          {getFieldDecorator('waveBillNumber', { initialValue: filterValue.waveBillNumber })(
            <Input placeholder={placeholderLocale(rplLocale.waveBillNumber)} />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="genFrom" label={rplLocale.genFrom}>
          {getFieldDecorator('genFrom', { initialValue: filterValue.genFrom ? filterValue.genFrom : '' })(
            <Select>{genFromOptions}</Select>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="rpler" label={rplLocale.rpler}>
          {getFieldDecorator('rpler', {initialValue: filterValue.rpler
          })(
            <UserSelect autoFocus single={true} placeholder={placeholderLocale(rplLocale.rpler)}/>
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="type" label={rplLocale.type}>
          {getFieldDecorator('type', { initialValue: filterValue.type ? filterValue.type : '' })(
            <Select>{typeOptions}</Select>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="articleCodes"
          label={commonLocale.inArticleLocale}
        >
          {getFieldDecorator('articleCodes', {
            initialValue: filterValue.articleCodes
          })(
            <Input placeholder={placeholderLocale(commonLocale.inArticleCodesLocale)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="fromBinCodes"
          label={rplLocale.fromBinCode}
        >
          {getFieldDecorator('fromBinCodes', {
            initialValue: filterValue.fromBinCodes
          })(
            <Input placeholder={placeholderLocale(rplLocale.fromBinCodes)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="toBinCodes" label={rplLocale.toBinCode}>
          {getFieldDecorator('toBinCodes', {
            initialValue: filterValue.toBinCodes
          })(
            <Input placeholder={placeholderLocale(rplLocale.toBinCodes)} />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
