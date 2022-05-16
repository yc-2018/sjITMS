/*
 * @Author: guankongjin
 * @Date: 2022-03-09 10:08:34
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-10 16:31:07
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\Tms\LineSystem\LineSystem.js
 */
import { PureComponent } from 'react';
import { connect } from 'dva';
import LineSystemInfo from './LineSystemInfo';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import LineSystemSearchPage from './LineSystemSearchPage';

@connect(({ lineSystem, loading }) => ({
  lineSystem,
  loading: loading.models.lineSystem,
}))
export default class LineSystem extends PureComponent {
  render() {
    if (this.props.lineSystem.showPage === 'query') {
      return <LineSystemInfo />;
    }
  }
}
