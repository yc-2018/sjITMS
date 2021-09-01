import { PureComponent } from "react";
import SearchForm from '@/pages/Component/Form/SearchForm';
import { Form, Col, Input, Select } from 'antd';
import OwnerSelect from '@/components/MyComponent/OwnerSelect';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { STATE, STATUS } from '@/utils/constants';
import {
  commonLocale,
  notNullLocale,
  tooLongLocale,
  placeholderLocale,
  placeholderChooseLocale
} from '@/utils/CommonLocale';
import { articleLocale } from './ArticleLocale';
import BasicStateSelect from "@/pages/Component/Select/BasicStateSelect";

const Option = Select.Option;
const FormItem = Form.Item;

@Form.create()
export default class ArticleSearchForm extends SearchForm {

    constructor(props) {
        super(props);

        this.state = {
            toggle: false
        }
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
        const { toggle } = this.state;

        let cols = [];
        cols.push(
            <SFormItem key="codeName" label={'商品'}>
                {getFieldDecorator('codeName', {
                    initialValue: filterValue ? filterValue.codeName : ''
                })(
                    <Input placeholder={placeholderLocale(articleLocale.articleCodeNameBarcode)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="categoryCodeName" label={'类别'}>
                {getFieldDecorator('categoryCodeName', {
                    initialValue: filterValue ? filterValue.categoryCodeName : ''
                })(
                    <Input placeholder={placeholderLocale(articleLocale.articleCategoryCodeName)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('state', {
                    initialValue: filterValue ? filterValue.state : ''
                })(
                    <BasicStateSelect />
                )}
            </SFormItem>
        );
        if (toggle) {
            cols.push(
                <SFormItem key="owner" label={articleLocale.articleOwner}>
                    {getFieldDecorator('ownerCode', {
                        initialValue: filterValue ? filterValue.ownerCode : ''
                    })(
                        <OwnerSelect onlyOnline />
                    )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="groupName" label={articleLocale.articleGroupName}>
                    {getFieldDecorator('groupName', {
                        initialValue:filterValue.groupName
                    })(
                        <Input placeholder={placeholderLocale(articleLocale.articleGroupName)} />
                    )}
                </SFormItem>
            );
        }
        return cols;
    }
}
