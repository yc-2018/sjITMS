/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-04-11 16:44:35
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import { Button, Modal, Form, Input, DatePicker, message, Spin } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class AreaSubsidyBakSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    authority: 'sjtms.basic.areasubsidyBak',
  };

  componentDidMount() {
    this.queryCoulumns();
    this.getCreateConfig();
    this.props.onRef && this.props.onRef(this);
  }

  handleOnRow = record => {
    return {
      onClick: () => {
        this.props.refreshSelectedRow(record);
      },
    };
  };

  render() {
    let ret = (
      <div style={{ marginTop: '24px' }}>
        <PageHeaderWrapper>
          <Page withCollect={true} pathname={this.props.pathname}>
            {this.drawPage()}
          </Page>
        </PageHeaderWrapper>
      </div>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
