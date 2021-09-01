import { Input, Select, Form, DatePicker } from 'antd';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { state, moveType } from './PlaneMoveContants';
import { planeMoveLocale } from './PlaneMoveLocale';
import UserSelect from '@/pages/Component/Select/UserSelect';
import moment from 'moment';
const { RangePicker } = DatePicker;

const stateOptions = [];
stateOptions.push(<Select.Option key='stateAll' value=''>全部</Select.Option>);
Object.keys(state).forEach(function (key) {
    stateOptions.push(
        <Select.Option key={state[key].name} value={state[key].name}>{state[key].caption}</Select.Option>
    );
});

const typeOptions = [];
typeOptions.push(<Select.Option key='typeAll' value=''>全部</Select.Option>);
Object.keys(moveType).forEach(function (key) {
    typeOptions.push(
        <Select.Option key={moveType[key].name} value={moveType[key].name}>{moveType[key].caption}</Select.Option>
    );
});

@Form.create()
export default class PlaneMoveBillSearchForm extends SearchForm {

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

    drawCols = () => {
        let cols = [];
        const { toggle } = this.state;
        const { form: { getFieldDecorator }, filterValue } = this.props;
        let uploadDateInitial = filterValue.uploadDate && filterValue.uploadDate.length == 2 ?
            [moment(filterValue.uploadDate[0]), moment(filterValue.uploadDate[1])] : null;
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
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('state', {
                    initialValue: filterValue.state ? filterValue.state : ''
                })(
                    <Select>
                        {stateOptions}
                    </Select>
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="type" label={planeMoveLocale.type}>
                {getFieldDecorator('type', {
                    initialValue: filterValue.type ? filterValue.type : ''
                })(
                    <Select>
                        {typeOptions}
                    </Select>
                )}
            </SFormItem>
        );
        if (toggle) {
            cols.push(
                <SFormItem key="containerCodes" label={planeMoveLocale.containerBarcodes}>
                    {getFieldDecorator('containerCodes', {
                        initialValue: filterValue.containerCodes
                    })(
                        <Input placeholder={placeholderLocale(planeMoveLocale.containerBarcodes)} />
                    )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="owner" label={commonLocale.ownerLocale}>
                    {getFieldDecorator('owner', {
                        initialValue: filterValue.owner ? filterValue.owner : ''
                    })(
                        <OwnerSelect onlyOnline />
                    )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="uploadDate" label={commonLocale.inUploadDateLocale}>
                    {getFieldDecorator('uploadDate', {
                        initialValue: uploadDateInitial
                    })(
                        <RangePicker />
                    )}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="mover" label={planeMoveLocale.mover}>
                    {getFieldDecorator('mover', { initialValue: filterValue.mover})(
                        <UserSelect single hasAll placeholder={placeholderChooseLocale('平移员')} />)}
                </SFormItem>
            );
            cols.push(
                <SFormItem key="articleCodes" label={commonLocale.inArticleLocale}>
                    {getFieldDecorator('articleCodes', {
                        initialValue: filterValue.articleCodes
                    })(
                        <Input placeholder={placeholderLocale(commonLocale.inArticleLocale)} />
                    )}
                </SFormItem>
            );
        }

        return cols;
    }
}
