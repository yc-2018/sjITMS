import { Form, Input, Select,DatePicker } from 'antd';
import { connect } from 'dva';
import { stockLockBillLocale } from './StockLockBillLocale';
import { lockType,state } from './StockLockContants';
import { STATE } from '@/utils/constants';
import { loginCompany } from '@/utils/LoginContext';
import { commonLocale,placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import BinSelect from '@/pages/Component/Select/BinSelect';
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(state).forEach(function (key) {
  stateOptions.push(<Option key={state[key].name} value={state[key].name}>{state[key].caption}</Option>);
});

const typeOptions = [];
typeOptions.push(<Option key='typeAll' value=''>{commonLocale.allLocale}</Option>)
Object.keys(lockType).forEach(function (key) {
  typeOptions.push(<Option key={lockType[key].name} value={lockType[key].name}>{lockType[key].caption}</Option>);
});

@connect(({ stockLockBill,loading }) => ({
  stockLockBill,
  loading: loading.models.stockLockBill,
}))
@Form.create()
export default class StockLockBillSearchForm extends SearchForm {
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
    const { toggle} = this.state;
    let cols = [];
    cols.push(
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
        {getFieldDecorator('billNumber', {
            initialValue: filterValue.billNumber ? filterValue.billNumber : ''
        })(
            <Input autoFocus placeholder={placeholderLocale(commonLocale.billNumberLocal)}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="type" label={stockLockBillLocale.type}>
        {getFieldDecorator('type',
          { initialValue: filterValue.type?filterValue.type:'' }
        )(
          <Select initialValue=''>
            {typeOptions}
          </Select>
          )
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          {
            initialValue: filterValue.state? filterValue.state : ''
          }
        )(
          <Select initialValue=''>
            {stateOptions}
          </Select>
        )
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
                <OwnerSelect onlyOnline/>)
            }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="locker" label={stockLockBillLocale.locker}>
           {
              getFieldDecorator('locker', {
                initialValue:filterValue.locker,
              })(
                <UserSelect 
                  single 
                  hasAll 
                  placeholder={placeholderChooseLocale(stockLockBillLocale.locker)}
                 />
              )
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="binCodes" label={stockLockBillLocale.bin}>
          {
            getFieldDecorator('binCodes',
            { initialValue: filterValue.binCodes?filterValue.binCodes:'' }
          )(
            <Input placeholder={placeholderLocale(stockLockBillLocale.bin)}/>)
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="containerBarcodes" label={commonLocale.inContainerBarcodeLocale}>
          {getFieldDecorator('containerBarcodes',
            { initialValue: filterValue.containerBarcodes?filterValue.containerBarcodes:'' }
          )(
            <Input placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)}/>)
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="articleCodes" label={commonLocale.inArticleLocale}>
          {getFieldDecorator('articleCodes',
            { initialValue: filterValue.articleCodes?filterValue.articleCodes:'' }
          )(
            <Input placeholder={placeholderLocale(commonLocale.inArticleLocale)}/>)
          }
        </SFormItem>
      );
    }
    return cols;
  }
}
