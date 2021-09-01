import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { VehicleTypeLocale, VehicleUsage } from './VehicleTypeLocale';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='stateAll' value="">{'全部'}</Option>);
for (const prop in VehicleUsage) {
    stateOptions.push(<Option key={prop} value={prop}>{VehicleUsage[prop]}</Option>)
}

@Form.create()
export default class CarrierSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterEqualsValue, filterLikeValue } = this.props;

        let cols = [
            <SFormItem key="codeName" label={commonLocale.vehicleType}>
                {getFieldDecorator('codeName', {
                    initialValue: filterLikeValue.codeName
                })(
                    <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
                )}
            </SFormItem>,
            <SFormItem key="usageEquals" label={VehicleTypeLocale.usage}>
                {getFieldDecorator('usageEquals', {
                    initialValue: filterEqualsValue.usageEquals ? filterEqualsValue.usageEquals : ''
                })(
                    <Select>
                        {stateOptions}
                    </Select>
                )}
            </SFormItem>,
        ];
        return cols;
    }
}
