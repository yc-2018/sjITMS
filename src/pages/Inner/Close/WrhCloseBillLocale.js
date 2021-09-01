import { formatMessage } from 'umi/locale';

export const closeLocale = {
  title: formatMessage({ id: 'close.title' }),
  type: formatMessage({ id: 'close.column.type' }),
  closer: formatMessage({ id: 'close.column.closer' }),
  reason: formatMessage({ id: 'close.column.reason' }),
  closeReason: formatMessage({ id: 'close.closeReason' }),
  closeBill: formatMessage({ id: 'close.closeBill' }),
}

export function binCodeRepeat(line1, line2) {
  return formatMessage({ id: 'close.validate.binCodeRepeat' }, {
    line1: line1,
    line2: line2
  });
}

