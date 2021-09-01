import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { stockState } from '@/utils/StockState';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

@connect(({ stock, article }) => ({
    stock, article
}))
export default class StockLockArticleSelect extends PureComponent {
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
            this.onSearch(nextProps.value);
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

    if (!this.props.ownerUuid) {
      return options;
    }
    let stockLineMap = this.props.stock.stockLineMap;
    if (!stockLineMap) {
      return options;
    }
    let data = stockLineMap.get(this.props.line);
    let articleUuids = [];
    Array.isArray(data) && data.forEach(function (stock) {
      if (articleUuids.indexOf(stock.article.articleUuid) < 0) {
        articleUuids.push(stock.article.articleUuid);
        options.push(
          <Select.Option key={stock.article.articleUuid} value={JSON.stringify({
            uuid: stock.article.articleUuid,
            code: stock.article.articleCode,
            name: stock.article.articleName,
            spec: stock.article.articleSpec
          })}> {'[' + stock.article.articleCode + ']' + stock.article.articleName} </Select.Option>
        );
      }
    });
    return options;
  }

    onSearch = (value) => {
      if (!this.props.ownerUuid) {
        return;
      }
      let uuid = null;
      let stockLineMap = this.props.stock.stockLineMap;
      let isExist = false;
      if (value && value.indexOf("articleUuid") != -1 && stockLineMap) {
        let article = JSON.parse(value);
        let stocks = stockLineMap.get(this.props.line);
        if (Array.isArray(stocks) && stocks.length > 0) {
          stocks.forEach(e => {
            if (e.article.articleUuid === article.uuid) {
              isExist = true;
              return;
            }
          });
        }

        if (isExist) {
          return;
        }
        value = null;
        uuid = article.articleUuid;
      }

      this.props.dispatch({
        type: 'stock/query',
        payload: {
          ownerUuid: this.props.ownerUuid,
          binCode: this.props.binCode,
          articleCodeOrNameLike: value,
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid,
          state: stockState.NORMAL.name,
          articleUuid: uuid,
          line: this.props.line
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
            filterOption:false
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
