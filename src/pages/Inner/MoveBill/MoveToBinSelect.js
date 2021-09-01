import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { stockState } from '@/utils/StockState';
import { getUsageCaption } from '@/utils/BinUsage';
import { loginCompany, loginOrg } from '@/utils/LoginContext';

@connect(({ moveruleConfig, bin }) => ({
  moveruleConfig, bin
}))
export default class MoveToBinSelect extends PureComponent {
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
  }

  buildOptions = () => {
    let options = [];
    if (this.props.hasAll && this.props.single) {
      options.push(<Select.Option key="all" value='' > 全部 </Select.Option>);
    }
    let data = this.props.bin.bin.list;
    Array.isArray(data) && data.forEach(function (bin) {
      options.push(
        <Select.Option key={bin.code} value={JSON.stringify({
          code: bin.code,
          usage: bin.usage,
        })}> {'[' + bin.code + ']' + getUsageCaption(bin.usage)} </Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {
    const { state, usage, dispatch, wrhUuid, moveruleConfig, states } = this.props;

    if (!wrhUuid || !moveruleConfig.toBinUsages)
      return;

    let searchKeyValues = {
      companyUuid: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      wrhUuid: wrhUuid,
      binUsages: moveruleConfig.toBinUsages
    }

    if (state) {
      searchKeyValues['binState'] = state;
    }

    if (value) {
      searchKeyValues['code'] = value;
    }
    if (states) {
      searchKeyValues['binStates'] = states;
    }

    dispatch({
      type: 'bin/queryBin',
      payload: {
        page: 0,
        pageSize: 20,
        searchKeyValues: {
          ...searchKeyValues
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

  onFocus = () => {
    // 用于form表单获取控件值
    if (this.props.onFocus)
      this.props.onFocus();
  }

  render() {
    const { single } = this.props;
    const selectProps = {
      showSearch: true,
      mode: single,
      onChange: this.onChange,
      onSearch: this.onSearch,
      onFocus: this.onFocus
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
