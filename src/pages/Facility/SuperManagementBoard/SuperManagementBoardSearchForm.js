import { Form, Input, Select, DatePicker } from 'antd';
import { connect } from 'dva';
import SearchForm from '@/pages/Component/Form/SearchForm';
import SFormItem from '@/pages/Component/Form/SFormItem';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { SuperType } from './SuperManagementBoardContants';
import UserSelect from '@/pages/Component/Select/UserSelect';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { SuperManagementBoardLocale } from './SuperManagementBoardLocale';

const { RangePicker } = DatePicker;
const Option = Select.Option;

const typeOptions = [];
typeOptions.push(<Option key=' ' value=' '>{commonLocale.allLocale}</Option>);
Object.keys(SuperType).forEach(function (key) {
    typeOptions.push(<Option key={SuperType[key].name} value={SuperType[key].name}>{SuperType[key].caption}</Option>);
});
@Form.create()
export default class SuperManagementBoardSearchForm extends SearchForm {
    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
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
            <SFormItem key="articleCodeName" label={SuperManagementBoardLocale.articleCodeName}>
                {getFieldDecorator('articleCodeName', {
                    initialValue: filterValue ? filterValue.articleCodeName : ''
                })(
                    <Input placeholder={placeholderLocale(commonLocale.codeAndNameLocale)} />
                )}
            </SFormItem>
        );
        cols.push(
            <SFormItem key="type" label={SuperManagementBoardLocale.type}>
                {getFieldDecorator('type',
                    {
                        initialValue: filterValue.type ? filterValue.type : ' '
                    }
                )(
                    <Select initialValue=' '>
                        {typeOptions}
                    </Select>
                )
                }
            </SFormItem>
        );
        cols.push(
            <SFormItem key="state" label={commonLocale.stateLocale}>
                {getFieldDecorator('state', {
                    initialValue: ''
                })(
                    <Select>
                        <Option key='' value=''>{commonLocale.allLocale}</Option>
                        <Option value={'VALID'}>{SuperManagementBoardLocale.valid}</Option>
                        <Option value={'INVALID'}>{SuperManagementBoardLocale.invalid}</Option>
                    </Select>
                )}
            </SFormItem>
        );

        if (toggle){
            cols.push(
                <SFormItem key="date" label={SuperManagementBoardLocale.date}>
                    {getFieldDecorator('date', {
                    })(
                        <RangePicker style={{ width: '100%' }} />
                    )}
                </SFormItem>
            );
        }
        return cols;
    }
}
