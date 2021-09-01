import React, { PureComponent } from 'react';
import styles from './ShipPlanBillItemTableTitle.less';
import classNames from 'classnames';

export default class ShipPlanBillItemTableTitle extends PureComponent {
    render() {
        const clsString = classNames(styles.formTitle, this.props.className);
        return (
            <div className={clsString}>
                <span>{this.props.title}</span>
            </div>
        );
    }
}