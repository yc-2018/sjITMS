/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:14
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-14 16:29:11
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

  beforeSave = data => {
    const { SJ_ITMS_ORDER, SJ_ITMS_ORDERDTL } = this.entity;

    if (SJ_ITMS_ORDER[0].STAT == 'Saved') {
      SJ_ITMS_ORDERDTL.forEach((data, index, array) => {
        data.LINE = index + 1;
        data.REALCOUNT = 0;
        data.REALWEIGHT = 0;
        data.REALVOLUME = 0;
        data.ALREADYCOUNT = 0;
        data.SCHEDULED = 0;
      });
    }
  };
}
