import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State, METHOD } from './VendorHandoverBillContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { vendorHandoverLocale } from './VendorHandoverBillLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';
import { orgType } from '@/utils/OrgType';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});

const methodOptions = [];
methodOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(METHOD).forEach(function (key) {
    methodOptions.push(<Option value={METHOD[key].name} key={METHOD[key].name}>{METHOD[key].caption}</Option>);
});
@Form.create()
export default class VendorHandoverBillSearchForm extends SearchForm {
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
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('state',
                    { initialValue: filterValue.state ? filterValue.state : '' })(
                        <Select>{stateOptions}</Select>)}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="method" label={commonLocale.operateMethodLocale}>
                {getFieldDecorator('method',
                    { initialValue: filterValue.method ? filterValue.method : '' })(
                        <Select>{methodOptions}</Select>
                    )}
            </SFormItem>
        );

        if (toggle) {
            cols.push(
                <SFormItem key="handover" label={vendorHandoverLocale.handover}>
                    {getFieldDecorator('handover', {
                        initialValue: filterValue.handover ? filterValue.handover : undefined,
                    })(
                        <UserSelect autoFocus
                            placeholder={placeholderLocale(vendorHandoverLocale.handover)}
                            single={true} />
                    )}
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
                <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
                    {
                        getFieldDecorator('owner', {
                            initialValue: filterValue.owner ? filterValue.owner : '',
                        })(
                            <OwnerSelect onlyOnline
                                placeholder={placeholderLocale(commonLocale.ownerLocale)} />)
                    }
                </SFormItem>
            );
            cols.push(
                <SFormItem key="containerBarcode" label={commonLocale.containerLocale}>
                    {getFieldDecorator('containerBarcode', {
                        initialValue: filterValue.containerBarcode
                    })(
                        <Input placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
                    )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="wrh" label={commonLocale.inWrhLocale}>
                    {getFieldDecorator('wrh', { initialValue: filterValue.wrh ? filterValue.wrh : '' })(
                        <WrhSelect hasAll onlyCompanyParam={loginOrg().type == orgType.store.name ? true : false} />)}
                </SFormItem>
            );
        }
        return cols;
    }
}
