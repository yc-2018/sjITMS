/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-12 09:51:03
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { cancelIssue, applyIssue } from '@/services/sjitms/ETCIssueAndRecycle';
import { message, Popconfirm, Button } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreTeamHeadSearchPage extends QuickFormSearchPage {
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

  addItem = data => {
    const param = {
      quickuuid: 'sj_itms_storeteam_head',
      params: data ? { entityUuid: data.record.UUID } : {},
      showPageNow: data ? 'update' : 'create',
    };
    this.setState({ param });
    this.createPageModalRef.show();
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    return (
      <span>
        <Button
          onClick={() => {
            this.addItem();
          }}
        >
          新增方案
        </Button>
      </span>
    );
  };

  drawcell = e => {
    if (e.column.fieldName == 'CODE') {
      const component = <a onClick={() => this.addItem(e)}>{e.record.CODE}</a>;
      e.component = component;
    }
  };

  render() {
    let ret = (
      <div style={{ marginTop: '24px' }}>
        <PageHeaderWrapper>
          <Page withCollect={true} pathname={this.props.pathname}>
            {this.drawPage()}
          </Page>
        </PageHeaderWrapper>
        <CreatePageModal
          modal={{
            afterClose: () => {
              this.queryCoulumns();
            },
          }}
          page={this.state.param}
          onRef={node => (this.createPageModalRef = node)}
        />
      </div>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
