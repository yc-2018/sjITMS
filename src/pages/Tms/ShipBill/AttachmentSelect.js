import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';

@connect(({ attachmentconfig }) => ({
    attachmentconfig
}))
export default class AttachmentSelect extends PureComponent {

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
        if (this.props.dcUuid)
            this.onSearch();
    }

    onFocus = () => {
        this.initialValue();
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.attachmentconfig.data.list;
        if (!data)
            return options;

        const that = this;
        Array.isArray(data) && data.forEach(function (item) {
            if (item) {
                let value = JSON.stringify({
                    uuid: item.uuid,
                    code: item.code,
                    name: item.name
                });
                options.push(
                    <Select.Option key={item.uuid} value={value}>  {'[' + item.code + ']' + item.name} </Select.Option>
                );
            }
        });
        return options;
    }

    onSearch = (value) => {
        const { review, dcUuid } = this.props;
        if (!dcUuid)
            return;

        this.props.dispatch({
            type: 'attachmentconfig/query',
            payload: {
                page: 0,
                pageSize: 20,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    dcUuid: dcUuid,
                    review: review,
                    codeNameLike: value
                }
            }
        });
    }

    initialValue = () => {
        const { review, dcUuid } = this.props;
        if (!dcUuid)
            return;

        this.props.dispatch({
            type: 'attachmentconfig/query',
            payload: {
                page: 0,
                pageSize: 20,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    dcUuid: dcUuid,
                    review: review
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

