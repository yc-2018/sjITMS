import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';

@connect(({ process }) => ({
  process,
}))
export default class ProcessContainerSelect extends PureComponent {
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
    if (value)
      this.onSearch(value);
  }

  buildOptions = () => {
    let options = [];

    let data = this.props.process.containers;

    Array.isArray(data) && data.forEach(function (container) {
      options.push(
        <Select.Option key={container.code} value={container.code}> {container.code} </Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {
    let containers = this.props.process.containers;
    if (Array.isArray(containers)) {
      let isExist = false;
      for (let x in containers) {
        if (containers[x].code === value) {
          isExist = true;
          break;
        }
      }
      if (isExist) {
        return;
      }
    }
    this.props.dispatch({
      type: 'process/queryContainers',
      payload: {
        containerBarCode: value,
        articleUuid: this.props.articleUuid,
        qpcStr: this.props.qpcStr,
        productionBatch: this.props.productionBatch,
        binCode: this.props.binCode
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

    selectProps.value = this.state.value;

    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}