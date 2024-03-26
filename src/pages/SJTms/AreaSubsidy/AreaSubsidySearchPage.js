/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2024-03-26 17:09:12
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import { DndProvider } from 'react-dnd';
import { havePermission } from '@/utils/authority';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import { Button, Modal, Form, Input, DatePicker, message, Spin } from 'antd';
import { bak } from '@/services/sjitms/AreaSubsidy';
import moment from 'moment';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class AreaSubsidySearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    showBak: false,
    loading: false,
    authority: 'sjtms.basic.areasubsidy',
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

  addItem = data => {
    const param = {
      quickuuid: 'sj_itms_areasubsidy',
      params: data ? { entityUuid: data.record.UUID } : {},
      showPageNow: data ? 'update' : 'create',
    };
    this.setState({ param });
    this.createPageModalRef.show();
  };

  handleOk = () => {
    this.setState({ showBak: false, loading: true });
    const { form } = this.props;
    form.validateFields(async (err, fieldsValue) => {
      const response = await bak(
        moment(fieldsValue.beginPeriod.toString()).format('YYYY-MM-DD 00:00:00'),
        moment(fieldsValue.validityPeriod.toString()).format('YYYY-MM-DD 23:59:59'),
        fieldsValue.note
      );
      if (response && response.success) {
        message.success('备份成功');
      } else {
        message.error('备份失败');
      }
      this.setState({ loading: false });
    });
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    const { showBak } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <span>
        <Button
          hidden={!havePermission(this.state.authority + '.createProject')}
          onClick={() => {
            this.addItem();
          }}
        >
          新增方案
        </Button>
        <Button
          hidden={!havePermission(this.state.authority + '.bak')}
          onClick={() => {
            this.setState({ showBak: true });
          }}
        >
          备份
        </Button>
        <Modal
          title="备份"
          visible={showBak}
          onOk={() => {
            this.handleOk();
          }}
          onCancel={() => {
            this.setState({ showBak: false });
          }}
        >
          <Form>
            <Form.Item label="备注" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator('note', { rules: [{ required: true }] })(<Input />)}
            </Form.Item>
            <Form.Item label="开始日期" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator('beginPeriod')(<DatePicker />)}
            </Form.Item>
            <Form.Item label="截止日期" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator('validityPeriod')(<DatePicker />)}
            </Form.Item>
          </Form>
        </Modal>
      </span>
    );
  };

  drawcell = e => {
    if (e.column.fieldName == 'AREACODE') {
      const component = <a onClick={() => this.addItem(e)}>{e.record.AREACODE}</a>;
      e.component = component;
    }
  };

  render() {
    const { loading } = this.state;
    let ret = (
      <Spin spinning={loading}>
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
      </Spin>
    );
    if (this.state.isDrag) {
      return <DndProvider backend={HTML5Backend}>{ret}</DndProvider>;
    } else {
      return ret;
    }
  }
}
