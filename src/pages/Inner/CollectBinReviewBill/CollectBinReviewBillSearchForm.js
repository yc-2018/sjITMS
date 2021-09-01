import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { collectBinReviewBillLocale } from './CollectBinReviewBillLocale';
import { State } from './CollectBinReviewBillContants';
import UserSelect from '@/pages/Component/Select/UserSelect';
import OrgSelect from '@/pages/Component/Select/OrgSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

const { RangePicker } = DatePicker;
const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});
@Form.create()
export default class CollectBinReviewBillSearchForm extends SearchForm {
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
            <SFormItem key="store" label={collectBinReviewBillLocale.store}>
                {
                    getFieldDecorator('store', {
                        initialValue: filterValue.store
                    })(
                        <OrgSelect
                            placeholder={placeholderLocale(
                                collectBinReviewBillLocale.store
                            )}
                            upperUuid={loginCompany().uuid}
                            type={'STORE'}
                            single
                        />)
                }
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
            <SFormItem key="reviewer" label={collectBinReviewBillLocale.reviewer}>
                {getFieldDecorator('reviewerUuidEquals',
                    {
                        initialValue: filterValue.reviewerUuidEquals ? filterValue.reviewerUuidEquals : undefined
                    }
                )(
                    <UserSelect placeholder={placeholderChooseLocale(collectBinReviewBillLocale.reviewer)} autoFocus single={true} />
                )}
            </SFormItem>
        );

        cols.push(
            <SFormItem key="endReviewTime" label={collectBinReviewBillLocale.endReviewTime}>
                {getFieldDecorator('endReviewTime', {
                })(
                    <RangePicker style={{ width: '100%' }} />
                )}
            </SFormItem>
        );


        return cols;
    }
}