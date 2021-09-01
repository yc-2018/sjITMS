import { PureComponent } from "react";
import { Badge } from 'antd';
import { dockState } from '@/utils/DockState';
/**
 * 详情页-单据状态展示组件
 * 属性value设置当前状态值
 */
export default class DockUtil extends PureComponent {
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
    if (!stateValue||dockState[this.state.stateValue] == undefined) {
      this.state.stateValue = 'UNDEFINED'
    }
    return (
      <div>
        <Badge color={dockState[this.state.stateValue].color}
               text={dockState[this.state.stateValue].caption}
        />
      </div>
    );
  }
}
