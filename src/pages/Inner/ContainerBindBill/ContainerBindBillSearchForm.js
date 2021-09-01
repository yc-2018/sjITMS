import { Form, Input, Select } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import { containerBindBillLocale } from './ContainerBindBillLocale';
import { State } from '../ContainerMergerBill/ContainerMergerBillContants';

const stateOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});
@Form.create()
export default class ContainerBindBillSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
            showLimitDays: true,
        }
    }

    onReset = () => {
        this.props.refresh();
    }

    onSearch = (data) => {
        this.props.refresh(data);
    }
    /**
     * 绘制列
     */
    drawCols = () => {
        const { form, filterValue } = this.props;
        const { getFieldDecorator } = form;
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
                    { initialValue: filterValue.state ? filterValue.state : '' }
                )(
                    <Select placeholder={placeholderLocale(commonLocale.stateLocale)}>
                        {stateOptions}
                    </Select>
                )
                }
            </SFormItem>
        );
        cols.push(
            <SFormItem key="barcode" label={containerBindBillLocale.Container}>
                {getFieldDecorator('barcode', {
                    initialValue: filterValue.barcode
                })(<Input
                    placeholder={placeholderLocale(containerBindBillLocale.Container)} />)}
            </SFormItem>
        );

        if (toggle) {
            cols.push(
                <SFormItem key="newParentContainer" label={containerBindBillLocale.newParentContainer}>
                    {getFieldDecorator('newParentContainer',
                        { initialValue: filterValue.newParentContainer }
                    )(
                        <Input placeholder={placeholderLocale(containerBindBillLocale.newParentContainer)} />)
                    }
                </SFormItem>
            );

            cols.push(
                <SFormItem key="oldParentContainer" label={containerBindBillLocale.oldParentContainer}>
                    {getFieldDecorator('oldParentContainer',
                        { initialValue: filterValue.oldParentContainer }
                    )(
                        <Input placeholder={placeholderLocale(containerBindBillLocale.oldParentContainer)} />)
                    }
                </SFormItem>
            );
        }
        return cols;
    }
}