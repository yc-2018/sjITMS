/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:14
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-16 18:07:40
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, Input } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { saveOrUpdateEntities, dynamicqueryById, dynamicDelete } from '@/services/quick/Quick';
import { add, toQtyStr, accAdd, accMul } from '@/utils/QpcStrUtil';

const formType = [
  { value: 'CARTON', name: '整箱数' },
  { value: 'CARTONWEIGHT', name: '整箱重量' },
  { value: 'CARTONVOLUME', name: '整箱体积' },
  { value: 'SCATTERED', name: '散件' },
  { value: 'SCATTEREDWEIGHT', name: '散件重量' },
  { value: 'SCATTEREDVOLUME', name: '散件体积' },
  { value: 'CONTAINER', name: '周装箱数' },
  { value: 'CONTAINERWEIGHT', name: '周装箱重量' },
  { value: 'CONTAINERVOLUME', name: '周装箱体积' },
];

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class OrderCreatePage extends QuickCreatePage {
  state = {
    ...this.state,
    // articleProp: [],
  };
}
