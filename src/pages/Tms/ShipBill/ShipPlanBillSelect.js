import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { State } from '../ShipPlanBill/ShipPlanBillContants';

@connect(({ shipplanbill }) => ({
    shipplanbill
}))
export default class ShipPlanBillSelect extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            changeShipPlanBill: {}
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value,
            data: nextProps.shipplanbill.data.list
        });

        if (this.props.value !== nextProps.value) {
            this.onSearch(nextProps.value);
        }
        // this.onChange(nextProps.value);
    }

    componentDidMount() {
        const { value } = this.state;
        this.initialValue();
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.shipplanbill.data.list;
        if (!data)
            return options;

        const that = this;
        Array.isArray(data) && data.forEach(function (item) {
            options.push(
                <Select.Option key={item.billNumber} value={item.billNumber}> {item.billNumber} </Select.Option>
            );
        });
        return options;
    }

    initialValue = () => {
        this.props.dispatch({
            type: 'shipplanbill/query',
            payload: {
                page: 0,
                pageSize: 20,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    stateEquals: State.APPROVED.name,
                    createOrgUuid: loginOrg().uuid
                }
            }
        });
    }

    onSearch = (value) => {
        let currentBill = undefined;
        let data = this.props.shipplanbill.data.list;
        if (value && data && data.length > 0) {
            currentBill = data.find(function (item) {
                if (value === item.billNumber)
                    return item;
            });
        }
        if (currentBill) {
            this.onChange(value);
            return;
        }

        this.props.dispatch({
            type: 'shipplanbill/query',
            payload: {
                page: 0,
                pageSize: 20,
                searchKeyValues: {
                    companyUuid: loginCompany().uuid,
                    stateEquals: State.APPROVED.name,
                    createOrgUuid: loginOrg().uuid,
                    billNumberLike: value
                }
            }
        });
    }

    onChange = (selectValue) => {
        if (!selectValue || (selectValue === this.state.changeShipPlanBill))
            return;
        let data = this.props.shipplanbill.data.list;
        if (!data)
            return;

        let currentBill = data.find(function (item) {
            if (selectValue === item.billNumber)
                return item;
        });


        this.state = {
            value: selectValue,
            changeShipPlanBill: currentBill ? currentBill.billNumber : undefined
        };

        // 用于form表单获取控件值
        if (this.props.onChange && currentBill)
            this.props.onChange(selectValue, currentBill.vehicle, currentBill.employees, currentBill.serialArch);
    }

    render() {
        const { single } = this.props;
        const selectProps = {
            showSearch: true,
            mode: this.props.mode,
            onChange: this.onChange,
            onSearch: this.onSearch,
            placeholder: this.props.placeholder,
            disabled: this.props.disabled
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
