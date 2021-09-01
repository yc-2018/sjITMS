import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { stockState } from '@/utils/StockState';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

@connect(({ stock, article }) => ({
  stock, article,
}))
export default class StockAdjArticleSelect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      stocks: props.stock.stocks,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    })
    if (nextProps.stock.stocks != this.state.stocks) {
      this.setState({
        stocks: nextProps.stock.stocks
      })
    }
  }

  componentDidMount() {
    const { value } = this.state;
    if (value) {
      this.onSearch(value);
    }
  }

  buildOptions = () => {
    let options = [];
    let data = this.state.stocks;
    let articles = [];
    const that = this;
    Array.isArray(data) && data.forEach(function (article) {
      if ((!that.props.ownerUuid || that.props.ownerUuid === article.owner.uuid) &&
        (article.companyUuid === loginCompany().uuid)
        && articles.indexOf(article.article.articleUuid) === -1) {
        options.push(
          <Select.Option key={article.article.articleUuid} value={JSON.stringify({
            articleUuid: article.article.articleUuid,
            articleCode: article.article.articleCode,
            articleName: article.article.articleName,
            articleSpec: article.article.articleSpec
          })}> {'[' + article.article.articleCode + ']' + article.article.articleName} </Select.Option>
        );
        articles.push(article.article.articleUuid)
      }
    });
    return options;
  }

  onSearch = (value) => {
    if (!this.props.ownerUuid || !this.props.wrhUuid) {
      return;
    }

    const { dispatch } = this.props;
    let barcode = '';
    let article = {};
    try {
      article = JSON.parse(value);
    } catch (error) {

    }

    barcode = article.articleCode ? article.articleCode : value;
    dispatch({
      type: 'article/queryLikeBarcode',
      payload: barcode,
      callback: (response) => {
        if (response && response.success) {
          let articles = ['xunanping'];
          if (response.data && response.data.length > 0) {
            articles = response.data
          }
          dispatch({
            type: 'stock/query',
            payload: {
              companyUuid: loginCompany().uuid,
              dcUuid: loginOrg().uuid,
              ownerUuid: this.props.ownerUuid,
              wrhUuid: this.props.wrhUuid,
              binUsages: this.props.adjBinUsages,
              binCode: this.props.binCode,
              articleUuids: articles,
              state: stockState.NORMAL.name,
              line: this.props.line
            },
          });
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
      mode: single,
      filterOption: false,
      onChange: this.onChange,
      onSearch: this.onSearch
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
