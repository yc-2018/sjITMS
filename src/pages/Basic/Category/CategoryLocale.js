import { formatMessage } from 'umi/locale';
export const categoryLocale = {
  title: formatMessage({ id: 'category.title' }),
  smallTitle: formatMessage({ id: 'category.small.title' }),
  levelTitle:formatMessage({id:'category.pretype.level.manage'}),
  IPopconfirmTitle: formatMessage({id:'category.IPopconfirmTitle'}),
  level: formatMessage({id:'category.index.table.column.level'}),
  null: '无',
  upperCategory: formatMessage({id:'category.index.table.column.upperCategory.name'}),
  createSubCategory: formatMessage({id:'category.index.table.operate.create.child'}),
  CreateSuperCategory: formatMessage({id:'category.create.super'}),
  ModifySuperCategory: formatMessage({id:'category.modify.super'}),
  ModifyChildCategory: formatMessage({id:'category.modify.child'}),
  CreateChildCategory: formatMessage({id:'category.create.child'}),
};
