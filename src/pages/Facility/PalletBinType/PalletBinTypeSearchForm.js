import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { palletBinTypeLocale } from './PalletBinTypeLocale';

@Form.create()
export default class PalletBinTypeSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;

        let cols = [
            <SFormItem key="codeNameLike" label={commonLocale.palletBinTypeLocale}>
                {getFieldDecorator('codeName', {
                    initialValue: filterValue.codeNameLike
                })(
                    <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
                )}
            </SFormItem>,
        ];
        return cols;
    }
}
