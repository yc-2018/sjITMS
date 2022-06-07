/*
 * @Author: Liaorongchang
 * @Date: 2022-05-31 14:49:23
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-06-07 11:25:30
 * @version: 1.0
 */
import React, { Component } from 'react';
import { Layout, Button, Tree, message, Modal, Empty } from 'antd';
import Page from '@/pages/Component/Page/inner/NewStylePage';
import sourceStyle from './BasicSource.less';
import FormFieldSearchPage from './BasicFormFieldSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import BasicHeadCreatPage from './BasicHeadCreatPage';
import BasicDtlCreatPage from './BasicDtlCreatPage';
import { findSourceTree, deleteSourceTree } from '@/services/sjtms/BasicSource';
import { res } from '@/pages/In/Move/PlaneMovePermission';
import emptySvg from '@/assets/common/img_empoty.svg';

const { Content, Sider } = Layout;
export default class BasicSourceSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      sourceData: [],
      selectedKeys: '',
      rightContent: '',
    };
  }

  componentDidMount = () => {
    this.queryTree();
  };

  queryTree = async () => {
    await findSourceTree().then(async response => {
      if (response && response.success) {
        this.setState({ treeData: response.data });
      }
    });
  };

  drawSider = () => {
    const { treeData, selectedKeys } = this.state;
    return (
      <div>
        <div className={sourceStyle.navigatorPanelWrapper}>
          <div className={sourceStyle.action}>
            <Button type="primary" onClick={this.createHeadOnClick.bind()}>
              新增分类
            </Button>
            <Button type="primary" onClick={this.createDtlOnClick.bind()}>
              新增数据源
            </Button>
            <Button onClick={this.handleDeletetree.bind()}>删除</Button>
          </div>
        </div>
        <Tree
          showLine
          showIcon={true}
          selectable
          selectedKeys={[selectedKeys]}
          onSelect={this.onSelect}
          treeData={treeData}
        />
      </div>
    );
  };

  createHeadOnClick = () => {
    this.headModalRef.show();
  };

  createDtlOnClick = () => {
    this.dtlModalRef.show();
  };

  handleDeletetree = () => {
    const { selectedKeys } = this.state;
    if (!selectedKeys) {
      message.error('请选择一条数据');
      return;
    }
    Modal.confirm({
      title: '确定删除?',
      onOk: async () => {
        await deleteSourceTree(selectedKeys).then(result => {
          if (result.success) {
            message.success('删除成功！');
            this.queryTree();
          } else {
            message.error('删除失败，请刷新后再操作');
          }
        });
      },
    });
  };

  onSelect = (selectedKeys, event) => {
    const { treeData } = this.state;
    const system = treeData.find(x => x.uuid == selectedKeys[0]);
    if (selectedKeys.length == 1) {
      this.setState({
        rightContent: system ? (
          <div>
            <div className={sourceStyle.navigatorPanelWrapper}>
              <span className={sourceStyle.sidertitle}>费用分类</span>
              <div className={sourceStyle.action}>
                <Button type="primary" onClick={e => this.basicHeadCreatPage.onSave(e)}>
                  保存
                </Button>
              </div>
            </div>
            <BasicHeadCreatPage
              key={new Date()}
              quickuuid="cost_form_head"
              showPageNow="update"
              noBorder={true}
              noCategory={true}
              params={{ entityUuid: selectedKeys[0] }}
              onRef={node => (this.basicHeadCreatPage = node)}
            />
          </div>
        ) : (
          <div>
            <FormFieldSearchPage
              key={`Line${selectedKeys[0]}`}
              quickuuid={'cost_form_field'}
              selectedRows={selectedKeys[0]}
              selectedNodes={event.selectedNodes[0]}
            />
          </div>
        ),
        selectedKeys: selectedKeys[0],
      });
    } else {
      this.setState({ rightContent: <></>, selectedKeys: selectedKeys[0] });
    }
  };

  drawContent = () => {
    return this.state.rightContent;
  };

  render() {
    return (
      <Page>
        <Content className={sourceStyle.contentWrapper}>
          <Layout>
            <Sider width={300} style={{ overflow: 'auto', backgroundColor: '#ffffff' }}>
              {this.drawSider()}
            </Sider>
            <Content style={{ backgroundColor: '#ffffff', marginLeft: '8px', paddingLeft: '12px' }}>
              {this.drawContent()}
            </Content>
          </Layout>
        </Content>
        <CreatePageModal
          modal={{
            title: '新增分类',
            width: 500,
            afterClose: () => {
              this.queryTree();
            },
          }}
          page={{ quickuuid: 'cost_form_head', noCategory: true }}
          customPage={BasicHeadCreatPage}
          onRef={node => (this.headModalRef = node)}
        />
        <CreatePageModal
          modal={{
            title: '新增数据源',
            width: 500,
            afterClose: () => {
              this.queryTree();
            },
          }}
          page={{ quickuuid: 'cost_form_children', noCategory: true }}
          customPage={BasicDtlCreatPage}
          onRef={node => (this.dtlModalRef = node)}
        />
      </Page>
    );
  }
}
