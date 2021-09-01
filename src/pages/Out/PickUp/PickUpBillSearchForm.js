import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import { loginCompany } from '@/utils/LoginContext';
import { PRETYPE } from '@/utils/constants';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import UserSelect from '@/pages/Component/Select/UserSelect';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import { pickUpBillLocale } from './PickUpBillLocale';
import { PickupBillState, PickType, PickupBillItemState, OperateMethod } from './PickUpBillContants';
import { articleLocale } from '../../Basic/Article/ArticleLocale';
import OwnerSelect from '@/components/MyComponent/OwnerSelect';

const Option = Select.Option;

const stateOptions = [];
Object.keys(PickupBillState).forEach(function (key) {
  stateOptions.push(<Option key={PickupBillState[key].name} value={PickupBillState[key].name}>{PickupBillState[key].caption}</Option>);
});

const itemStateOptions = [];
itemStateOptions.push(<Option key='itemStateAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(PickupBillItemState).forEach(function (key) {
  itemStateOptions.push(<Option key={PickupBillItemState[key].name} value={PickupBillItemState[key].name}>{PickupBillItemState[key].caption}</Option>);
});

const typeOptions = [];
typeOptions.push(<Option key='typeAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(PickType).forEach(function (key) {
  typeOptions.push(<Option key={PickType[key].name} value={PickType[key].name}>{PickType[key].caption}</Option>);
});

const operateMethodOptions = [];
operateMethodOptions.push(<Option key='methodAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(OperateMethod).forEach(function (key) {
  operateMethodOptions.push(<Option key={OperateMethod[key].name} value={OperateMethod[key].name}>{OperateMethod[key].caption}</Option>);
});

@connect(({ pickup, loading }) => ({
  pickup,
  loading: loading.models.pickup,
}))
@Form.create()
export default class PickUpBillSearchForm extends SearchForm {
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
      <SFormItem key="states" label={commonLocale.stateLocale}>
        {getFieldDecorator('states',
          {
            initialValue: filterValue.states ? filterValue.states : []
          }
        )(
          <Select mode={'multiple'}>
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="operateMethod" label={pickUpBillLocale.operateMethod}>
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
        <SFormItem key="pickarea" label={pickUpBillLocale.pickarea}>
          {getFieldDecorator('pickarea', {
            initialValue: filterValue.pickarea
          })(
            <PickareaSelect placeholder={placeholderChooseLocale(pickUpBillLocale.pickarea)} />
          )
          }
        </SFormItem>
      );

      cols.push(
        <SFormItem key="waveBillNumber" label={pickUpBillLocale.waveBillNumber}>
          {getFieldDecorator('waveBillNumber', {
            initialValue: filterValue.waveBillNumber
          })(
            <Input placeholder={placeholderLocale(pickUpBillLocale.waveBillNumber)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="store" label={commonLocale.inStoreLocale}>
          {
            getFieldDecorator('store', {
              initialValue: filterValue.store
            })(
              <OrgSelect
                placeholder={placeholderLocale(
                  commonLocale.inStoreLocale
                )}
                upperUuid={loginCompany().uuid}
                type={'STORE'}
                single
              />)
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="picker" label={pickUpBillLocale.picker}>
          {getFieldDecorator('picker', {
            initialValue: filterValue.picker
          })(
            <UserSelect single hasAll placeholder={placeholderChooseLocale(pickUpBillLocale.picker)} />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="type" label={pickUpBillLocale.pickType}>
          {getFieldDecorator('type',
            { initialValue: filterValue.type ? filterValue.type : '' }
          )(
            <Select>
              {typeOptions}
            </Select>
          )
          }
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
              <Input placeholder={placeholderLocale(pickUpBillLocale.binContain)} />)
          }
        </SFormItem>
      );
      cols.push(
        <SFormItem key="owner" label={articleLocale.articleOwner}>
          {getFieldDecorator('ownerCode', {
            initialValue: filterValue ? filterValue.ownerCode : ''
          })(
            <OwnerSelect onlyOnline />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
