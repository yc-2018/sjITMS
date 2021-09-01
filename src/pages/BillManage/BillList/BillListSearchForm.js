import { PureComponent } from "react";
import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Col, Input, Select } from 'antd';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { STATE, STATUS } from '@/utils/constants';
import {
  commonLocale,
  notNullLocale,
  tooLongLocale,
  placeholderLocale,
  placeholderChooseLocale
} from '@/utils/CommonLocale';
import { BillListLocal } from './BillListLocal';
// import BasicStateSelect from "@/pages/Component/Select/BasicStateSelect";

const Option = Select.Option;
const FormItem = Form.Item;

@Form.create()
export default class BillListSearchForm extends SearchForm{
    constructor(props) {
        super(props);
    };

    onReset = () => {
        this.props.refresh();
    }

    onSearch = (data) => {
        this.props.refresh(data);
    }

    drawCols = () => {
        const { form, filterValue } = this.props;
        const { getFieldDecorator } = form;

        let cols = [];
        cols.push(
            <SFormItem key="code" label={BillListLocal.code}>
                {getFieldDecorator('code', {
                    initialValue: filterValue ? filterValue.code : ''
                })(
                    <Input placeholder={placeholderLocale(BillListLocal.code)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="billNumber" label={BillListLocal.billNumber}>
                {getFieldDecorator('billNumber', {
                    initialValue: filterValue ? filterValue.billNumber : ''
                })(
                    <Input placeholder={placeholderLocale(BillListLocal.billNumber)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('state', {
                    initialValue: filterValue.state ? filterValue.state : '-'
                })(
                    <Select placeholder={placeholderLocale(commonLocale.stateLocale)} >
                    <Select.Option value={'INIT'}>{'初始'}</Select.Option>
                    <Select.Option value={'AUDITED'}>{'已审核'}</Select.Option>
                    <Select.Option value={'-'}>{'全部'}</Select.Option>
                    </Select>
                )}
            </SFormItem>
        );
       
        return cols;
    }
}