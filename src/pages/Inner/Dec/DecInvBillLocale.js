import { formatMessage } from 'umi/locale';

export const decLocale = {
  title: formatMessage({ id: 'dec.title' }),
  type: formatMessage({ id: 'dec.column.type' }),
  decer: formatMessage({ id: 'dec.column.decer' }),
  qtyStr: formatMessage({ id: 'dec.column.qtyStr' }),
  qty: formatMessage({ id: 'dec.column.qty' }),
  amount: formatMessage({ id: 'dec.column.amount' }),
  realQtyStr: formatMessage({ id: 'dec.column.realQtyStr' }),
  realQty: formatMessage({ id: 'dec.column.realQty' }),
  realAmount: formatMessage({ id: 'dec.column.realAmount' }),
  includeArticle: formatMessage({ id: 'dec.column.article' }),
  includeBin: formatMessage({ id: 'dec.column.bin' }),
  includeContainer: formatMessage({ id: 'dec.column.container' }),

  manageType: formatMessage({ id: 'dec.btn.manageType' }),
  auditConfirm: formatMessage({ id: 'dec.confirm.audit' }),
  decItems: formatMessage({ id: 'dec.items' }),
};

export function itemNotLessZero(line, item) {
  return formatMessage({ id: 'dec.validate.itemNotLessZero' }, {
    line: line,
    item: item,
  });
}

export function itemRepeat(line1, line2) {
  return formatMessage({ id: 'dec.validate.itemRepeat' }, {
    line1: line1,
    line2: line2
  });
}

export function clearConfirm(item) {
  return formatMessage({ id: 'dec.confirm.clear' }, {
    item: item
  });
}

export function realQtyTooBig(line) {
  return formatMessage({ id: 'dec.validate.realQtyTooBig' }, {
    line: line,
  });
}

export function itemNotZero(line, item) {
  return formatMessage({ id: 'dec.validate.itemNotZero' }, {
    line: line,
    item: item
  });
}

export function noteTooLong(line) {
  return formatMessage({ id: 'dec.validate.noteTooLong' }, {
    line: line,
  });
}