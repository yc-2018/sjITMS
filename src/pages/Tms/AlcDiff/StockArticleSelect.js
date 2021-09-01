import React, { PureComponent } from 'react';
import { Select, message } from 'antd';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { STATE } from '@/utils/constants';
import { binUsage } from '@/utils/BinUsage';
import { stockState } from '@/utils/StockState';
import { convertCodeName, convertArticleDocField } from '@/utils/utils';

@connect(({ stock }) => ({
    stock
}))
export default class StockArticleSelect extends PureComponent {
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
        const { dispatch, ownerUuid, wrhUuid } = this.props;
        const { stockFilter } = this.state;

        if (!ownerUuid || !wrhUuid) {
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
                wrhUuid: wrhUuid,
                binUsages: [binUsage.StorageBin.name, binUsage.PickUpBin.name, binUsage.PickUpStorageBin.name, binUsage.Virtuality.name],
                articleCodeOrNameLike: value,
                state: stockState.NORMAL.name
            }
        });
    }

    buildOptions = () => {
        let options = [];
        let data = this.props.stock.data.list;

        const articles = [];
        Array.isArray(data) && data.forEach(function (stock) {
            if (stock.article && stock.article.articleUuid && articles.indexOf(stock.article.articleUuid) === -1) {
                //有地方需要显示库存价格，暂时在这里添加
                stock.article.price = stock.price;
                options.push(
                    <Select.Option key={JSON.stringify(stock.article)}
                        value={JSON.stringify(stock.article)}>
                        {convertArticleDocField(stock.article)}
                    </Select.Option>
                );
                articles.push(stock.article.articleUuid)
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
