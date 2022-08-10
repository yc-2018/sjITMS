import React, { PureComponent } from 'react';

export default class OutLayout extends PureComponent {
  render() {
    const { children } = this.props;
    return <div style={{ background: '#FFFFFF', height: '100vh' }}>{children}</div>;
  }
}
