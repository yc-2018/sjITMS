/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:14
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-04 16:28:35
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
    articleProp: [],
  };

  handleQtystr = (Qtystr, line, tableName) => {
    const { articleProp } = this.state;
    console.log('articleProp', articleProp);
    const { articlePaq, articleVolume, articleWeight } = articleProp.find(x => x.line == line);
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
    const volume = accMul(result, articleVolume).toFixed(4);
    const weight = accMul(result, articleWeight).toFixed(4);
    this.entity[tableName][line == undefined ? 0 : line]['QTY'] = qty;
    this.entity[tableName][line == undefined ? 0 : line]['VOLUME'] = volume;
    this.entity[tableName][line == undefined ? 0 : line]['WEIGHT'] = weight;
    this.props.form.setFieldsValue({
      [tableName + '_QTY_' + line]: qty,
      [tableName + '_VOLUME_' + line]: volume,
      [tableName + '_WEIGHT_' + line]: weight,
    });
  };

  handleContainer = () => {
    const { articleProp } = this.state;
    const articleDtl = this.entity['SJ_ITMS_ORDER_ARTICLE'];
    let qtystr = 0;
    let qty = 0;
    let cartonVolume = 0;
    let cartonweight = 0;
    let scatteredVolume = 0;
    let scatteredWeight = 0;
    articleDtl.forEach(data => {
      const { articleVolume, articleWeight } = articleProp.find(x => x.line == data.line - 1);

      qtystr = qtystr + Math.floor(data.QTY / data.QPC);
      qty = qty + Number(data.QTY % data.QPC);
      cartonVolume = accAdd(
        cartonVolume,
        accMul(Math.floor(data.QTY / data.QPC), articleVolume)
      ).toFixed(4);
      cartonweight = accAdd(
        cartonweight,
        accMul(Math.floor(data.QTY / data.QPC), articleWeight)
      ).toFixed(4);
      scatteredVolume = accAdd(
        scatteredVolume,
        accMul(Number(data.QTY % data.QPC) / data.QPC, articleVolume)
      ).toFixed(4);
      scatteredWeight = accAdd(
        scatteredWeight,
        accMul(Number(data.QTY % data.QPC) / data.QPC, articleWeight)
      ).toFixed(4);
    });

    if (!this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]) {
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0] = {};
    }

    this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CARTON'] = qtystr;
    this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['SCATTERED'] = qty;
    this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CONTAINER'] = 0;
    this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CARTONVOLUME'] = cartonVolume;
    this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CARTONWEIGHT'] = cartonweight;
    this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['SCATTEREDVOLUME'] = scatteredVolume;
    this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['SCATTEREDWEIGHT'] = scatteredWeight;
    this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CONTAINERVOLUME'] = 0;
    this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CONTAINERWEIGHT'] = 0;

    this.props.form.validateFields();
    // this.props.form.setFieldsValue({
    //   ['SJ_ITMS_ORDER_CONTAINERNUMBER_CARTON_0']: qtystr,
    //   ['SJ_ITMS_ORDER_CONTAINERNUMBER_SCATTERED_0']: qty,
    //   ['SJ_ITMS_ORDER_CONTAINERNUMBER_CONTAINER_0']: 0,
    //   ['SJ_ITMS_ORDER_CONTAINERNUMBER_CARTONVOLUME_0']: cartonVolume,
    //   ['SJ_ITMS_ORDER_CONTAINERNUMBER_CARTONWEIGHT_0']: cartonweight,
    //   ['SJ_ITMS_ORDER_CONTAINERNUMBER_SCATTEREDVOLUME_0']: scatteredVolume,
    //   ['SJ_ITMS_ORDER_CONTAINERNUMBER_SCATTEREDWEIGHT_0']: scatteredWeight,
    //   ['SJ_ITMS_ORDER_CONTAINERNUMBER_CONTAINERVOLUME_0']: 0,
    //   ['SJ_ITMS_ORDER_CONTAINERNUMBER_CONTAINERWEIGHT_0']: 0,
    // });
  };

  beforeSave = data => {
    const { SJ_ITMS_ORDER_CONTAINERNUMBER, SJ_ITMS_ORDER } = this.entity;
    const cc = [];
    cc.push({
      VEHICLETYPE: '整箱',
      FORECASTCOUNT: SJ_ITMS_ORDER_CONTAINERNUMBER[0].CARTON,
      FORECASTWEIGHT: SJ_ITMS_ORDER_CONTAINERNUMBER[0].CARTONWEIGHT,
      FORECASTVOLUME: SJ_ITMS_ORDER_CONTAINERNUMBER[0].CARTONVOLUME,
    });
    cc.push({
      VEHICLETYPE: '周转箱',
      FORECASTCOUNT: SJ_ITMS_ORDER_CONTAINERNUMBER[0].CONTAINER,
      FORECASTWEIGHT: SJ_ITMS_ORDER_CONTAINERNUMBER[0].CONTAINERWEIGHT,
      FORECASTVOLUME: SJ_ITMS_ORDER_CONTAINERNUMBER[0].CONTAINERVOLUME,
    });
    cc.push({
      VEHICLETYPE: '散件',
      FORECASTCOUNT: SJ_ITMS_ORDER_CONTAINERNUMBER[0].SCATTERED,
      FORECASTWEIGHT: SJ_ITMS_ORDER_CONTAINERNUMBER[0].SCATTEREDWEIGHT,
      FORECASTVOLUME: SJ_ITMS_ORDER_CONTAINERNUMBER[0].SCATTEREDVOLUME,
    });
    this.entity.SJ_ITMS_ORDER_CONTAINERNUMBER = cc;

    if (!SJ_ITMS_ORDER[0].STAT) {
      SJ_ITMS_ORDER[0].STAT = 'Saved';
    }
  };

  exHandleChange = e => {
    const { tableName, fieldName, line, fieldShowType, props, valueEvent } = e;
    const { articleProp } = this.state;
    if (fieldName == 'QPCSTR') {
      const { LENGTH, WIDTH, HEIGHT, WEIGHT, PAQ } = valueEvent.record;
      const articleVolume = isNaN((LENGTH * WIDTH * HEIGHT) / 1000000)
        ? '0'
        : (LENGTH * WIDTH * HEIGHT) / 1000000;
      const articleWeight = isNaN(WEIGHT / 1000) ? '0' : WEIGHT / 1000;
      const articlePaq = PAQ ? PAQ : 0;

      const index = articleProp.findIndex(x => x.line == line);
      if (index < 0) {
        const newArticleProp = articleProp.concat({
          line: line,
          articleVolume: articleVolume,
          articleWeight: articleWeight,
          articlePaq: articlePaq,
        });
        this.setState({ articleProp: newArticleProp });
      } else {
        articleProp[index] = {
          line: line,
          articleVolume: articleVolume,
          articleWeight: articleWeight,
          articlePaq: articlePaq,
        };
        this.setState({ articleProp }, () => {
          this.handleQtystr('0', line, tableName);
        });
      }

      this.entity[tableName][line == undefined ? 0 : line]['QTYSTR'] = 0;
      this.props.form.setFieldsValue({ [tableName + '_QTYSTR_' + line]: 0 });
    } else if (fieldName == 'QTYSTR') {
      const value = this.convertSaveValue(valueEvent, fieldShowType);
      //货品明细件数
      this.handleQtystr(value, line, tableName);
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
      formItems['SJ_ITMS_ORDER_CONTAINERNUMBER_' + data.value] = {
        categoryName: '业务信息',
        component: Input,
        fieldName: data.value,
        fieldShowType: 'text',
        key: 'SJ_ITMS_ORDER_CONTAINERNUMBER_' + data.value,
        label: data.name,
        tableName: 'SJ_ITMS_ORDER_CONTAINERNUMBER',
        props: { disabled: true },
      };
    });
    if (this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]) {
      const data = this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'];
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CARTON'] = data[2].FORECASTCOUNT;
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['SCATTERED'] = data[1].FORECASTCOUNT;
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CONTAINER'] = data[0].FORECASTCOUNT;
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CARTONVOLUME'] = data[2].FORECASTVOLUME;
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CARTONWEIGHT'] = data[2].FORECASTWEIGHT;
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['SCATTEREDVOLUME'] = data[1].FORECASTVOLUME;
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['SCATTEREDWEIGHT'] = data[1].FORECASTWEIGHT;
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CONTAINERVOLUME'] = data[0].FORECASTVOLUME;
      this.entity['SJ_ITMS_ORDER_CONTAINERNUMBER'][0]['CONTAINERWEIGHT'] = data[0].FORECASTWEIGHT;
      this.props.form.validateFields();
    }
  };
}
