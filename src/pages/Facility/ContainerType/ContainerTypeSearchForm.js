import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { containerTypeLocale } from './ContainerTypeLocale';

@Form.create()
export default class ContainerTypeSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;

        let cols = [
            <SFormItem key="codeNameLike" label={commonLocale.containerTypeNameLocale}>
                {getFieldDecorator('codeNameLike', {
                    initialValue: filterValue.codeNameLike
                })(
                    <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
                )}
            </SFormItem>,
        ];
        return cols;
    }
}
