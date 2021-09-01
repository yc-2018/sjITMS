import { PureComponent } from "react";
import { Select } from 'antd';
import { waveWeeksType } from '@/pages/Out/Wave/waveWeeksContants';

export default class WaveWeeksSelect extends PureComponent {
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

  getWeekOptions = () => {
    const options = [];
    // options.push(<Select.Option key='' value=''>全部</Select.Option>);
    Object.keys(waveWeeksType).forEach(function (key) {
      options.push(
        <Select.Option key={waveWeeksType[key].name} value={waveWeeksType[key].name}>{waveWeeksType[key].caption}</Select.Option>
      );
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
    const waveWeeksSelectProps = {
      placeholder: this.props.placeholder,
      mode: this.props.mode,
      onChange: this.onChange,
      value :this.state.value
    };
    return (
      <Select {...this.props} {...waveWeeksSelectProps}>
        {this.getWeekOptions()}
      </Select>
    );
  }
}
