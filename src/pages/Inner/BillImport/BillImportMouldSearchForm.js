import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { BillType } from './BillType';
import { billImportLocale } from './BillImportLocale';

const billTypeOptions = [];
billTypeOptions.push(<Option key='typeAll' value=''>{commonLocale.allLocale}</Option>);
Object.keys(BillType).forEach(function (key) {
    billTypeOptions.push(<Option key={BillType[key].name} value={BillType[key].name}>{BillType[key].caption}</Option>);
});
@Form.create()
export default class BillImportMouldSearchForm extends SearchForm {
    constructor(props) {
        super(props);
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;

        let cols = [
            <SFormItem key="codeNameLike" label={"导入模板"}>
                {getFieldDecorator('codeNameLike', {
                    initialValue: filterValue.codeNameLike
                })(
                    <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
                )}
            </SFormItem>,
            <SFormItem key="owner" label={commonLocale.inOwnerLocale}>
                {
                    getFieldDecorator('owner', {
                        initialValue: filterValue.owner ? filterValue.owner : '',
                    })(
                        <OwnerSelect hasAll />)
                }
            </SFormItem>,
            <SFormItem key="billType" label={billImportLocale.billType}>
                {getFieldDecorator('billType',
                    { initialValue: filterValue.billType ? filterValue.billType : '' }
                )(
                    <Select placeholder={placeholderLocale(billImportLocale.billType)}>
                        {billTypeOptions}
                    </Select>
                )
                }
            </SFormItem>
        ];
        return cols;
    }
}
