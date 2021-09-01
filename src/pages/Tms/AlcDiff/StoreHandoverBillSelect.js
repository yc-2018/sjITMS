import { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { billState } from '@/utils/BillState';
import { commonLocale, placeholderLocale } from '@/utils/CommonLocale';

/**
* 订单编号选择下拉框
*
* 支持单选和多选，多选时传入mode，参照Select的mode选项
* 
*/
@connect(({ storeHandover }) => ({
    storeHandover
}))
export default class StoreHandoverBillSelect extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });

        if (this.props.value !== nextProps.value) {
            this.initialValue(nextProps.value);
        }
    }

    componentDidMount() {
        const { value } = this.state;
        if (value)
            this.initialValue(value);
    }

    initialValue = (value) => {
        if (value) {
            this.onSearch(value);
        }
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.storeHandover.data.list;
        Array.isArray(data) && data.forEach(function (handover) {
            options.push(
                <Select.Option key={handover.billNumber} value={handover.billNumber}>
                    {handover.billNumber} </Select.Option>
            );
        });
        return options;
    }

    onSearch = (value) => {
        if (!value)
            return;

        this.props.dispatch({
            type: 'storeHandover/query',
            payload: {
                page: 0,
                pageSize: 20,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    dcUuid: loginOrg().uuid,
                    billNumber: value,
                }
            }
        });
    }

    onChange = (selectValue) => {
        this.setState({
            value: selectValue,
        });

        // 用于form表单获取控件值
        if (this.props.onChange)
            this.props.onChange(selectValue);
    }

    render() {
        const selectProps = {
            showSearch: true,
            onSearch: this.onSearch,
            onChange: this.onChange,
            placeholder: '请输入门店交接单',
            value: this.state.value,
        };

        return (
            <Select {...selectProps} style={{ width: '100%' }} >
                {this.buildOptions()}
            </Select>
        );
    }
}