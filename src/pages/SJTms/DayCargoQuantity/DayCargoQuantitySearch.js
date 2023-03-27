/*
 * @Author: Liaorongchang
 * @Date: 2022-04-01 15:58:47
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-12-08 16:56:04
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import moment from 'moment';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class DayCargoQuantitySearch extends QuickFormSearchPage {
    editColumns =(data)=>{
          data.columns.forEach(e=>{
            if(e.fieldName=='WAVENUM'){
                e.searchDefVal =  moment(new Date()).format('YYMMDD') + '0001'
            }
        })
        
        return data;
      }
}
