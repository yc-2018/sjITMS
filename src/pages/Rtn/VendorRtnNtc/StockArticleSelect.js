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
    const { dispatch, ownerUuid, vendorUuid, wrhUuid } = this.props;
    const { stockFilter } = this.state;

    if (!ownerUuid || !vendorUuid || !wrhUuid) {
      return;
    }

    dispatch({
      type: 'stock/query',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: ownerUuid,
        vendorUuid: vendorUuid,
        wrhUuid: wrhUuid,
        binUsages: [binUsage.VendorRtnBin.name],
        articleCodeOrNameLike: value,
        state: stockState.NORMAL.name
      }
    });
  }

  buildOptions = () => {
    let options = [];
    let data = this.props.stock.stocks;

    let articles = [];
    const that = this;
    Array.isArray(data) && data.forEach(function (article) {
      if ((!that.props.ownerUuid || that.props.ownerUuid === article.owner.uuid) &&
        (article.companyUuid === loginCompany().uuid)
        && articles.indexOf(article.article.articleUuid) === -1) {
        options.push(
          <Select.Option key={article.article.articleUuid} value={JSON.stringify({
            uuid: article.article.articleUuid,
            code: article.article.articleCode,
            name: article.article.articleName,
            spec: article.article.articleSpec
          })}> {'[' + article.article.articleCode + ']' + article.article.articleName} </Select.Option>
        );

        articles.push(article.article.articleUuid)
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
