import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { formatMessage } from 'umi/locale';

@Form.create()
export default class BinTypeSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;

        let cols = [
            <SFormItem key="code" label={commonLocale.codeLocale}>
                {getFieldDecorator('code', {
                    initialValue: filterValue.code
                })(
                    <Input placeholder={placeholderLocale(commonLocale.codeLocale)} />
                )}
            </SFormItem>,
            <SFormItem key="name" label={commonLocale.nameLocale}>
                {getFieldDecorator('name',
                    { initialValue: filterValue.name }
                )(
                    <Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)
                }
            </SFormItem>
        ];
        return cols;
    }

}
