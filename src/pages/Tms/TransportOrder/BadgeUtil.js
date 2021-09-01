import { PureComponent } from "react";
import { Badge } from 'antd';
import { State } from './TransportOrderContants';
/**
 * 列表页-单据状态展示组件
 * 属性value设置当前状态值
 */
export default class BadgeUtil extends PureComponent {
  constructor(props) {
    super(props);
    const value = props.value;
    this.state = {
      stateValue: value
    };

  }
  componentWillReceiveProps(nextProps) {
    const value = nextProps.value;
    this.setState({
      stateValue: value
    });
  }
  render() {
    const { stateValue } = this.state;
    if (!stateValue || State[this.state.stateValue] == undefined) {
      this.state.stateValue = 'UNDEFINED'
    }
    return (
      <div>
        <Badge color={State[this.state.stateValue].color}
               text={State[this.state.stateValue].caption}
        />
      </div>
    );
  }
}
