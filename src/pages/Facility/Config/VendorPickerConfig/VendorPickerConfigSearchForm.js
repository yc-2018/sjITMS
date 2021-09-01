import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Input, Select, Col } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { vendorPickerConfigLocale } from './VendorPickerConfigLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { packageVirtualArticleConfigLocale } from '@/pages/Facility/Config/VirtualArticleConfig/VirtualArticleConfigLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
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
          <SFormItem label={vendorPickerConfigLocale.picker}>
            {getFieldDecorator('pickerUuid', {
              initialValue: filterValue.pickerUuid ? filterValue.pickerUuid : '',
            })(
              <UserSelect
                placeholder={placeholderLocale(vendorPickerConfigLocale.picker)}
                autoFocus single={true} />
            )}
          </SFormItem>,
        ];
    }
}
