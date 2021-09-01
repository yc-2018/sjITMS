import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale,placeholderContainedLocale } from '@/utils/CommonLocale';
import { containerMergerBillLocale } from './ContainerMergerBillLocale';
import { State } from './ContainerMergerBillContants';
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

@Form.create()
export default class ContainerMergerBillSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
            showLimitDays: true,
        }
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue,filterLikeValue } = this.props;
        const { toggle} = this.state;

        let cols = [
            <SFormItem key="billNumberLike" label={commonLocale.billNumberLocal}>
                {getFieldDecorator('billNumberLike', {
                    initialValue: filterLikeValue.billNumberLike
                })(
                    <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
                )}
            </SFormItem>,
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('stateEquals',
                {
                    initialValue: filterValue.stateEquals? filterValue.stateEquals : ' '
                }
                )(
                <Select initialValue=' '>
                    {stateOptions}
                </Select>
                )
                }
            </SFormItem>,
            <SFormItem key="article" label={containerMergerBillLocale.article}>
                {getFieldDecorator('articleCodeContain', {
                    initialValue: filterLikeValue.articleCodeContain
                })(
                    <Input placeholder={placeholderContainedLocale(containerMergerBillLocale.article)} />
                )}
            </SFormItem>
        ];

        if (toggle==false) 
            return cols;

        cols.push(
            <SFormItem key="fromContainer" label={containerMergerBillLocale.fromContainer}>
              {getFieldDecorator('fromContainerContain',
                { initialValue: filterLikeValue.fromContainerContain }
              )(
                <Input placeholder={placeholderContainedLocale(containerMergerBillLocale.fromContainer)}/>)
              }
            </SFormItem>
        );

        cols.push(
            <SFormItem key="toContainer" label={containerMergerBillLocale.toContainer}>
              {getFieldDecorator('toContainerContain',
                { initialValue: filterLikeValue.toContainerContain }
              )(
                <Input placeholder={placeholderContainedLocale(containerMergerBillLocale.toContainer)}/>)
              }
            </SFormItem>
        );

        cols.push(
            <SFormItem key="binCode" label={containerMergerBillLocale.binCode}>
              {getFieldDecorator('binCodeContain',
                { initialValue: filterLikeValue.binCodeContain }
              )(
                <Input placeholder={placeholderContainedLocale(containerMergerBillLocale.binCode)}/>)
              }
            </SFormItem>
        );
        
        return cols;
    }
}
