import { Form, Input, Select,DatePicker } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { loginCompany } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { putawayLocale } from './PutawayLocale';
import { PutawayBillState,OperateMethod,PutawayBillType } from './PutawayContants';
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='stateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(PutawayBillState).forEach(function (key) {
  stateOptions.push(<Option key={PutawayBillState[key].name} value={PutawayBillState[key].name}>{PutawayBillState[key].caption}</Option>);
});

const typeOptions = [];
typeOptions.push(<Option key='methodAll' value=''>{commonLocale.allLocale}</Option>)
Object.keys(OperateMethod).forEach(function (key) {
  typeOptions.push(<Option key={OperateMethod[key].name} value={OperateMethod[key].name}>{OperateMethod[key].caption}</Option>);
});

const putawayTypeOptions = [];
putawayTypeOptions.push(<Option key='typeAll' value=''>{commonLocale.allLocale}</Option>)
Object.keys(PutawayBillType).forEach(function (key) {
  putawayTypeOptions.push(<Option value={PutawayBillType[key].name}>{PutawayBillType[key].caption}</Option>);
});


@connect(({ putaway,loading }) => ({
  putaway,
  loading: loading.models.putaway,
}))
@Form.create()
export default class PutawaySearchForm extends SearchForm {
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
            <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)}/>
        )}
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
    cols.push(
      <SFormItem key="type" label={commonLocale.operateMethodLocale}>
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
    if (toggle) {
      cols.push(
        <SFormItem key="containerCodes" label={commonLocale.inContainerBarcodeLocale}>
          {getFieldDecorator('containerCodes',
            { initialValue: filterValue.containerCodes?filterValue.containerCodes:'' }
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
      cols.push(
        <SFormItem key="putawayBillType" label={putawayLocale.putawayBillType}>
          {getFieldDecorator('putawayBillType',
            { initialValue: filterValue.putawayBillType?filterValue.putawayBillType:'' }
          )(
            <Select initialValue=''>
              {putawayTypeOptions}
            </Select>
            )
          }
        </SFormItem>
      );
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
        <SFormItem key="putawayer" label={putawayLocale.putawayer}>
            {getFieldDecorator('putawayer', { initialValue: filterValue.putawayer})(
                <UserSelect single hasAll placeholder={placeholderChooseLocale(putawayLocale.putawayer)} />)}
        </SFormItem>
    );
    }
    return cols;
  }
}
