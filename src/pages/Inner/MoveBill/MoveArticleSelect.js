import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { stockState } from '@/utils/StockState';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

@connect(({ stock, article }) => ({
  stock, article
}))
export default class MoveArticleSelect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      stocks: props.stocks,
      value: props.value,
      binCode: props.binCode,
      containerBarcode: props.containerBarcode,
      articleList: props.articleList,
      options: [],
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });

    if (this.state.binCode !== nextProps.binCode ||
      this.state.containerBarcode !== nextProps.containerBarcode ||
      this.state.stocks !== nextProps.stocks) {
      this.setState({
        binCode: nextProps.binCode,
        containerBarcode: nextProps.containerBarcode,
        stocks: nextProps.stocks,
      })
    }
  }

  buildOptions = () => {
    const { stocks } = this.state;
    let options = [];
    let optionsPushed = [];

    if (!this.props.ownerUuid) {
      return options;
    }

    if (stocks && stocks.length == 0) {
      return options;
    }

    Array.isArray(stocks) && stocks.forEach(function (stock) {
      if (optionsPushed.indexOf(JSON.stringify({
        articleUuid: stock.article.articleUuid,
        articleCode: stock.article.articleCode,
        articleName: stock.article.articleName,
        articleSpec: stock.article.articleSpec,
        munit: stock.article.munit
      })) === -1) {
        optionsPushed.push(JSON.stringify({
          articleUuid: stock.article.articleUuid,
          articleCode: stock.article.articleCode,
          articleName: stock.article.articleName,
          articleSpec: stock.article.articleSpec,
          munit: stock.article.munit
        }));

        options.push(<Select.Option value={JSON.stringify({
          articleUuid: stock.article.articleUuid,
          articleCode: stock.article.articleCode,
          articleName: stock.article.articleName,
          articleSpec: stock.article.articleSpec,
          munit: stock.article.munit
        })}> {'[' + stock.article.articleCode + ']' + stock.article.articleName} </Select.Option>)
      }
    });

    if (optionsPushed.length == 1) {
      this.setState({
        value: optionsPushed[0],
      })
      if (this.props.onChange)
        this.props.onChange(optionsPushed[0]);
    }

    return options;
  }

  onSearch = (value) => {
    if (!this.props.ownerUuid || !this.props.wrhUuid) {
      return;
    }

    this.setState({ value: value });
    let that = this;

    this.props.dispatch({
      type: 'stock/queryGroupedStock',
      payload: {
        wrhUuid: that.props.wrhUuid,
        ownerUuid: that.props.ownerUuid,
        binCode: that.props.binCode ? that.props.binCode : that.state.binCode,
        containerBarcode: that.props.containerBarcode ? that.props.containerBarcode : that.state.containerBarcode,
        articleCodeOrNameLike: value,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        state: stockState.NORMAL.name,
        line: that.props.line
      },
      callback: (response) => {
        if (response && response.success) {
          that.setState({
            stocks: response.data
          })
        }
      }
    });
  }

  onChange = (selectValue) => {
    this.setState({
      value: selectValue,
    });
    if (this.props.onChange)
      this.props.onChange(selectValue);
  }

  render() {
    const { single } = this.props;
    const selectProps = {
      showSearch: true,
      mode: single,
      onChange: this.onChange,
      onSearch: this.onSearch,
      filterOption: false
    };

    if (this.state.value) {
      selectProps.value = this.state.value;
    }

    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}
