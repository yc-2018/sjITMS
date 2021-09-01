import { PureComponent } from "react";
import { Badge } from 'antd';
import { billState,getState } from '@/utils/BillState';


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
        if (!stateValue || billState[this.state.stateValue] == undefined) {
          this.state.stateValue = 'UNDEFINED'
        }
        return (
            <div>
                <Badge color={billState[this.state.stateValue].color}
                  text={billState[this.state.stateValue].caption}
                />
            </div>
        );
    }
}