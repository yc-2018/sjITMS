import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { State, AlcClassify } from './AlcDiffBillContants';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { alcDiffLocal } from './AlcDiffBillLocale';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import WrhSelect from '@/pages/Component/Select/WrhSelect';

const Option = Select.Option;

const stateOptions = [];
const typeOptions = [];
stateOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option value={State[key].name} key={State[key].name}>{State[key].caption}</Option>);
});

typeOptions.push(<Option key='' value=''>{commonLocale.allLocale}</Option>);
Object.keys(AlcClassify).forEach(function (key) {
  typeOptions.push(<Option value={AlcClassify[key].name} key={AlcClassify[key].name}>{AlcClassify[key].caption}</Option>);
});
@Form.create()
export default class AlcDiffBillSearchForm extends SearchForm {
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
            <SFormItem key="sourceBillNumber" label={alcDiffLocal.sourceBillNumber}>
                {getFieldDecorator('sourceBillNumber', {
                    initialValue: filterValue.sourceBillNumber
                })(
                    <Input placeholder={placeholderLocale(commonLocale.sourceBillNumber)} />
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
                <SFormItem key="storeHandoverBillNumber" label={alcDiffLocal.handoverBill}>
                    {getFieldDecorator('storeHandoverBillNumber',
                        { initialValue: filterValue.storeHandoverBillNumber })(
                            <Input placeholder={placeholderLocale(alcDiffLocal.handoverBillNumber)} />
                        )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="alcNtcBillNumber" label={alcDiffLocal.alcBillNumber}>
                    {getFieldDecorator('alcNtcBillNumber',
                        { initialValue: filterValue.alcNtcBillNumber })(
                            <Input placeholder={placeholderLocale(alcDiffLocal.alcNtcBillNumber)} />
                        )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="store" label={commonLocale.inStoreLocale}>
                    {getFieldDecorator('store',
                        { initialValue: filterValue.store }
                    )(
                        <OrgSelect
                            placeholder={placeholderLocale(commonLocale.inStoreLocale)}
                            upperUuid={loginCompany().uuid}
                            type={'STORE'}
                            single
                        />)}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="wrh" label={commonLocale.inWrhLocale}>
                    {getFieldDecorator('wrh', { initialValue: filterValue.wrh ? filterValue.wrh : '' })(
                        <WrhSelect hasAll />)}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="articleCode" label={commonLocale.inArticleLocale}
                >
                    {getFieldDecorator('articleCode', {
                        initialValue: filterValue.articleCode
                    })(
                        <Input placeholder={placeholderLocale(commonLocale.inArticleLocale)}
                        />
                    )}
                </SFormItem>
            );
          cols.push(
            <SFormItem key="alcDiffDutyType" label={alcDiffLocal.alcType}>
              {getFieldDecorator('alcDiffDutyType',
                { initialValue: filterValue.alcDiffDutyType ? filterValue.alcDiffDutyType : '' })(
                <Select>{typeOptions}</Select>)}
            </SFormItem>
          );
        }
        return cols;
    }
}
