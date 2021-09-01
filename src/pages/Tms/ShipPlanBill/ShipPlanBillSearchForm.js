import { Form, Input, Select } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale, placeholderContainedLocale } from '@/utils/CommonLocale';
import { shipPlanBillLocale } from './ShipPlanBillLocale';
import { State } from './ShipPlanBillContants';

const Option = Select.Option;

const stateOptions = [];
stateOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(State).forEach(function (key) {
    stateOptions.push(<Option key={State[key].name} value={State[key].name}>{State[key].caption}</Option>);
});

@Form.create()
export default class ShipPlanBillSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
            showLimitDays: true,
        }
    }

    drawCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { filterValue } = this.props;
        const { toggle } = this.state;

        let cols = [
            <SFormItem key="billNumberLike" label={commonLocale.billNumberLocal}>
                {getFieldDecorator('billNumberLike', {
                    initialValue: filterValue.billNumberLike
                })(
                    <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />
                )}
            </SFormItem>,
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
            </SFormItem>,
            <SFormItem key="plateNumber" label={shipPlanBillLocale.plateNumber}>
                {getFieldDecorator('plateNumberLike',
                    {
                        initialValue: filterValue.plateNumberLike ? filterValue.plateNumberLike : null
                    }
                )(
                    <Input placeholder={placeholderLocale(shipPlanBillLocale.plateNumber)} />
                )}
            </SFormItem>
        ];

        if (toggle == false)
            return cols;
        cols.push(
        
            <SFormItem key="sourceBillNumber" label={'来源单号'}>
                {getFieldDecorator('sourceBillNumber',
                    {
                        initialValue: filterValue.sourceBillNumber ? filterValue.sourceBillNumber : null
                    }
                )(
                    <Input placeholder={placeholderLocale('来源单号')} />
                )}
            </SFormItem>
        );
        cols.push(
            
            <SFormItem key="storeCode" label={shipPlanBillLocale.store}>
                {getFieldDecorator('storeCodeContains',
                    {
                        initialValue: filterValue.storeCodeContains ? filterValue.storeCodeContains : null
                    }
                )(
                    <Input placeholder={placeholderLocale(shipPlanBillLocale.store)} />
                )}
            </SFormItem>
        );
      
        return cols;
    }
}