import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State } from './StoreHandoverBillContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { storeHandoverLocale } from './StoreHandoverBillLocale';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { orgType } from '@/utils/OrgType';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});
@Form.create()
export default class StoreHandoverBillSearchForm extends SearchForm {
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
            <SFormItem key="shipBillNumber" label={storeHandoverLocale.shipBillNumber}>
                {getFieldDecorator('shipBillNumber',
                    { initialValue: filterValue.shipBillNumber })(
                        <Input placeholder={placeholderLocale(storeHandoverLocale.shipBillNumber)} />
                    )}
            </SFormItem>
        );

        if (toggle) {
            (orgType.store.name != loginOrg().type) && cols.push(
                <SFormItem key="store" label={commonLocale.inStoreLocale}>
                    {getFieldDecorator('store',
                        { initialValue: filterValue.store }
                    )(
                        <OrgSelect
                            placeholder={placeholderLocale(commonLocale.inStoreLocale)}
                            upperUuid={loginCompany().uuid}
                            type={orgType.store.name}
                            single
                        />)}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="outBillNumber" label={storeHandoverLocale.alcBillNumber}>
                    {getFieldDecorator('outBillNumber',
                        { initialValue: filterValue.outBillNumber })(
                            <Input placeholder={placeholderLocale(storeHandoverLocale.alcBillNumber)} />
                        )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="fromOrg" label={storeHandoverLocale.fromOrg}>
                    {getFieldDecorator('fromOrg',
                        { initialValue: filterValue.fromOrg }
                    )(
                        <OrgSelect
                            placeholder={placeholderLocale(commonLocale.fromOrg)}
                            upperUuid={loginCompany().uuid}
                            type={orgType.dc.name}
                            single
                        />)}
                </SFormItem>
            );
        }
        return cols;
    }
}