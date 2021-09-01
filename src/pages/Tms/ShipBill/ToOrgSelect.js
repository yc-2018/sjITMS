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
export default class ToOrgSelect extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            fromOrgUuid: props.fromOrgUuid
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value,
            fromOrgUuid: nextProps.fromOrgUuid,
        });

        if ((this.props.value !== nextProps.value)
            || (this.props.fromOrgUuid !== nextProps.fromOrgUuid)) {
            this.initialValue(nextProps.fromOrgUuid);
        }
    }

    componentDidMount() {
        const { fromOrgUuid } = this.state;
        this.initialValue(fromOrgUuid);
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.shipbill.toOrgData.list;
        if (!data)
            return options;

        const that = this;
        let toOrgUuids = [];
        Array.isArray(data) && data.forEach(function (item) {
            if (item.store && item.store.uuid && !toOrgUuids.includes(item.store.uuid)) {
                let value = JSON.stringify({
                    uuid: item.store.uuid,
                    code: item.store.code,
                    name: item.store.name
                });
                let caption = '[' + item.store.code + ']' + item.store.name;
                options.push(
                    <Select.Option key={item.store.uuid} value={value}> {caption} </Select.Option>
                );
                toOrgUuids.push(item.store.uuid);
            }
        });
        return options;
    }

    initialValue = (initialFromOrgUuid) => {
        if (!initialFromOrgUuid) {
            return;
        }

        this.props.dispatch({
            type: 'shipbill/queryVirtualUnShipItem',
            payload: {
                queryType: 'queryToOrg',
                companyUuid: loginCompany().uuid,
                fromUuid: initialFromOrgUuid,
                page: 0,
                pageSize: 1000
            }
        });
    }

    onSearch = (value) => {
        const { fromOrgUuid } = this.state;
        if (!fromOrgUuid) {
            return;
        }

        this.props.dispatch({
            type: 'shipbill/queryVirtualUnShipItem',
            payload: {
                page: 0,
                pageSize: 1000,
                queryType: 'queryToOrg',
                companyUuid: loginCompany().uuid,
                fromUuid: fromOrgUuid,
                storeCodeLike: value
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
            placeholder: placeholderChooseLocale(shipBillLocale.store),
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