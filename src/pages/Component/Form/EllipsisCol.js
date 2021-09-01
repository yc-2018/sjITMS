import { PureComponent } from "react"
import { Tooltip } from 'antd';

export default class EllipsisCol extends PureComponent {
  render() {
    // if (this.props.style) {
    //   return <span style={{fontColor: '#FF5400', color: '#FF5400'}}>{this.props.colValue}</span>
    // } else {
    //   return <span>{this.props.colValue}</span>
    // }
    let title = this.props.colValue;
    if(title && typeof(title) === 'string'){
      let list = title.split(':');
      if(list.length === 2){
        title = list[0]+':'+'\n'+list[1]
      }
    }
    return (
      <Tooltip placement="topLeft" title={title}>
                <span>
                    {this.props.colValue}
                </span>
      </Tooltip>);
  }
}
