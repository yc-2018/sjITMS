/*
 * @Author: Liaorongchang
 * @Date: 2022-05-31 14:25:52
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-01 08:38:28
 * @version: 1.0
 */
import { PureComponent } from 'react';
import { connect } from 'dva';
import BasicSourceSearchPage from './BasicSourceSearchPage';

// @connect(({ lineSystem, loading }) => ({
//   lineSystem,
//   loading: loading.models.lineSystem,
// }))
export default class BasicSource extends PureComponent {
  render() {
    return <BasicSourceSearchPage />;
  }
}
