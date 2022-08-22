import { connect } from 'dva';
import { Form } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { sumBy } from 'lodash';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostWeiShangCreate extends QuickCreatePage {
  exHandleChange = columnEvent => {
    const detailName = 'cost_ws_area_detail';
    const mainName = 'cost_ws_area';
    const { fieldName, valueEvent, line } = columnEvent;
    if ((fieldName == 'PIECE1' || fieldName == 'PIECE5') && valueEvent) {
      let piece1 = this.entity[detailName][line]['PIECE1'];
      let piece5 = this.entity[detailName][line]['PIECE5'];
      this.entity[detailName][line]['PIECE'] =
        Number(piece1 ? piece1 : 0) + Number(piece5 ? piece5 : 0);
      const detailData = this.entity[detailName];
      this.entity[mainName][0]['PIECE_TOTAL'] = sumBy(detailData.map(x => x.PIECE));
    }
  };
}
