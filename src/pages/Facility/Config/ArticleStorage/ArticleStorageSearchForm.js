import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select,Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { articleStorageLocale } from './ArticleStorageLocale';
import { vendorRtnBinConfigLocale } from '@/pages/Facility/Config/VendorRtnBinConfig/VendorRtnBinConfigLocale';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

const FormItem = Form.Item;

@Form.create()
export default class ArticleStorageSearchForm extends ConfigSearchForm {

  onReset = () => {
    this.props.refresh();
  }

  onSearch = (data) => {
    this.props.refresh(data);
  }
  drawCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { filterValue } = this.props;


    return [
      <SFormItem label={articleStorageLocale.articleStorageSelectArticle}>
        {getFieldDecorator('vendorarticleCodeNameCode', {
          initialValue: filterValue.articleCode
        })(
          <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
        )}
      </SFormItem>
    ];
  }
}
