import { formatMessage } from 'umi/locale';
export const vendorLocale = {
  title: formatMessage({ id: 'vendor.title' }),
  unLoaderTitle: formatMessage({id:'vendor.manage.unLoader'}),
  unLoader: formatMessage({id:'vendor.create.form.item.unLoader.name'}),
  arvType: formatMessage({id:'vendor.create.form.item.arvType.name'}),
  owner: formatMessage({ id: 'vendor.owner' }),
  phonePattern: /^((13[0-9])|(14[0-9])|(15[0-9])|(17[0-9])|(18[0-9]))\d{8}$/,
  phonePatternMessage: '请填入真实的手机号',
  zipCodePattern:/^[0-9]{6}$/,
  zipCodePatternMessage: '请填入真实的邮编',
};