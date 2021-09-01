import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { vendorRtnBinConfigLocale } from './VendorRtnBinConfigLocale';
import SFormItem from '@/pages/Component/Form/SFormItem';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

const FormItem = Form.Item;

@Form.create()
export default class VendorRtnBinConfigSearchForm extends ConfigSearchForm {

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
          <SFormItem label={vendorRtnBinConfigLocale.vendorCode}>
            {getFieldDecorator('vendorCode', {
              initialValue: filterValue.vendorCode
            })(
              <Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
            )}
          </SFormItem>
        ];
    }
}
