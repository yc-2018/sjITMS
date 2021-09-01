import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { binUsage } from '@/utils/BinUsage';
import { containerState } from '@/utils/ContainerState';
import { stockState } from '@/utils/StockState';

@connect(({ stock }) => ({
    stock
}))
export default class VendorHandoverContainerSelect extends PureComponent {
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
            if (nextProps.value) {
                this.onSearch(nextProps.value);
            }
        }
    }

    componentDidMount() {
        const { value } = this.state;
        if (value)
            this.onSearch(value);
    }

    onSearch = (value) => {
        const { dispatch, ownerUuid, vendorUuid, wrhUuid } = this.props;
        const { stockFilter } = this.state;

        if (!ownerUuid || !vendorUuid || !wrhUuid) {
            return;
        }

        dispatch({
            type: 'stock/pageQuery',
            payload: {
                page: 0,
                pageSize: 20,
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                ownerUuid: ownerUuid,
                vendorUuid: vendorUuid,
                wrhUuid: wrhUuid,
                binUsages: [binUsage.VendorRtnCollectBin.name],
                binCode: value,
                state: stockState.NORMAL.name
            }
        });
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.stock.data.list;

        const binCodes = [];
        Array.isArray(data) && data.forEach(function (stock) {
            if (stock.binCode && binCodes.indexOf(stock.binCode) === -1) {
                options.push(
                    <Select.Option key={stock.binCode}
                        value={JSON.stringify({
                            barcode: stock.containerBarcode,
                            bincode: stock.binCode
                        })}>
                        {stock.binCode}
                    </Select.Option>
                );

                binCodes.push(stock.binCode)
            }
        });
        return options;
    }

    onChange = (value) => {
        this.setState({ value: value });
        // 用于form表单获取控件值
        if (this.props.onChange)
            this.props.onChange(value);
    }

    render() {
        const { multiple } = this.props;
        const selectProps = {
            disabled: this.props.disabled,
            showSearch: true,
            mode: multiple ? 'multiple' : '',
            onChange: this.onChange,
            onSearch: this.onSearch,
            placeholder: this.props.placeholder,
            defaultValue: this.props.defaultValue
        };

        if (this.state.value) {
            selectProps.value = this.state.value;
        }

        return (
            <Select {...selectProps}>
                {this.buildOptions()}
            </Select>
        );
    }
}