import { formatMessage } from 'umi/locale';

export const palletBinSchemeLocale = {
  title: formatMessage({ id: 'palletBinScheme.title' }),
  palletBinType: formatMessage({ id: 'palletBinScheme.palletBinType' }),
  pickArea: formatMessage({ id: 'palletBinScheme.pickArea' }),
  searchFrom: formatMessage({ id: 'palletBinScheme.searchFrom' }),
  searchTo: formatMessage({ id: 'palletBinScheme.searchTo' }),
  startFromFirst: formatMessage({ id: 'palletBinScheme.startFromFirst' }),
  loopSearch: formatMessage({ id: 'palletBinScheme.loopSearch' }),
  lastPalletBin: formatMessage({ id: 'palletBinScheme.lastPalletBin' }),
}
export function clearConfirm(item) {
  return formatMessage({ id: 'palletBinScheme.confirm.clear' }, {
    item: item
  });
}
