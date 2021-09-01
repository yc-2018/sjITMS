import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { StockTakePlanState, StockTakePlanLocale, StockTakeSchema, OperateMethod } from './StockTakePlanLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key="stateAll" value="">{'全部'}</Option>);
stateOptions.push(<Option key="INITIAL" value="INITIAL">{StockTakePlanState['INITIAL']}</Option>);
stateOptions.push(<Option key="INPROGRESS" value="INPROGRESS">{StockTakePlanState['INPROGRESS']}</Option>);
stateOptions.push(<Option key="FINISHED" value="FINISHED">{StockTakePlanState['FINISHED']}</Option>);

@Form.create()
export default class StockTakePlanSearchForm extends SearchForm {
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
      <SFormItem key="billNumberLike" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumberLike', {
          initialValue: filterLikeValue.billNumberLike
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>,
      <SFormItem key="stateEquals" label={commonLocale.stateLocale}>
        {getFieldDecorator('stateEquals', {
          initialValue: filterValue.stateEquals ? filterValue.stateEquals : ''
        })(
          <Select>
            {stateOptions}
          </Select>
        )}
      </SFormItem>,
      <SFormItem key="owner" label={'货主'}>
        {getFieldDecorator('owner', {
          initialValue: filterValue.owner ? filterValue.owner : ''
        })(<OwnerSelect onlyOnline />
        )}
      </SFormItem>
    ];

    if (toggle == false)
      return cols;

    cols.push(
      <SFormItem key="serialNum" label={StockTakePlanLocale.serialNum}>
        {getFieldDecorator('serialNum', {
          initialValue: filterValue.serialNum
        })(<Input placeholder={placeholderLocale(StockTakePlanLocale.serialNum)} />
        )}
      </SFormItem>);

    const schemaOption = [];
    for (let ele in StockTakeSchema) {
      schemaOption.push(<Option key={ele}>{StockTakeSchema[ele]}</Option>)
    }
    cols.push(
      <SFormItem key="stockTakeSchema" label={StockTakePlanLocale.schema}>
        {getFieldDecorator('stockTakeSchema', {
          initialValue: filterValue.stockTakeSchema
        })(<Select placeholder={placeholderChooseLocale(StockTakePlanLocale.serialNum)}>
          {schemaOption}
        </Select>
        )}
      </SFormItem>)
    const operateMethodOption = [];
    for (let ele in OperateMethod) {
      operateMethodOption.push(<Option key={ele}>{OperateMethod[ele]}</Option>)
    }
    cols.push(
      <SFormItem key="operateMehthod" label={StockTakePlanLocale.operateMehthod}>
        {getFieldDecorator('operateMehthod', {
          initialValue: filterValue.operateMehthod
        })(<Select placeholder={placeholderChooseLocale(StockTakePlanLocale.operateMehthod)}>
          {operateMethodOption}
        </Select>
        )}
      </SFormItem>)
    return cols;
  }
}
