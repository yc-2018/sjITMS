import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany } from '@/utils/LoginContext';
import { orgType, getOrgCaption } from '@/utils/OrgType';
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { shipPlanBillLocale } from './ShipPlanBillLocale';

@connect(({ shipplanbill }) => ({
    shipplanbill
}))
export default class ToOrgSelect extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            fromOrgUuid: props.fromOrgUuid,
            serialArchUuid: props.serialArchUuid
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value,
            fromOrgUuid: nextProps.fromOrgUuid,
            serialArchUuid: nextProps.serialArchUuid
        });

        if ((this.props.value !== nextProps.value)
            || (this.props.fromOrgUuid !== nextProps.fromOrgUuid)) {
            this.initialValue(nextProps.fromOrgUuid, nextProps.serialArchUuid);
        }
    }

    componentDidMount() {
        const { fromOrgUuid, serialArchUuid } = this.state;
        this.initialValue(fromOrgUuid, serialArchUuid);
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.shipplanbill.toOrgData.list;
        if (!data)
            return options;

        const that = this;
        let toOrgUuids = [];
        Array.isArray(data) && data.forEach(function (item) {
            if (item.toOrg && item.toOrg.uuid && !toOrgUuids.includes(item.toOrg.uuid)) {
                let value = JSON.stringify({
                    uuid: item.toOrg.uuid,
                    code: item.toOrg.code,
                    name: item.toOrg.name,
                    type: item.toOrgType
                });
                let caption = '[' + item.toOrg.code + ']' + item.toOrg.name + getOrgCaption(item.toOrgType);
                options.push(
                    <Select.Option key={item.toOrg.uuid} value={value}> {caption} </Select.Option>
                );
                toOrgUuids.push(item.toOrg.uuid);
            }
        });
        return options;
    }

    initialValue = (initialFromOrgUuid, serialArchUuid) => {
        if (!initialFromOrgUuid) {
            return;
        }

        let fromOrgUuids = [initialFromOrgUuid];
        this.props.dispatch({
            type: 'shipplanbill/queryShipPlanDeliveryDispatch',
            payload: {
                queryType: 'queryToOrg',
                companyUuid: loginCompany().uuid,
                serialArchUuid: serialArchUuid,
                fromOrgUuids: fromOrgUuids,
                page: 0,
                pageSize: 0
            }
        });
    }

    onSearch = (value) => {
        const { serialArchUuid, fromOrgUuid } = this.state;
        if (!serialArchUuid || !fromOrgUuid) {
            return;
        }
        let fromOrgUuids = [fromOrgUuid];

        this.props.dispatch({
            type: 'shipplanbill/queryShipPlanDeliveryDispatch',
            payload: {
                page: 0,
                pageSize: 20,
                queryType: 'queryToOrg',
                companyUuid: loginCompany().uuid,
                serialArchUuid: serialArchUuid,
                fromOrgUuids: fromOrgUuids,
                toOrgCode: value,
                page: 0,
                pageSize: 20
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
            placeholder: placeholderChooseLocale(shipPlanBillLocale.toOrg),
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