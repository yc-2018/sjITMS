import { formatMessage } from 'umi/locale';
export const BinTypeLocale = {
    title: formatMessage({ id: 'bintype.title' }),
    codePattern: /^[0-9a-zA-Z]{4}$/,
    codePatternMessage: formatMessage({ id: 'dc.create.form.item.code.validate.message.integrality' }),
    useWMSLocale: formatMessage({ id: 'dc.index.table.column.useWMS' }),
    yes: formatMessage({ id: 'dc.select.yes' }),
    no: formatMessage({ id: 'dc.select.no' }),
    storageNum: formatMessage({ id: 'bintype.create.form.item.storageNumber' }),
    length: formatMessage({ id: 'bintype.create.form.item.length' }),
    width: formatMessage({ id: 'bintype.create.form.item.width' }),
    height: formatMessage({ id: 'bintype.create.form.item.height' }),
    weight: formatMessage({ id: 'bintype.create.form.item.weight' }),
    plotRatio: formatMessage({ id: 'bintype.create.form.item.plotRatio' }),
    qpcInfo: formatMessage({ id: 'bintype.create.qpc' })
};