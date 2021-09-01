import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { binUsage, getUsageCaption } from '@/utils/BinUsage';


@connect(({ dec }) => ({
  dec,
}))
export default class DecBinSelect extends PureComponent {
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

    /*if (this.props.value !== nextProps.value) {
      this.onSearch(nextProps.value);
    }*/
  }

  /*componentDidMount() {
    const { value } = this.state;
    if (value)
      this.onSearch(value);
  }*/

  buildOptions = () => {
    let options = [];

    if (!this.props.wrhUuid) {
      return options;
    }

    let data = this.props.dec.bins;
    let that = this;
    Array.isArray(data) && data.forEach(function (bin) {
      if (that.props.getUsage) {
        options.push(
          <Select.Option key={bin.code} value={JSON.stringify({
            code: bin.code,
            usage: bin.usage
          })}> {bin.code + '[' + binUsage[bin.usage].caption + ']'} </Select.Option>
        );
      } else {
        options.push(
          <Select.Option key={bin.code} value={JSON.stringify({
            code: bin.code,
            usage: bin.usage
          })}> {bin.code} </Select.Option>
        );
      }

    });
    return options;
  }

  onSearch = (value) => {
    if (!this.props.wrhUuid) {
      return;
    }
    if (value && value.includes('{') && JSON.parse(value).code) {
      let bin = JSON.parse(value);
      let bins = this.props.dec.bins;
      if (Array.isArray(bins)) {
        let isExist = false;
        for (let x in bins) {
          if (bins[x].code === bin.code) {
            isExist = true;
            break;
          }
        }
        if (isExist) {
          return;
        }
      }
      value = bin.code;
    }
    this.props.dispatch({
      type: 'dec/queryDecBins',
      payload: {
        wrhUuid: this.props.wrhUuid,
        binCode: value
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
      onChange: this.onChange,
      onSearch: this.onSearch
    };

    if (this.state.value) {
      selectProps.value = this.state.value;
    }

    if (this.state.value && this.props.getUsage) {
      selectProps.value = JSON.parse(this.props.value).code + '[' + binUsage[JSON.parse(this.props.value).usage].caption + ']'
    }

    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}
