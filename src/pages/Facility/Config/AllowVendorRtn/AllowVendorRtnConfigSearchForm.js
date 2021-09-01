import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

const FormItem = Form.Item;

@Form.create()
export default class VendorRtnBinConfigSearchForm extends SearchForm {

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
      <Col key="codename" sm={8} xs={24}>
        <FormItem label={commonLocale.inVendorLocale}>
          {getFieldDecorator('codename', {
            initialValue: filterValue.vendorCode
          })(
            <Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
          )}
        </FormItem>
      </Col>,
    ];
  }
}