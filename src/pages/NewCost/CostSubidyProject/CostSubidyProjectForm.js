/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-09-13 15:49:13
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CostSubidyProjectSearchPage from './CostSubidyProjectSearchPage';
import ExcelImport from '@/components/ExcelImport';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class CostSubidyProjectForm extends QuickForm {
  onCancel = () => {
    this.switchTab('query');
  };

  drawTab = e => {
    if (e.showPageNow === 'query') {
      const component = <CostSubidyProjectSearchPage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow == 'import') {
      const component = (
        <ExcelImport
          title="费用补贴导入"
          templateType="COSTSUBSIDY"
          dispatch={this.props.dispatch}
          uploadType="costSubsidy/batchImport"
          cancelCallback={this.onCancel}
        />
      );
      e.component = component;
    }
  };
}
