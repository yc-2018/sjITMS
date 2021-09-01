import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { stockTakeBillLocal } from './StockTakeBillLocal';
import { State, METHOD, SCHEMA } from './StockTakeBillConstants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
  stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});

const methodOptions = [];
methodOptions.push(<Option key='methodAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(METHOD).forEach(function (key) {
  methodOptions.push(<Option value={METHOD[key].name} key={METHOD[key].name}>{METHOD[key].caption}</Option>);
});

const schemaOptions = [];
schemaOptions.push(<Option key='schemaAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(SCHEMA).forEach(function (key) {
  schemaOptions.push(<Option value={SCHEMA[key].name} key={SCHEMA[key].name}>{SCHEMA[key].caption}</Option>);
});
@Form.create()
export default class StocktakeBillSearchForm extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {
      toggle: false,
      showLimitDays: true,
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

    let cols = [];
    cols.push(
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal} labelSpan={8}>
        {getFieldDecorator('billNumber', {
          initialValue: filterValue.billNumber
        })(
          <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          { initialValue: filterValue.state ? filterValue.state : '' }
        )(
          <Select>{stateOptions}</Select>
        )
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="method" label={stockTakeBillLocal.method}>
        {getFieldDecorator('method', {
          initialValue: filterValue.method ? filterValue.method : ''
        })(
          <Select>{methodOptions}</Select>
        )}
      </SFormItem>
    );


    if (this.state.toggle) {
      cols.push(
        <SFormItem key="takePlanBill" label={stockTakeBillLocal.stockTakePlan}>
          {getFieldDecorator('takePlanBill', {
            initialValue: filterValue.takePlanBill
          })(<Input placeholder={placeholderLocale(stockTakeBillLocal.stockTakePlan)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="serialNum" label={stockTakeBillLocal.serialNum} labelSpan={8}>
          {getFieldDecorator('serialNum', {
            initialValue: filterValue.serialNum
          })(<Input placeholder={placeholderLocale(stockTakeBillLocal.serialNum)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="schema" label={stockTakeBillLocal.schema}>
          {getFieldDecorator('schema', {
            initialValue: filterValue.schema ? filterValue.schema : ''
          })(
            <Select>{schemaOptions}</Select>
          )}
        </SFormItem>
      );

      cols.push(
        <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
          {getFieldDecorator('owner', {
            initialValue: filterValue.owner ? filterValue.owner : '',
          })(
            <OwnerSelect onlyOnline />)
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="taker" label={stockTakeBillLocal.taker}>
          {getFieldDecorator('taker', {
            initialValue: filterValue.taker ? filterValue.taker : undefined,
          })(
            <UserSelect
              placeholder={placeholderLocale(stockTakeBillLocal.taker)}
              autoFocus single={true} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="binCode" label={stockTakeBillLocal.binLike} labelSpan={8}>
          {getFieldDecorator('binCode', {
            initialValue: filterValue.binCode
          })(
            <Input placeholder={placeholderLocale(commonLocale.bincodeLocale)} />
          )}
        </SFormItem>
      );
    }

    return cols;
  }
}
