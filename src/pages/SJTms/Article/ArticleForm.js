/*
 * @Author: Liaorongchang
 * @Date: 2022-05-25 09:36:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-05-25 12:02:16
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import ArticleCreatePage from './ArticleCreatePage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ArticleForm extends QuickForm {
  drawTab = e => {
    if (e.showPageNow == 'create') {
      const component = <ArticleCreatePage {...e.props} />;
      e.component = component;
    } else if (e.showPageNow === 'update') {
      const component = <ArticleCreatePage {...e.props} />;
      e.component = component;
    }
  };
}
