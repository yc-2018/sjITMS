import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input } from 'antd';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { shipBillLocale } from './ShipBillLocale';

@Form.create()
export default class ShipBillSearchFormItemBatchAdd extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {

        }
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
        const { fieldsValue, shipType } = this.props;
        const { toggle } = this.state;
        let cols = [
            <SFormItem key="fromOrgCode" label={shipBillLocale.fromOrg}>
                {getFieldDecorator('fromOrgCode', {
                    initialValue: fieldsValue.fromOrgCode
                })(
                    <Input placeholder={placeholderLocale(shipBillLocale.fromOrg)} />
                )}
            </SFormItem>,
            <SFormItem key="toOrgCode" label={shipBillLocale.store}>
                {getFieldDecorator('toOrgCode', { initialValue: fieldsValue.toOrgCode })(
                    <Input placeholder={placeholderLocale(shipBillLocale.store)} />)}
            </SFormItem>
        ];

        if ("container" === shipType) {
            cols.push(
                <SFormItem key="containerBarcode" label={commonLocale.inContainerBarcodeLocale}>
                    {getFieldDecorator('containerBarcode', { initialValue: fieldsValue.containerBarcode })(
                        <Input placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />)}
                </SFormItem>
            );
        }
        return cols;
    }
}
