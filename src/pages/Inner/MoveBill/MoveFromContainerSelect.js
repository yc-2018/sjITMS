import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { stockState } from '@/utils/StockState';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

@connect(({ stock }) => ({
  stock
}))
export default class MoveFromContainerSelect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      stocks: props.stocks,
      value: props.value,
      binCode: props.binCode,
      article: props.article,
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });

    if (this.props.binCode !== nextProps.binCode || 
      this.props.article !== nextProps.article ||
      this.state.stocks !== nextProps.stocks){
      this.setState({
        binCode: nextProps.binCode,
        article: nextProps.article,
        stocks: nextProps.stocks,
      })
    }
  }

  buildOptions = () => {
    let options = [];
    let optionsPushed = []

    if (!this.props.ownerUuid) {
      return options;
    }
    let stocks = this.state.stocks;
    if (!stocks) {
      return options;
    }

    Array.isArray(stocks) && stocks.forEach(function (stock) {     
      if (optionsPushed.indexOf(stock.containerBarcode) === -1) {
        optionsPushed.push(stock.containerBarcode);
        options.push(<Select.Option key={stock.containerBarcode} value={stock.containerBarcode}>
          {stock.containerBarcode} </Select.Option>)
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

    this.setState({value: value});
    if (!value)
      return;

    let that = this;
    this.props.dispatch({
      type: 'stock/queryGroupedStock',
      payload: {
        wrhUuid: that.props.wrhUuid,
        ownerUuid: that.props.ownerUuid, 
        binCode: that.props.binCode? that.props.binCode : that.state.binCode,
        containerBarcode: value,
        articleUuid: that.props.article? that.props.article : that.state.article,
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
