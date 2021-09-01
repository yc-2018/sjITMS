import { formatMessage } from 'umi/locale';

export const collectBinLocale ={
  title:formatMessage({id:'collectBin.title'}),
  mgrType:formatMessage({id:'collectBin.mgrType'}),
  startFromFirstLable:formatMessage({id:'collectBin.startFromFirstLable'}),
  startFromFirstPlaceholder:formatMessage({id:'collectBin.startFromFirstPlaceholder'}),
  loopFindLable: formatMessage({id:'collectBin.loopFindLable'}),
  loopFindPlaceholder: formatMessage({id:'collectBin.loopFindPlaceholder'}),
  dockGroupItem:formatMessage({id:'collectBin.dockGroupItem'}),
  dockItem: formatMessage({id:'collectBin.dockItem'}),
  storeFixCollectBin: formatMessage({id:'collectBin.storeFixCollectBin'}),
  logisticMode:formatMessage({id:'collectBin.logisticMode'}),
  sourceBin:formatMessage({id:'collectBin.sourceBin'}),
  sourceBinScope: formatMessage({id:'collectBin.sourceBinScope'}),
  pickarea:formatMessage({id:'collectBin.pickarea'}),
  dockGroup:formatMessage({id:'collectBin.dockGroup'}),
  dock: formatMessage({id:'collectBin.dock'}),
  collectBin:formatMessage({id:'collectBin.collectBin'}),
  collectBinScope: formatMessage({id:'collectBin.collectBinScope'}),
}
export function clearConfirm(item) {
  return formatMessage({ id: 'collectBin.confirm.clear' }, {
    item: item
  });
}