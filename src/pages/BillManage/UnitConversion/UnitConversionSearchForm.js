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
import { unitConversionLocal } from './UnitConversionLocal';
// import BasicStateSelect from "@/pages/Component/Select/BasicStateSelect";

const Option = Select.Option;
const FormItem = Form.Item;

@Form.create()
export default class UnitConversionSearchForm extends SearchForm{
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
            <SFormItem key="code" label={unitConversionLocal.code}>
                {getFieldDecorator('code', {
                    initialValue: filterValue ? filterValue.code : ''
                })(
                    <Input placeholder={placeholderLocale(unitConversionLocal.code)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="name" label={unitConversionLocal.name}>
                {getFieldDecorator('name', {
                    initialValue: filterValue ? filterValue.name : ''
                })(
                    <Input placeholder={placeholderLocale(unitConversionLocal.name)} />
                )}
            </SFormItem>
        );
       
        return cols;
    }
}
