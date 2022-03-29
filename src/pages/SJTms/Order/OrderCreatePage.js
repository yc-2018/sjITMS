/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:14
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-03-28 17:24:00
 * @version: 1.0
 */
import { connect } from 'dva';
import { Form, Input } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { saveOrUpdateEntities, dynamicqueryById, dynamicDelete } from '@/services/quick/Quick';

const formType = [
  { value: 'CARTON', name: '整箱数' },
  { value: 'SCATTERED', name: '散件' },
  { value: 'CONTAINER', name: '周装箱数' },
  { value: 'WEIGHT', name: '重量' },
  { value: 'VOLUME', name: '体积' },
];

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class OrderCreatePage extends QuickCreatePage {
  state = {
    ...this.state,
    articleVolume: '',
    articleWeight: '',
    articlePaq: '',
    containerVolume: 0,
    containerWeight: 0,
    containerQtystr: 0,
    containerQty: 0,
  };

  handleQtystr = (Qtystr, line) => {
    const { articleVolume, articleWeight, articlePaq } = this.state;
    let result = '';
    if (Qtystr.indexOf('+') !== -1) {
      const qtystrList = Qtystr.split('+');
      const qtys = qtystrList[0];
      const qty = qtystrList[1] ? qtystrList[1] : '0';
      result = Number(qtys) + qty / articlePaq;
    } else {
      result = Qtystr;
    }
    const qty = Math.ceil(result * articlePaq);
    const volume = (result * articleVolume).toFixed(4);
    const weight = (result * articleWeight).toFixed(4);
    this.entity['sj_itms_order_article'][line == undefined ? 0 : line]['QTY'] = qty;
    this.entity['sj_itms_order_article'][line == undefined ? 0 : line]['VOLUME'] = volume;
    this.entity['sj_itms_order_article'][line == undefined ? 0 : line]['WEIGHT'] = weight;
    this.props.form.setFieldsValue({
      ['sj_itms_order_article_QTY_' + line]: qty,
      ['sj_itms_order_article_VOLUME_' + line]: volume,
      ['sj_itms_order_article_WEIGHT_' + line]: weight,
    });
  };

  handleContainer = () => {
    const articleDtl = this.entity['sj_itms_order_article'];
    let qtystr = 0;
    let qty = 0;
    let volume = 0;
    let weight = 0;
    articleDtl.forEach(data => {
      qtystr = qtystr + Math.floor(data.QTY / data.QPC);
      qty = qty + Number(data.QTY % data.QPC);
      volume = volume + Number(data.VOLUME).toFixed(4);
      weight = weight + Number(data.WEIGHT).toFixed(4);
    });
    if (!this.entity['sj_itms_order_containernumber'][0]) {
      this.entity['sj_itms_order_containernumber'][0] = {};
    }
    this.entity['sj_itms_order_containernumber'][0]['CARTON'] = qtystr;
    this.entity['sj_itms_order_containernumber'][0]['SCATTERED'] = qty;
    this.entity['sj_itms_order_containernumber'][0]['VOLUME'] = volume;
    this.entity['sj_itms_order_containernumber'][0]['WEIGHT'] = weight;
    this.props.form.setFieldsValue({
      ['sj_itms_order_containernumber_CARTON_0']: qtystr,
      ['sj_itms_order_containernumber_SCATTERED_0']: qty,
      ['sj_itms_order_containernumber_VOLUME_0']: volume,
      ['sj_itms_order_containernumber_WEIGHT_0']: weight,
    });
  };

  beforeSave = data => {
    const { sj_itms_order_containernumber } = this.entity;
    const cc = [];
    cc.push({
      VEHICLETYPE: '整箱',
      FORECASTCOUNT: sj_itms_order_containernumber[0].CARTON,
      FORECASTWEIGHT: sj_itms_order_containernumber[0].WEIGHT,
      FORECASTVOLUME: sj_itms_order_containernumber[0].VOLUME,
    });
    cc.push({
      VEHICLETYPE: '周转箱',
      FORECASTCOUNT: sj_itms_order_containernumber[0].CONTAINER,
      FORECASTWEIGHT: sj_itms_order_containernumber[0].WEIGHT,
      FORECASTVOLUME: sj_itms_order_containernumber[0].VOLUME,
    });
    cc.push({
      VEHICLETYPE: '散件',
      FORECASTCOUNT: sj_itms_order_containernumber[0].SCATTERED,
      FORECASTWEIGHT: sj_itms_order_containernumber[0].WEIGHT,
      FORECASTVOLUME: sj_itms_order_containernumber[0].VOLUME,
    });
    this.entity.sj_itms_order_contaeinernumber = cc;
  };

  exHandleChange = e => {
    const { tableName, fieldName, line, fieldShowType, props, valueEvent } = e;
    const { articleVolume, articleWeight, articlePaq } = this.state;
    if (fieldName == 'QPCSTR') {
      const { LENGTH, WIDTH, HEIGHT, WEIGHT, PAQ } = valueEvent.record;
      const articleVolume = isNaN((LENGTH * WIDTH * HEIGHT) / 1000000)
        ? '0'
        : (LENGTH * WIDTH * HEIGHT) / 1000000;
      const articleWeight = isNaN(WEIGHT / 1000) ? '0' : WEIGHT / 1000;
      const articlePaq = PAQ;
      this.setState({ articleVolume, articleWeight, articlePaq });
    } else if (fieldName == 'QTYSTR') {
      const value = this.convertSaveValue(valueEvent, fieldShowType);
      //货品明细件数
      this.handleQtystr(value, line);
      //容器货品件数
      this.handleContainer();
    }
  };

  drawcell = e => {
    // console.log('drawcell', e);
  };

  formLoaded = () => {
    const { categories, formItems } = this.state;
    categories.push({ category: '业务信息', type: 0 });
    formType.forEach(data => {
      formItems['sj_itms_order_containernumber_' + data.value] = {
        categoryName: '业务信息',
        component: Input,
        fieldName: data.value,
        fieldShowType: 'text',
        key: 'sj_itms_order_containernumber_' + data.value,
        label: data.name,
        tableName: 'sj_itms_order_containernumber',
        props: { disabled: true },
      };
    });
  };
}
