import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import VehicleTypeSelect from './VehicleTypeSelect';
import CarrierSelect from '@/pages/Component/Select/CarrierSelect';
import { VehicleState, VehicleLocale } from './VehicleLocale';
import { guid } from '@/utils/utils';
import { loginOrg } from '@/utils/LoginContext';
import { orgType } from '@/utils/OrgType';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option value="" key={guid()}>{'全部'}</Option>);
for (const prop in VehicleState) {
    if (VehicleState.hasOwnProperty(prop)) {
        const element = VehicleState[prop].caption;
        stateOptions.push(<Option value={prop} key={guid()}>{element}</Option>);
    }
}

@Form.create()
export default class VehicleSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: orgType.carrier.name == loginOrg().type ? undefined : false,
        }
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterEqualsValue, filterLikeValue } = this.props;
        const { toggle } = this.state;

        let cols = [
            <SFormItem key="codeOrPlate" label={VehicleLocale.title}>
                {getFieldDecorator('codeOrPlate', {
                    initialValue: filterLikeValue.codeOrPlate
                })(
                    <Input placeholder={placeholderLocale(VehicleLocale.codeOrPlate)} />
                )}
            </SFormItem>,
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('state', {
                    initialValue: filterEqualsValue.state ? filterEqualsValue.state : ''
                })(
                    <Select>
                        {stateOptions}
                    </Select>
                )}
            </SFormItem>,
            <SFormItem key="vehicleType" label={VehicleLocale.vehicleType}>
                {getFieldDecorator('vehicleType', {
                    initialValue: filterEqualsValue.vehicleType ? filterEqualsValue.vehicleType : ''
                })(
                    <VehicleTypeSelect hasAll />
                )}
            </SFormItem>,

        ];
        if (undefined == toggle || toggle == false) {
            return cols;
        }

        cols.push(
            <SFormItem key="carrier" label={VehicleLocale.carrier}>
                {getFieldDecorator('carrier', {
                    initialValue: filterEqualsValue.carrier ? filterEqualsValue.carrier : ''
                })(
                    <CarrierSelect hasAll />
                )}
            </SFormItem>)
        return cols;
    }
}
