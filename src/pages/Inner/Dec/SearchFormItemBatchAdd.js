import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { decLocale } from './DecInvBillLocale';

@Form.create()
export default class SearchFormItemBatchAdd extends SearchForm {
  constructor(props) {
    super(props);
    this.state = {

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
    const { fieldsValue } = this.props;
    const { toggle } = this.state;
    let cols = [
      <SFormItem key="articleCodeName" label={commonLocale.inArticleLocale}>
        {getFieldDecorator('articleCodeName', {
          initialValue: fieldsValue.articleCodeOrNameLike
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>,
      <SFormItem key="binCode" label={'货位'}>
        {getFieldDecorator('binCode', { initialValue: fieldsValue.binCodes })(
          <Input placeholder={placeholderLocale('货位代码')} />)}
      </SFormItem>,
      <SFormItem key="containerBarcode" label={commonLocale.inContainerBarcodeLocale}>
        {getFieldDecorator('containerBarcode', { initialValue: fieldsValue.containerBarcodes })(
          <Input placeholder={placeholderLocale('容器条码')} />)}
      </SFormItem>
    ];
    return cols;
  }
}
