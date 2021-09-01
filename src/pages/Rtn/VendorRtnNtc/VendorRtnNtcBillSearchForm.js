import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State } from './VendorRtnNtcBillContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { vendorRtnNtcLocale } from './VendorRtnNtcBillLocale';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';

const Option = Select.Option;
const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});
@Form.create()
export default class VendorRtnNtcBillSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
            showLimitDays: true,
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
        const { filterValue } = this.props;
        const { toggle } = this.state;
        let cols = [];
        cols.push(
            <SFormItem key="billNumber" label={commonLocale.billNumberLocal}>
                {getFieldDecorator('billNumber', {
                    initialValue: filterValue.billNumber
                })(
                    <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="sourceBillNumber" label={vendorRtnNtcLocale.sourceBillNumber}>
                {getFieldDecorator('sourceBillNumber', {
                    initialValue: filterValue.sourceBillNumber
                })(
                    <Input placeholder={placeholderLocale(vendorRtnNtcLocale.sourceBillNumber)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('state',
                    { initialValue: filterValue.state ? filterValue.state : '' })(
                        <Select>{stateOptions}</Select>)}
            </SFormItem>
        );

        if (toggle) {
            cols.push(
                <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
                    {
                        getFieldDecorator('owner', {
                            initialValue: filterValue.owner ? filterValue.owner : '',
                        })(
                            <OwnerSelect hasAll
                                placeholder={placeholderLocale(commonLocale.ownerLocale)} />)
                    }
                </SFormItem>
            );
            cols.push(
                <SFormItem key="vendor" label={commonLocale.inVendorLocale}>
                    {getFieldDecorator('vendor', {
                        initialValue: filterValue.vendor
                    })(
                        <OrgSelect
                            placeholder={placeholderLocale(commonLocale.inVendorLocale)}
                            upperUuid={loginCompany().uuid}
                            type={'VENDOR'}
                            single
                        />)}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="articleCode" label={commonLocale.articleLocale}>
                    {getFieldDecorator('articleCode', {
                        initialValue: filterValue.articleCode
                    })(
                        <Input placeholder={placeholderLocale(commonLocale.articleLocale)} />
                    )}
                </SFormItem>
            );
        }
        return cols;
    }
}
