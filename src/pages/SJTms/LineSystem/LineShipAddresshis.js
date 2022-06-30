/*
 * @Author: guankongjin
 * @Date: 2022-03-10 09:59:43
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-28 14:35:37
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineShipAddresshis.js
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class LineShipAddresshis extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
  };
  constructor(props) {
    super(props);
  }
  exSearchFilter = () => {
    return [
      {
        field: 'LINEUUID',
        type: 'VarChar',
        rule: 'eq',
        val: this.props.lineuuid,
      },
    ];
  };
}
