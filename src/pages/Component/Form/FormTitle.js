import React, { PureComponent } from 'react';
import panelStyles from './FormPanel.less'

export default class FormTitle extends PureComponent {
  render() {
    return (
      <div className={panelStyles.titleWrappr}>
        <div className={panelStyles.navTitle}>
          <span>{this.props.title} </span>
        </div>
      </div>
    );
  }
}
