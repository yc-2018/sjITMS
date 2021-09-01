import { PureComponent } from 'react';
import { Select } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

/**
* 订单编号选择下拉框
*
* 支持单选和多选，多选时传入mode，参照Select的mode选项
* 
*/
@connect(({ storeRtnNtc }) => ({
    storeRtnNtc
}))
export default class StoreRtnNtcBillSelect extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            data: []
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
        if (this.props.storeRtnNtc.data.list != nextProps.storeRtnNtc.data.list) {
            this.setState({
                data: nextProps.storeRtnNtc.data.list
            })
        }
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
        Array.isArray(this.state.data) && this.state.data.forEach(function (ntc) {
            options.push(
                <Select.Option key={ntc.billNumber} value={ntc.billNumber}>
                    {ntc.billNumber} </Select.Option>
            );
        });
        return options;
    }

    onSearch = (value) => {
        if (this.props.storeUuid === null
            || this.props.ownerUuid === null
            || this.props.wrhUuid === null) {
            return;
        }

        const states = ['INITIAL', 'INPROGRESS'];

        this.props.dispatch({
            type: 'storeRtnNtc/query',
            payload: {
                page: 0,
                pageSize: 20,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    dcUuid: loginOrg().uuid,
                    states: states,
                    billNumberAndSource: value,
                    storeUuid: this.props.storeUuid,
                    ownerUuid: this.props.ownerUuid,
                    wrhUuid: this.props.wrhUuid,
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
            placeholder: '请输入通知单号',
            value: this.state.value,
        };

        return (
            <Select {...selectProps} style={{ width: '100%' }} >
                {this.buildOptions()}
            </Select>
        );
    }
}