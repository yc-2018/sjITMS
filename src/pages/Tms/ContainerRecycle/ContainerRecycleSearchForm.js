import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { Form, Input, Select } from 'antd';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { containerRecycleLocale } from './ContainerRecycleLocale';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import DCSelect from '@/pages/Component/Select/DCSelect';
import SerialArchLineSelect from '@/pages/Component/Select/SerialArchLineSelect';

@Form.create()
export default class ContainerRecycleSearchForm extends SearchForm {
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
        const { filterValue } = this.props;
        let cols = [];
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
            <SFormItem key="fromOrg" label={containerRecycleLocale.fromOrg}>
                {getFieldDecorator('fromOrg', {
                    initialValue: filterValue.fromOrg ? filterValue.fromOrg : undefined
                })(
                    <DCSelect
                        placeholder={placeholderChooseLocale(containerRecycleLocale.fromOrg)}
                    />
                )}
            </SFormItem>,
        );
        cols.push(
            <SFormItem key="serialArch" label={containerRecycleLocale.serialArch}>
                {getFieldDecorator('serialArch', {
                    initialValue: filterValue.serialArch ? filterValue.serialArch : ''
                })(
                    <SerialArchLineSelect hasAll />
                )}
            </SFormItem>,
        );

        return cols;
    }
}