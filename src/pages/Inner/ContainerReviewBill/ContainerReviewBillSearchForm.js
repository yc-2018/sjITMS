import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { containerReviewBillLocale } from './ContainerReviewBillLocale';
import { State } from './ContainerReviewBillContants';
import UserSelect from '@/pages/Component/Select/UserSelect';
const { RangePicker } = DatePicker;

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});
@Form.create()
export default class ContainerReviewBillSearchForm extends SearchForm {
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
                {getFieldDecorator('billNumberLike', {
                    initialValue: filterValue ? filterValue.billNumberLike : ''
                })(
                    <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
                )}
            </SFormItem>
        );

        cols.push(
            <SFormItem key="containerBarcodeLike" label={containerReviewBillLocale.container}>
                {getFieldDecorator('containerBarcodeLike', {
                    initialValue: filterValue ? filterValue.containerBarcodeLike : ''
                })(
                    <Input placeholder={placeholderLocale(containerReviewBillLocale.container)} />
                )}
            </SFormItem>
        );

        cols.push(
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('stateEquals',
                    {
                        initialValue: filterValue.stateEquals ? filterValue.stateEquals : ' '
                    }
                )(
                    <Select initialValue=' '>
                        {stateOptions}
                    </Select>
                )
                }
            </SFormItem>
        );


        if (toggle == false)
            return cols;

        cols.push(
            <SFormItem key="reviewer" label={containerReviewBillLocale.reviewer}>
                {getFieldDecorator('reviewerUuidEquals',
                    {
                        initialValue: filterValue.reviewerUuidEquals ? filterValue.reviewerUuidEquals : undefined
                    }
                )(
                    <UserSelect placeholder={placeholderChooseLocale(containerReviewBillLocale.reviewer)} autoFocus single={true} />
                )}
            </SFormItem>
        );

        cols.push(
            <SFormItem key="endReviewTime" label={containerReviewBillLocale.endReviewTime}>
                {getFieldDecorator('endReviewTime', {
                })(
                    <RangePicker style={{ width: '100%' }} />
                )}
            </SFormItem>
        );

        return cols;
    }
}