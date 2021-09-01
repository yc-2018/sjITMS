import { formatMessage } from 'umi/locale';
export const stockTakeLocale = {
  maxBins: formatMessage({ id: 'config.stockTakeConfig.maxBins' }),
  decincState: formatMessage({ id: 'config.stockTakeConfig.decincState' })
};

export const DecincState={
  'APPROVED':'已批准',
  'UNAPPROVED':'未批准'
}