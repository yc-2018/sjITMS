import { formatMessage } from 'umi/locale';
export const dCLocale = {
    title: formatMessage({ id: 'dc.title' }),
    sourceCode: '来源代码',
    codePattern: /^[0-9a-zA-Z]{4}$/,
    codePatternMessage: formatMessage({ id: 'dc.create.form.item.code.validate.message.integrality' }),
    useWMSLocale: formatMessage({ id: 'dc.index.table.column.useWMS' }),
    yes: formatMessage({ id: 'dc.select.yes' }),
    no: formatMessage({ id: 'dc.select.no' }),
    phonePattern: /(\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/,
    phonePatternMessage: '请填入真实的联系方式',
    zipCodePattern: /^[0-9]{6}$/,
    zipCodePatternMessage: '请填入真实的邮编',
};