import { formatMessage } from 'umi/locale';
export const processBillLocale = {
  title: formatMessage({ id: 'processBill.title' }),
  processScheme: formatMessage({ id: 'processBill.processScheme' }),
  rawInfoList: formatMessage({ id: 'processBill.rawInfoList' }),
  endInfoList: formatMessage({ id: 'processBill.endInfoList' }),
  end: formatMessage({ id: 'processBill.end' }),
  raw: formatMessage({ id: 'processBill.raw' }),
  spec: formatMessage({ id: 'processBill.spec' }),
  containsBinCode: formatMessage({ id: 'processBill.containsBinCode' }),
  containsBarCode: formatMessage({ id: 'processBill.containsBarCode' }),
}

export function itemNotLessZero(line, item) {
  return formatMessage({ id: 'processBill.validate.itemNotLessZero' }, {
    line: line,
    item: item,
  });
}

export function itemRepeat(line1, line2) {
  return formatMessage({ id: 'processBill.validate.itemRepeat' }, {
    line1: line1,
    line2: line2
  });
}

export function clearConfirm(item) {
  return formatMessage({ id: 'processBill.confirm.clear' }, {
    item: item
  });
}

export function realQtyTooBig(line) {
  return formatMessage({ id: 'processBill.validate.realQtyTooBig' }, {
    line: line,
  });
}

export function itemNotZero(line, item) {
  return formatMessage({ id: 'processBill.validate.itemNotZero' }, {
    line: line,
    item: item
  });
}

export function noteTooLong(line) {
  return formatMessage({ id: 'processBill.validate.noteTooLong' }, {
    line: line,
  });
}