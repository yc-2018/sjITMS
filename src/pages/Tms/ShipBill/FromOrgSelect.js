import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { orgType, getOrgCaption } from '@/utils/OrgType';
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { shipBillLocale } from './ShipBillLocale';

@connect(({ shipbill }) => ({
    shipbill
}))
export default class FromOrgSelect extends PureComponent {

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
            this.initialValue();
        }
    }

    componentDidMount() {
        const { value } = this.state;
        this.initialValue();
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.shipbill.fromOrgData.list;
        if (!data)
            return options;

        const that = this;
        let fromOrgUuids = [];
        Array.isArray(data) && data.forEach(function (item) {
            if (item.fromOrg && item.fromOrg.uuid && !fromOrgUuids.includes(item.fromOrg.uuid)) {
                let value = JSON.stringify({
                    uuid: item.fromOrg.uuid,
                    code: item.fromOrg.code,
                    name: item.fromOrg.name
                });
                let caption = '[' + item.fromOrg.code + ']' + item.fromOrg.name;
                options.push(
                    <Select.Option key={item.fromOrg.uuid} value={value}> {caption} </Select.Option>
                );
                fromOrgUuids.push(item.fromOrg.uuid);
            }
        });
        return options;
    }

    initialValue = () => {
        this.props.dispatch({
            type: 'shipbill/queryVirtualUnShipItem',
            payload: {
                page: 0,
                pageSize: 20,
                queryType: 'queryFromOrg',
                companyUuid: loginCompany().uuid
            }
        });
    }

    onSearch = (value) => {
        this.props.dispatch({
            type: 'shipbill/queryVirtualUnShipItem',
            payload: {
                page: 0,
                pageSize: 20,
                queryType: 'queryFromOrg',
                companyUuid: loginCompany().uuid,
                fromOrgCodeLike: value
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
            placeholder: placeholderChooseLocale(shipBillLocale.fromOrg),
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