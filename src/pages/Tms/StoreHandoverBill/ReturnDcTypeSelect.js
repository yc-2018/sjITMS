import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { PRETYPE } from '@/utils/constants';

@connect(({ pretype }) => ({
    pretype
}))
export default class ReturnDcTypeSelect extends PureComponent {

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

        if (this.props.dcUuid !== nextProps.dcUuid) {
            this.onSearch();
        }
    }

    componentDidMount() {
        this.initialValue();
    }

    onFocus = () => {
        this.initialValue();
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.pretype.data.list;
        if (!data)
            return options;

        const that = this;
        Array.isArray(data) && data.forEach(function (item) {
            if (item) {
                let value = JSON.stringify({
                    uuid: item.uuid,
                    name: item.name
                });
                options.push(
                    <Select.Option key={item.uuid} value={value}>  {item.name} </Select.Option>
                );
            }
        });
        return options;
    }

    onSearch = (value) => {
        this.props.dispatch({
            type: 'pretype/query',
            payload: {
                page: 0,
                pageSize: 20,
                searchKeyValues: {
                    orgUuid: loginCompany().uuid,
                    preType: PRETYPE.returnDistributionType,
                    name: value
                }
            }
        });
    }

    initialValue = () => {
        this.props.dispatch({
            type: 'pretype/query',
            payload: {
                page: 0,
                pageSize: 20,
                searchKeyValues: {
                    orgUuid: loginCompany().uuid,
                    preType: PRETYPE.returnDistributionType
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
        const { single } = this.props;
        const selectProps = {
            showSearch: true,
            mode: this.props.mode,
            onChange: this.onChange,
            onSearch: this.onSearch,
            onFocus: this.onFocus,
            placeholder: this.props.placeholder,
        };

        if (this.state.value) {
            selectProps.value = this.state.value;
        } else if ((this.state.value == undefined || this.state.value === '') && this.props.forItemTable == undefined) {
            selectProps.value = this.state.value;
        }
        return (
            <Select {...selectProps} style={{ width: '100%' }} >
                {this.buildOptions()}
            </Select>
        );
    }
}

