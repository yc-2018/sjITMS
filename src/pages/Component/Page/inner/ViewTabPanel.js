import { Component } from 'react';

export default class ViewTabPanel extends Component {

  render() {
    let style = {
      'height': 'calc(100vh - 241px)',
      // 'marginTop': '-15px',
      'overflowY': this.props.withoutTable ? 'auto' : 'hidden',
      'overflowX':'hidden'
    };
    if (this.props.style) {
      style = {
        ...style,
        ...this.props.style
      };
    }
    return (
      <div style={style}>
        {this.props.children}
      </div>
    )
  }
}
