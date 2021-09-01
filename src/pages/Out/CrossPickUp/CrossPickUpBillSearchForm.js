import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import UserSelect from '@/pages/Component/Select/UserSelect';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import { crossPickUpBillLocale } from './CrossPickUpBillLocale';
import { CrossPickupBillState,OperateMethod } from './CrossPickUpBillContants';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(CrossPickupBillState).forEach(function (key) {
  stateOptions.push(<Option key={CrossPickupBillState[key].name} value={CrossPickupBillState[key].name}>{CrossPickupBillState[key].caption}</Option>);
});

const operateMethodOptions = [];
operateMethodOptions.push(<Option key='methodAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(OperateMethod).forEach(function (key) {
  operateMethodOptions.push(<Option key={OperateMethod[key].name} value={OperateMethod[key].name}>{OperateMethod[key].caption}</Option>);
});

@connect(({ crossPickUp, loading }) => ({
  crossPickUp,
  loading: loading.models.crossPickUp,
}))
@Form.create()
export default class CrossPickUpBillSearchForm extends SearchForm {
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
    const { toggle, typeNames } = this.state;
    let cols = [];

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
      <SFormItem key="operateMethod" label={'操作方式'}>
        {getFieldDecorator('operateMethod',
          { initialValue: filterValue.operateMethod ? filterValue.operateMethod : '' }
        )(
          <Select>
            {operateMethodOptions}
          </Select>
        )
        }
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="pickarea" label={'拣货分区'}>
          {getFieldDecorator('pickarea', {
            initialValue: filterValue.pickarea
          })(
            <PickareaSelect placeholder={placeholderChooseLocale('拣货分区')} />
          )
          }
        </SFormItem>
      );

      cols.push(
        <SFormItem key="waveBillNumber" label={'波次单号'}>
          {getFieldDecorator('waveBillNumber', {
            initialValue: filterValue.waveBillNumber
          })(
            <Input placeholder={placeholderLocale(crossPickUpBillLocale.waveBillNumber)} />
          )}
        </SFormItem>
      );
     
      cols.push(
        <SFormItem key="picker" label={'拣货员'}>
          {getFieldDecorator('picker', {
            initialValue: filterValue.picker
          })(
            <UserSelect single hasAll placeholder={placeholderChooseLocale(crossPickUpBillLocale.picker)} />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="articleCodes" label={commonLocale.inArticleLocale}>
          {getFieldDecorator('articleCodes',
            { initialValue: filterValue.articleCodes }
          )(
            <Input placeholder={placeholderLocale(commonLocale.inArticleCodesLocale)} />)
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="binCodes" label={commonLocale.bincodeLocale}>
          {
            getFieldDecorator('binCodes',
              { initialValue: filterValue.binCodes }
            )(
              <Input placeholder={placeholderLocale(crossPickUpBillLocale.binContain)} />)
          }
        </SFormItem>
      );
    }
    return cols;
  }
}