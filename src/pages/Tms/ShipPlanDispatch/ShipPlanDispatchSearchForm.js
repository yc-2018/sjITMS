import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { ShipPlanDispatchLocale, ShipPlanType, LogisticMode } from './ShipPlanDispatchLocale';
import OrgSelect from './OrgSelect';
import SerialArchSelect from '@/pages/Component/Select/SerialArchSelect';
import SerialArchLineSelect from '@/pages/Component/Select/SerialArchLineSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const Option = Select.Option;

const logisticModeOptions = [];
logisticModeOptions.push(<Option key='modeAll' value=''>{commonLocale.allLocale}</Option>);
for (let type in LogisticMode) {
    logisticModeOptions.push(<Option key={LogisticMode[type].caption} value={LogisticMode[type].caption}>{LogisticMode[type].caption}</Option>)
}

@Form.create()
export default class ShipPlanDispatchSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
            showLimitDays: true,
        }
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { pageFilter } = this.props;
        const { toggle } = this.state;

        let cols = [
            <SFormItem key="serialArchUuid" label={ShipPlanDispatchLocale.serialArch}>
                {getFieldDecorator('serialArchUuid', {
                    initialValue: pageFilter.serialArchUuid ? pageFilter.serialArchUuid : ''
                })(
                    <SerialArchSelect hasAll />
                )}
            </SFormItem>,
            <SFormItem key="serialArchLineUuid" label={ShipPlanDispatchLocale.serialArchLine}>
                {getFieldDecorator('serialArchLineUuid', {
                    initialValue: pageFilter.serialArchLineUuid ? pageFilter.serialArchLineUuid : ''
                })(
                    <SerialArchLineSelect hasAll />
                )}
            </SFormItem>,
            <SFormItem key="fromOrgUuids" label={ShipPlanDispatchLocale.sourceOrg}>
                {getFieldDecorator('fromOrgUuids', {
                    initialValue: pageFilter.fromOrgUuids ? pageFilter.fromOrgUuids : []
                })(
                    <OrgSelect mode='multiple' upperUuid={loginCompany().uuid} placeholder={placeholderChooseLocale(ShipPlanDispatchLocale.sourceOrg)} />
                )}
            </SFormItem>]

        if (toggle == false)
            return cols;

        cols.push(
            <SFormItem key="toOrgUuids" label={ShipPlanDispatchLocale.targetOrg}>
                {getFieldDecorator('toOrgUuids', {
                    initialValue: pageFilter.toOrgUuids ? pageFilter.toOrgUuids : []
                })(
                    <OrgSelect mode='multiple' upperUuid={loginCompany().uuid} placeholder={placeholderChooseLocale(ShipPlanDispatchLocale.targetOrg)} />
                )}
            </SFormItem>);

        cols.push(
            <SFormItem key="logisticMode" label={ShipPlanDispatchLocale.businessInfo}>
                {getFieldDecorator('logisticMode', {
                    initialValue: pageFilter.logisticMode ? pageFilter.logisticMode : ''
                })(
                    <Select placeholder={placeholderChooseLocale(ShipPlanDispatchLocale.businessInfo)}>
                        {logisticModeOptions}
                    </Select>
                )}
            </SFormItem>);
        return cols;
    }
}