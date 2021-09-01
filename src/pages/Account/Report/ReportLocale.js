import { formatMessage } from 'umi/locale';
export const reportLocale = {
  title: formatMessage({ id: 'report.title' }),
  newDirectory: formatMessage({ id: 'report.new.directory' }),
  newReport: formatMessage({ id: 'report.new.report' }),
  directoryName: formatMessage({ id: 'report.baisc.directory.name' }),
  reportName: formatMessage({ id: 'report.basic.report.name' }),
  path: formatMessage({ id: 'report.basic.report.path' }),
  display: formatMessage({ id: 'report.display' }),
  headingReport: formatMessage({ id: 'report.headingReport' }),
  directoryDeleteFirst: '目录[',
  directoryDeleteLast: ']吗?若该目录下存在报表，则不能被删除，建议将报表移动至到其他目录下再做删除操作',
  reportDeleteFirst: '报表[',
  reportDeleteLast: ']吗？',
  orgTypes:'所属组织类型'
};