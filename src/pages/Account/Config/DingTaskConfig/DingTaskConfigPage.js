/*
 * @Author: Liaorongchang
 * @Date: 2022-09-23 16:17:11
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-22 09:04:04
 * @version: 1.0
 */
import React, { PureComponent } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import DingTaskConfigSearchPage from './DingTaskConfigSearchPage';

export default class ETCIssueAndRecyclePage extends PureComponent {
  render() {
    return <DingTaskConfigSearchPage quickuuid="sj_itms_dingtaskConfige" />;
  }
}
