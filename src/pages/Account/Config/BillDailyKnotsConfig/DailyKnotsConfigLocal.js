import { formatMessage } from 'umi/locale';

export const bookConfigLocale = {
  bookTimeTitle: formatMessage({ id: 'bookTimeConfig.title' }),
  bookTimePreDays: formatMessage({ id: 'bookTimeConfig.column.preDays' }),
  bookTimeTime: formatMessage({ id: 'bookTimeConfig.column.time' }),
  bookTimePreDaysPattern: formatMessage({ id: 'bookTimeConfigPattern.column.preDays' }),
  bookTimeTimePattern: formatMessage({ id: 'bookTimeConfigPattern.column.time' }),
  bookTimeStartTime: formatMessage({ id: 'bookTimeConfig.column.startTime' }),
  bookTimeEndTime: formatMessage({ id: 'bookTimeConfig.column.endTime' }),
  bookTimeTimeRange: formatMessage({ id: 'bookTimeConfig.column.timeRange' }),

  bookQtyStrConfigTitle: formatMessage({ id: 'bookQtyStrConfig.title' }),
  bookQtyStrConfigDockGroup: formatMessage({ id: 'bookQtyStrConfig.column.dockGroup' }),
  bookQtyStrConfigDockGroupCode: formatMessage({ id: 'bookQtyStrConfig.column.dockGroupCode' }),
  bookQtyStrConfigDockGroupName: formatMessage({ id: 'bookQtyStrConfig.column.dockGroupName' }),
  bookQtyStrConfigDockGroupCodeName: formatMessage({ id: 'bookQtyStrConfig.column.dockGroupCodeName' }),
  bookQtyStrConfigMaxReceiveQtyStr: formatMessage({ id: 'bookQtyStrConfig.column.maxReceiveQtyStr' }),
  bookQtyStrConfigMaxReceiveArticleCount: formatMessage({ id: 'bookQtyStrConfig.column.maxReceiveArticleCount' }),
  bookQtyStrConfigExceedRatio: formatMessage({ id: 'bookQtyStrConfig.column.exceedRatio' }),
  bookQtyStrConfigCreateTitle: formatMessage({ id: 'bookQtyStrConfig.create.title' }),
}
