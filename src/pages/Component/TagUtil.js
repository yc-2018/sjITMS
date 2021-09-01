import { PureComponent } from "react";
import { Tag, Tooltip } from 'antd';
import { billState, getState } from '@/utils/BillState';
/**
 * 详情页-单据状态展示组件
 * 属性value设置当前状态值
 */
export default class TagUtil extends PureComponent {
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
    const { tips } = this.props;

    if (!stateValue || billState[this.state.stateValue] == undefined) {
      this.state.stateValue = 'UNDEFINED'
    }
    return (
      <div>
        <Tag color = {billState[this.state.stateValue].color} >
          {tips &&
          <Tooltip title = {tips}>
            <span> {billState[this.state.stateValue].caption} </span>
          </Tooltip>
          }
          {!tips &&
          billState[this.state.stateValue].caption
          }
        </Tag>
      </div>
    );
  }
}
