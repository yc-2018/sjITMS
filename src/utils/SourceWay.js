import { formatMessage } from 'umi/locale';

export const sourceWay = {
    CREATE: {
        name: 'CREATE',
        caption: formatMessage({ id: 'common.sourceWay.create.name' })
    },
    INTERFACE_IMPORT: {
        name: 'INTERFACE_IMPORT',
        caption: formatMessage({ id: 'common.sourceWay.interfaceImport.name' })
    },
    FILE_IMPORT: {
        name: 'FILE_IMPORT',
        caption: formatMessage({ id: 'common.sourceWay.fileImport.name' })
    }
};

export function getSourceWayCaption(sourceWayName) {
    let caption;

    for (let x in sourceWay) {
      if (sourceWay[x].name === sourceWayName) {
        caption = sourceWay[x].caption;
        break;
      }
    }

    return caption;
}
