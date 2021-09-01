import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { pickBinAdjBillLocale } from './PickBinAdjBillLocale';
import PickBinAdjStateSelect from './PickBinAdjStateSelect';

@Form.create()
export default class PickBinAdjBillSearchForm extends SearchForm {
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
    const { toggle } = this.state;

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
          { initialValue: filterValue.state ? filterValue.state : '' }
        )(
          <PickBinAdjStateSelect />
        )
        }
      </SFormItem>
    );
    cols.push(
      <SFormItem key="articleCode" label={pickBinAdjBillLocale.articleCode}>
        {getFieldDecorator('articleCode', {
          initialValue: filterValue.articleCode
        })(<Input placeholder={placeholderLocale(commonLocale.articleLocale)} />)}
      </SFormItem>
    );
    if (toggle) {
      cols.push(
        <SFormItem key="sourceBin" label={pickBinAdjBillLocale.sourceBin}>
          {getFieldDecorator('sourceBin', {
            initialValue: filterValue.sourceBinCode
          })(<Input placeholder={placeholderLocale(pickBinAdjBillLocale.sourceBin)} />)}
        </SFormItem>
      );
      cols.push(
        <SFormItem key="targetBin" label={pickBinAdjBillLocale.targetBin}>
          {getFieldDecorator('targetBin', {
            initialValue: filterValue.targetBinCode
          })(<Input placeholder={placeholderLocale(pickBinAdjBillLocale.targetBin)} />)}
        </SFormItem>
      )
    }
    return cols;
  }
}