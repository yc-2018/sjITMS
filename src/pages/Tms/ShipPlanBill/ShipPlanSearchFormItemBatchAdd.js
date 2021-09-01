import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { shipPlanBillLocale } from './ShipPlanBillLocale';
import { ShipPlanType } from './ShipPlanBillContants';
import SerialArchLineSelect from '@/pages/Component/Select/SerialArchLineSelect';

const Option = Select.Option;

const typeOptions = [];
typeOptions.push(
    Object.keys(ShipPlanType).forEach(function (key) {
        typeOptions.push(<Option key={ShipPlanType[key].name} value={ShipPlanType[key].name}>{ShipPlanType[key].caption}</Option>);
    }));

@Form.create()
export default class ShipPlanSearchFormItemBatchAdd extends SearchForm {
    constructor(props) {
        super(props);
    }
    onReset = () => {
        this.props.form.resetFields();
        this.props.refresh();
    }

    onSearch = (data) => {
        this.props.refresh(data);
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { fieldsValue } = this.props;
        let cols = [
            <SFormItem key="fromOrgCode" label={shipPlanBillLocale.fromOrg}>
                {getFieldDecorator('fromOrgCode', {
                    initialValue: fieldsValue.fromOrgCode
                })(
                    <Input placeholder={placeholderLocale(shipPlanBillLocale.fromOrg)} />
                )}
            </SFormItem>,
            <SFormItem key="toOrgCode" label={shipPlanBillLocale.toOrg}>
                {getFieldDecorator('toOrgCode', { initialValue: fieldsValue.toOrgCode })(
                    <Input placeholder={placeholderLocale(shipPlanBillLocale.toOrg)} />)}
            </SFormItem>,
            <SFormItem key="serialArchLine" label={shipPlanBillLocale.serialArchLine}>
                {getFieldDecorator('serialArchLine', {
                    initialValue: ''
                })(
                    <SerialArchLineSelect hasAll />
                )}
            </SFormItem>
        ];
        return cols;
    }
}
