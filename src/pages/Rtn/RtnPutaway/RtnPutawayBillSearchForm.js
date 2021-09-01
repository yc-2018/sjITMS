import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State, METHOD } from './RtnPutawayBillContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { putAwayLocal } from './RtnPutawayBillLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';

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
export default class RtnPutawayBillSearchForm extends SearchForm {
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
                <SFormItem key="putawayer" label={putAwayLocal.putAwayer}>
                    {getFieldDecorator('putawayer',
                      { initialValue: filterValue.putawayer })(
                        <UserSelect
                            placeholder={placeholderLocale(putAwayLocal.putAwayer)}
                            autoFocus single={true} />
                    )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="vendorCode" label={commonLocale.inVendorLocale}>
                    {getFieldDecorator('vendorCode',
                        { initialValue: filterValue.vendorCode }
                    )(
                        <Input placeholder={placeholderLocale(commonLocale.inVendorLocale)} />
                    )
                    }
                </SFormItem>
            );
            cols.push(
                <SFormItem key="sourceContainerBarcode" label={putAwayLocal.sourceContainer}>
                    {getFieldDecorator('sourceContainerBarcode', {
                        initialValue: filterValue.sourceContainerBarcode
                    })(
                        <Input placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
                    )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="targetContainerBarcode" label={putAwayLocal.targetContainer}>
                    {getFieldDecorator('targetContainerBarcode', {
                        initialValue: filterValue.targetContainerBarcode
                    })(
                        <Input placeholder={placeholderLocale(commonLocale.inContainerBarcodeLocale)} />
                    )}
                </SFormItem>
            );
        }
        return cols;
    }
}
