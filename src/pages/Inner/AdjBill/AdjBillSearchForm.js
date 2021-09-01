import { Form, Input, Select, DatePicker } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale, placeholderContainedLocale } from '@/utils/CommonLocale';
import { State,Type } from './AdjBillContants';
const { RangePicker } = DatePicker;
import UserSelect from '@/pages/Component/Select/UserSelect';
import { adjBillLocale } from './AdjBillLocale';
const Option = Select.Option;
const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});
const typeOptions = [];
typeOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(Type).forEach(function (key) {
  typeOptions.push(<Option key={Type[key].name} value={Type[key].name}>{Type[key].caption}</Option>);
});
@Form.create()
export default class AdjBillSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
    }
  }
  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue, filterLikeValue } = this.props;
    const { toggle } = this.state;
    let cols = [
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', {
          initialValue: filterLikeValue.billNumber
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>,
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          {
            initialValue: filterValue.state ? filterValue.state : ' '
          }
        )(
          <Select initialValue=' '>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>,
      <SFormItem key="adjer" label={adjBillLocale.adjer}>
        {getFieldDecorator('adjer', {
          initialValue: filterValue.adjer
        })(
          <UserSelect placeholder={placeholderChooseLocale(adjBillLocale.adjer)} single={true} />
        )}
      </SFormItem>
    ];
    if (toggle == false)
      return cols;
    cols.push(
      <SFormItem key="containerBarcode" label={adjBillLocale.contained}>
        {getFieldDecorator('containerBarcode', {
          initialValue: filterLikeValue.containerBarcode
        })(
          <Input placeholder={placeholderContainedLocale(adjBillLocale.contained)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="articleCodes" label={adjBillLocale.article}>
        {getFieldDecorator('articleCodes', {
          initialValue: filterLikeValue.articleCodes
        })(
          <Input placeholder={placeholderContainedLocale(adjBillLocale.article)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="sourceBillNumber" label={adjBillLocale.sourceBill}>
        {getFieldDecorator('sourceBillNumber', {
          initialValue: filterLikeValue.sourceBillNumber
        })(
          <Input placeholder={placeholderContainedLocale(adjBillLocale.sourceBill)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="type" label={adjBillLocale.type}>
        {getFieldDecorator('type',
          {
            initialValue: filterValue.type ? filterValue.type : ' '
          }
        )(
          <Select initialValue=' '>
            {typeOptions}
          </Select>
        )
        }
      </SFormItem>,
    );
    return cols;
  }
}
