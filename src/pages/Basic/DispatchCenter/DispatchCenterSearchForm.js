import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import BasicStateSelect from '@/pages/Component/Select/BasicStateSelect';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

@Form.create()
export default class DispatchCenterSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;

        let cols = [
            <SFormItem key="codeName" label={commonLocale.inDispatchCenterLocale}>
                {getFieldDecorator('codeName', {
                    initialValue: filterValue.codeName
                })(
                    <Input placeholder={placeholderLocale(commonLocale.inDispatchCenterLocale)} />
                )}
            </SFormItem>,
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('state',
                    { initialValue: filterValue.state }
                )(
                    <BasicStateSelect />)
                }
            </SFormItem>
        ];
        return cols;
    }
}