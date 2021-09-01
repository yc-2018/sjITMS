import { formatMessage } from 'umi/locale';
export const WrhLocale = {
    title: formatMessage({ id: 'wrh.title' }),
    codePattern: /^[0-9a-zA-Z]{7}$/,
    codePatternMessage: formatMessage({ id: 'dc.create.form.item.code.validate.message.integrality' }),
    yes: formatMessage({ id: 'dc.select.yes' }),
    no: formatMessage({ id: 'dc.select.no' }),
    dc: formatMessage({ id: 'wrh.index.table.column.dc' }),
    sourceWrhCode: formatMessage({ id: 'wrh.index.table.column.sourceWrhCode' }),
    sourceWrhName: formatMessage({ id: 'wrh.index.table.column.sourceWrhName' })

};