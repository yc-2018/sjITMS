
import { Form, Input, Select,DatePicker } from 'antd';
import { connect } from 'dva';
import { loginCompany } from '@/utils/LoginContext';
import { commonLocale,placeholderLocale,placeholderChooseLocale } from '@/utils/CommonLocale';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { processBillLocale } from './ProcessBillLocale';
import { ProcessBillState } from './ProcessBillContants';
import ProcessSchemeSelect from './ProcessSchemeSelect';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(ProcessBillState).forEach(function (key) {
  stateOptions.push(<Option value={ProcessBillState[key].name} key={ProcessBillState[key].name}>{ProcessBillState[key].caption}</Option>);
});


@connect(({ wave,pretype,loading }) => ({
  wave,
  pretype,
  loading: loading.models.wave,
}))
@Form.create()
export default class ProcessBillSearchForm extends SearchForm {
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
    const { toggle,typeNames } = this.state;
    let cols = [];

    cols.push(
      <SFormItem key="billNumber" label={commonLocale.billNumberLocal} labelSpan={4}>
        {getFieldDecorator('billNumber', {
            initialValue: filterValue.billNumber ? filterValue.billNumber : ''
        })(
            <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)}/>
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="processScheme" label={processBillLocale.processScheme}>
        {getFieldDecorator('processScheme', {
            initialValue: filterValue.processScheme ? filterValue.processScheme.uuid : ''
        })(
            <ProcessSchemeSelect hasAll />
        )}
      </SFormItem>
    );
    cols.push(
      <SFormItem key="state" label={commonLocale.stateLocale}>
        {getFieldDecorator('state',
          {
            initialValue: filterValue.state? filterValue.state : undefined
          }
        )(
          <Select >
            {stateOptions}
          </Select>
        )
        }
      </SFormItem>
    );
  
    if (toggle) {
      cols.push(
        <SFormItem key="owner" label={commonLocale.inOwnerLocale} >
          {getFieldDecorator('owner', { initialValue: filterValue.owner ? filterValue.owner.uuid : undefined })(
              <OwnerSelect onlyOnline/>)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="articleCodes" label={commonLocale.inArticleLocale}>
          {getFieldDecorator('articleCodes', {
            initialValue: filterValue.articleCodes
          })(
            <Input placeholder={placeholderLocale(commonLocale.inArticleCodesLocale)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="binCodes" label={commonLocale.bincodeLocale}>
          {getFieldDecorator('binCodes', {
            initialValue: filterValue.binCodes
          })(
            <Input placeholder={placeholderLocale(processBillLocale.containsBinCode)} />
          )}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="containerBarcodes" label={commonLocale.containerLocale}>
          {getFieldDecorator('containerBarcodes', {
            initialValue: filterValue.containerBarcodes
          })(
            <Input placeholder={placeholderLocale(processBillLocale.containsBarCode)} />
          )}
        </SFormItem>
      );
    }
    return cols;
  }
}
