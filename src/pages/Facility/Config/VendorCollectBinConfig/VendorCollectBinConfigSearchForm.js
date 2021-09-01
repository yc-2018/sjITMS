import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { vendorCollectBinConfigLocale } from './VendorCollectBinConfigLocale';
import { vendorRtnBinConfigLocale } from '@/pages/Facility/Config/VendorRtnBinConfig/VendorRtnBinConfigLocale';
import SFormItem from '@/pages/Component/Form/SFormItem';
import ConfigSearchForm from '@/pages/Component/Form/ConfigSearchForm';

const FormItem = Form.Item;

@Form.create()
export default class VendorCollectBinConfigSearchForm extends ConfigSearchForm {

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
          <SFormItem label={vendorCollectBinConfigLocale.vendor}>
            {getFieldDecorator('vendorCodeName', {
              initialValue: filterValue.vendorCodeName
            })(
              <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
            )}
          </SFormItem>
        ];
    }
}
