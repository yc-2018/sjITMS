/*
 * @Author: Liaorongchang
 * @Date: 2022-05-31 14:25:52
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-08-09 15:06:15
 * @version: 1.0
 */
import { PureComponent } from 'react';
import { connect } from 'dva';
import BasicSourceSearchPage from './BasicSourceSearchPage';

@connect(() => ({
}))
export default class BasicSource extends PureComponent {
  render() {
    return <BasicSourceSearchPage dispatch={this.props.dispatch} {...this.props}/>;
  }
}
