/*
 * @Author: guankongjin
 * @Date: 2022-03-09 10:31:16
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-28 16:16:01
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineSystemSearchPage.js
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Switch, Modal, message, Layout, Icon, Tree, Tabs, Input, Upload,Row, Col,Form} from 'antd';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import LineShipAddress from './LineShipAddress';
import LineSystemCreatePage from './LineSystemCreatePage';
import LineMap from './LineMap';
import configs from '@/utils/config';
import { dynamicqueryById, dynamicDelete, dynamicQuery } from '@/services/quick/Quick';
import { loginKey,loginCompany, loginOrg } from '@/utils/LoginContext';
import {
  findLineSystemTree,
  deleteLineSystemTree,
  backupLineSystem,
  isEnable,
  updateState,
} from '@/services/sjtms/LineSystemHis';
import linesStyles from './LineSystem.less';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import Select from '@/components/ExcelImport/Select';
import request from '@/utils/request';

const { Content, Sider } = Layout;
const { TreeNode } = Tree;
const { TabPane } = Tabs;
@connect(({ lineSystem, loading }) => ({
  lineSystem,
  loading: loading.models.lineSystem,
}))
@Form.create()
export default class LineSystemSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineTreeData: [],
      lineData: [],
      expandKeys: [],
      selectLineUuid: '',
      rightContent: '',
      visible: false,
      bfValue: '',
      uploadVisible: false,
      uploadLineVisible:false,
      lineSystemValue:'',
      file:{},
      uploading:false
    };
  }
  componentDidMount() {
    this.queryLineSystem();
  }
  //遍历树
  getLineSystemTree = (data, itemData, lineData) => {
    let treeNode = [];
    let ef = [];
    if (Array.isArray(data)) {
      data.forEach(e => {
        let temp = {};
        temp.value = e.uuid;
        temp.key = e.uuid;
        temp.title = `[${e.code}]` + e.name;
        temp.icon = <Icon type="swap" rotate={90} />;
        // temp.system=true;
        treeNode.push(temp);
        ef.push(e);
        if (data.type == 'lineSystem') {
          //temp.disabled=true;
          temp.system = true;
          temp.selectable = false;
        }
        data.type = 'line' && lineData.push(e);
      });
      itemData.children = treeNode;
      ef.forEach((f, index) => {
        this.getLineSystemTree(f, treeNode[index], lineData);
      });
    } else {
      itemData.value = data.uuid;
      itemData.key = data.uuid;
      itemData.title = `[${data.code}]` + data.name;
      itemData.icon = <Icon type="swap" rotate={90} />;
      if (data.type == 'lineSystem') {
        itemData.system = true;
        // itemData.disabled=true;
        itemData.selectable = false;
      }
      data.type = 'line' && lineData.push(data);

      if (data.childLines) {
        this.getLineSystemTree(data.childLines, itemData, lineData);
      }
    }
  };

  //查询所有线路体系
  queryLineSystem = async lineuuid => {
    await findLineSystemTree({ company: loginCompany().uuid, dcUuid: loginOrg().uuid }).then(
      async response => {
        let lineTreeData = [];
        let lineData = [];
        if (response) {
          const data = response?.data;
          data?.forEach(element => {
            let itemData = {};
            this.getLineSystemTree(element, itemData, lineData);
            lineTreeData.push(itemData);
          });
          if (lineuuid == undefined) {
            lineuuid = lineTreeData
              ? lineTreeData[0]?.children
                ? lineTreeData[0].children[0]?.key
                : lineTreeData[0]?.key
              : undefined;
          }
          this.setState({
            expandKeys: lineTreeData.map(x => x.key),
            lineTreeData,
            lineData,
            selectLineUuid: lineuuid,
          });
          this.onSelect([this.state.selectLineUuid]);
        }
      }
    );
  };
  //查询线路体系下所有线路
  getSerialArchLineList = async defSchemeUuid => {
    const param = {
      tableName: 'SJ_ITMS_LINE',
      condition: {
        params: [{ field: 'systemUuid', rule: 'eq', val: [defSchemeUuid] }],
      },
    };
    return await dynamicqueryById(param);
  };
  //删除体系
  handleDeleteSystem = async systemUuid => {
    const params = [
      {
        tableName: 'SJ_ITMS_LINESYSTEM',
        condition: {
          params: [{ field: 'UUID', rule: 'eq', val: [systemUuid] }],
        },
        deleteAll: 'false',
      },
    ];
    await dynamicDelete({ params, code: 'woxiangyaokuaile' }).then(result => {
      if (result.success) {
        message.success('删除成功！');
        this.queryLineSystem(systemUuid);
      } else {
        message.error('删除失败，请刷新后再操作');
      }
    });
  };
  //删除线路
  handleDeleteLine = lineUuid => {
    Modal.confirm({
      title: '确定删除?',
      onOk: async () => {
        await deleteLineSystemTree(lineUuid).then(result => {
          if (result.success) {
            message.success('删除成功！');
            this.queryLineSystem();
          } else {
            // message.error('删除失败，请刷新后再操作');
          }
        });
      },
    });
  };
  pz = async systemUuid => {
    // const params = [
    //   {
    //     tableName: 'SJ_ITMS_LINESYSTEM',
    //     condition: {
    //       params: [{ field: 'UUID', rule: 'eq', val: [systemUuid] }],
    //     },
    //     deleteAll: 'false',
    //   },
    // ];
    await updateState(systemUuid, 'Approved').then(result => {
      if (result.success) {
        message.success('批准成功！');
        this.queryLineSystem(systemUuid);
      } else {
        message.error('批准失败！');
      }
    });
  };
  qxpz = async systemUuid => {
    await updateState(systemUuid, 'Revising').then(result => {
      if (result.success) {
        message.success('取消批准成功！');
        this.queryLineSystem(systemUuid);
      } else {
        message.error('取消批准失败！');
      }
    });
  };
  zf = async systemUuid => {
    await updateState(systemUuid, 'Discard').then(result => {
      if (result && result.success) {
        message.success('作废成功！');
        this.queryLineSystem();
      } else {
        message.error('作废失败！');
      }
    });
  };
  bf = async () => {
    let params = {
      systemUuid: this.state.selectLineUuid,
      note: this.state.bfValue,
      companyUuid: loginCompany().uuid,
      dispatchcenterUuid: loginOrg().uuid,
    };
    await backupLineSystem(params).then(result => {
      if (result.success) {
        message.success('备份成功！');
        this.setState({ visible: false });
      } else {
        message.error('备份失败！');
      }
    });
  };
  swithChange = async (systemUuid, enable) => {
    isEnable(systemUuid, enable).then(result => {
      if (result && result.success) {
        message.success('操做成功！');
        this.queryLineSystem(systemUuid);
      } else {
        message.error('操做失败！');
      }
    });
  };
  swithCom = async (system, selectedKeys) => {
    if (system) {
      const param = {
        tableName: 'SJ_ITMS_LINESYSTEM',
        condition: {
          params: [{ field: 'UUID', rule: 'eq', val: [selectedKeys] }],
        },
      };
      let isenable = await dynamicQuery(param);
      return isenable.result?.records[0]?.ISENABLE;
    }
  };
  //选中树节点
  onSelect = async (selectedKeys, event) => {
    const { lineTreeData, lineData } = this.state;
    const pdChildren = data => {
      let nodeArr = data.map(item => {
        const node = item.key == selectedKeys[0];
        if (node) {
          return node;
        } else if (item.children) {
          pdChildren(item.children);
        }
      });
      return nodeArr;
    };

    let sdf = pdChildren(lineTreeData);
    if (selectedKeys.length == 1 && selectedKeys[0] == undefined) {
      this.setState({ rightContent: <></>, selectLineUuid: undefined });
      return;
    }
    if (event && !event.selected) return;

    const system = lineTreeData.find(x => x.key == selectedKeys[0]);
    if (!system && sdf?.children) {
      this.setState({ rightContent: <></> });
      return;
    }
    let enable = await this.swithCom(system, selectedKeys[0]);

    this.setState({
      rightContent: system ? (
        <div>
          <div className={linesStyles.navigatorPanelWrapper}>
            <span className={linesStyles.sidertitle}>线路体系</span>
            <div className={linesStyles.action}>
              <Switch
                checkedChildren="启用"
                checked={enable == 1}
                unCheckedChildren="禁用"
                onClick={() => {
                  Modal.confirm({
                    title: enable == 1 ? '确定禁用?' : '确定启用',
                    onOk: () => {
                      this.swithChange(selectedKeys[0], enable == 1 ? 0 : 1);
                    },
                  });
                }}
              />
              <Button
                type="primary"
                onClick={() => {
                  this.setState({ visible: true });
                }}
              >
                备份
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  Modal.confirm({
                    title: '确定批准?',
                    onOk: () => {
                      this.pz(selectedKeys[0]);
                    },
                  });
                }}
              >
                批准
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  Modal.confirm({
                    title: '确定取消批准?',
                    onOk: () => {
                      this.qxpz(selectedKeys[0]);
                    },
                  });
                }}
              >
                取消批准
              </Button>
              <Button
                type="danger"
                onClick={() => {
                  Modal.confirm({
                    title: '确定作废?',
                    onOk: () => {
                      this.zf(selectedKeys[0]);
                    },
                  });
                }}
              >
                作废
              </Button>
              <Button type="primary" icon="plus" onClick={() => this.lineCreatePageModalRef.show()}>
                添加路线
              </Button>
              {/* <Button
                onClick={() => {
                  Modal.confirm({
                    title: '确定删除?',
                    onOk: () => {
                      this.handleDeleteSystem(selectedKeys[0]);
                    },
                  });
                }}
              >
                删除
              </Button> */}
              {/* <Button type="primary" onClick={e => this.lineSystemEditPage.handleSave(e)}>
                保存
              </Button> */}
            </div>
          </div>
          <div style={{ width: '80%' }}>
            <LineSystemCreatePage
              quickuuid="sj_itms_create_linesystem"
              showPageNow="update"
              noBorder={true}
              noCategory={true}
              params={{ entityUuid: selectedKeys[0] }}
              onRef={node => (this.lineSystemEditPage = node)}
            />
          </div>
        </div>
      ) : (
        <Tabs defaultActiveKey={`Tab${selectedKeys[0]}`}>
          <TabPane tab="线路门店" key="1">
            <LineShipAddress
              key={`Line${selectedKeys[0]}`}
              quickuuid="sj_itms_line_shipaddress"
              lineuuid={selectedKeys[0]}
              lineTreeData={this.state.lineTreeData}
              showadfa={this.queryLineSystem}
              linecode={
                lineData.length > 0 ? lineData.find(x => x.uuid == selectedKeys[0]).code : ''
              }
            />
          </TabPane>
          <TabPane tab="门店地图" key="2">
            <LineMap key={`Map${selectedKeys[0]}`} lineuuid={selectedKeys[0]} />
          </TabPane>
        </Tabs>
      ),
      selectLineUuid: selectedKeys[0],
    });
  };
  //展开/收起节点
  onExpand = (_, event) => {
    const { expandKeys } = this.state;
    if (event.expanded) {
      expandKeys.push(event.node.props.eventKey);
    } else {
      expandKeys.splice(expandKeys.indexOf(event.node.props.eventKey), 1);
    }
    this.setState({ expandKeys });
  };

  //绘制左侧菜单栏
  drawSider = () => {
    const { expandKeys, selectLineUuid } = this.state;
    var lineTreeData = JSON.parse(JSON.stringify(this.state.lineTreeData));

    const renderTreeNode = data => {
      let nodeArr = data.map(item => {
        item.title = (
          <div>
            <span>{item.title}</span>
            {item.system || item.key != selectLineUuid ? (
              <span />
            ) : (
              <span>
                <a
                  style={{ marginRight: 15, marginLeft: 5 }}
                  onClick={() => this.lineEditPageModalRef.show()}
                >
                  编辑
                </a>
                <a style={{ marginRight: 15 }} onClick={() => this.handleDeleteLine(item.key)}>
                  删除
                </a>
              </span>
            )}
          </div>
        );
        if (item.children) {
          return (
            <TreeNode title={item.title} key={item.key} dataRef={item}>
              {renderTreeNode(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode title={item.title} key={item.key} />;
      });
      return nodeArr;
    };
    return (
      <div>
        <div className={linesStyles.navigatorPanelWrapper}>
         {/* <span className={linesStyles.sidertitle}>线路体系</span> */}
          <div className={linesStyles.action}>
            <Button type="primary" size='small' onClick={() => this.lineSystemCreatePageModalRef.show()}>
              新建体系
            </Button>
            {/* <Button type="primary"  size='small' onClick={() => this.setState({ uploadVisible: true })}>
              导入体系
            </Button> */}
            <Button type="primary" size='small' onClick={() => this.setState({ uploadLineVisible: true })}>
              导入线路
            </Button>
          </div>
        </div>
        <Tree
          showLine={true}
          showIcon={true}
          selectable
          expandedKeys={expandKeys}
          selectedKeys={[selectLineUuid]}
          onSelect={this.onSelect}
          onExpand={this.onExpand}
        >
          {renderTreeNode(lineTreeData)}
        </Tree>
      </div>
    );
  };

  //绘制右侧内容
  drawContent = () => {
    return this.state.rightContent;
  };
  handleCancel = async () => {
    this.queryLineSystem(this.state.selectLineUuid);
  };
  /**
   * 导入线路
   */
  handleUpload = async() => {
    const { file} = this.state;
    //this.formRef.preventDefault();
    //console.log(this.formRef);
   // this.props.form.preventDefault();
    this.props.form.validateFields((err, fieldsValue) => {
      console.log("as",err);
      if (err) {
        console.log(fieldsValue);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      this.setState({
        uploading: true,
      });
       request(`/itms-schedule/itms-schedule/lineShipAddress/upload/${this.state.lineSystemValue}`, {
        method: 'POST',
        body:formData
        
      }).then (result=>{
        this.setState({uploading:false});
        if(result && result.success){
          message.success('导入成功');
        }
      });
    })
 
  };
  render() {
    const { selectLineUuid } = this.state;
    const { getFieldDecorator} = this.props.form;
    const props = {
      name: 'file',
      action: configs[API_ENV].API_SERVER + '/itms-schedule/itms-schedule/LineSystem/upload',
      headers: {
        //authorization: 'authorization-text',
        iwmsJwt: loginKey(),
      },
      beforeUpload:(flie)=>{
        this.setState({file:flie});
        return false
      },
      accept: '.xlsx',
      onChange(info) {
        if (info.file.status !== 'uploading') {
            //this.setState({fileList:info.fileList[0]})
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} 上传成功`);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} 上传失败`);
        }
      },
    };
    return (
      
      <Content className={linesStyles.contentWrapper}>
        <Layout>
          {/* 左侧内容 */}
          <Sider width={300} className={linesStyles.leftWrapper} style={{ overflow: 'auto' }}>
            {this.drawSider()}
            <CreatePageModal
              modal={{
                title: '新建线路体系',
                width: 500,
                bodyStyle: { marginRight: '40px' },
                afterClose: this.handleCancel,
              }}
              page={{ quickuuid: 'sj_itms_create_linesystem', noCategory: true }}
              onRef={node => (this.lineSystemCreatePageModalRef = node)}
            />
            <CreatePageModal
              modal={{
                title: '添加线路',
                width: 500,
                bodyStyle: { marginRight: '40px' },
                afterClose: this.handleCancel,
              }}
              page={{ quickuuid: 'sj_itms_create_lines', noCategory: true }}
              onRef={node => (this.lineCreatePageModalRef = node)}
            />
            <CreatePageModal
              modal={{
                title: '编辑线路',
                width: 500,
                bodyStyle: { marginRight: '40px' },
                afterClose: this.handleCancel,
              }}
              page={{
                quickuuid: 'sj_itms_create_lines',
                params: { entityUuid: selectLineUuid },
                showPageNow: 'update',
                noCategory: true,
              }}
              onRef={node => (this.lineEditPageModalRef = node)}
            />

            <Modal
              title="备份"
              visible={this.state.visible}
              onOk={this.bf}
              onCancel={() => this.setState({ visible: false })}
            >
              备注：
              <Input
                style={{ width: 200 }}
                onChange={value => {
                  this.setState({ bfValue: value.target.value });
                }}
              />
            </Modal>
            <Modal
              title="导入体系"
              visible={this.state.uploadVisible}
              onOk={this.upload}
              onCancel={() => this.setState({ uploadVisible: false })}
              okButtonProps={{ hidden: true }}
              afterClose={() => this.queryLineSystem()}
              destroyOnClose={true}
            >
              <Upload {...props}>
                <Button>
                  <Icon type="upload" /> 导入
                </Button>
              </Upload>
            </Modal>
            <Modal
              title="导入线路"
              visible={this.state.uploadLineVisible}
              onOk={this.handleUpload}
              confirmLoading = {this.state.uploading}
              onCancel={() => this.setState({ uploadLineVisible: false })}
              //okButtonProps={{ hidden: true }}
              afterClose={() => this.queryLineSystem()}
              destroyOnClose={true}
            >
              <Form ref={(node)=>this.formRef = node}>
              <Row>
                <Col span={12}>
                <Form.Item label="文件">
                {getFieldDecorator('file', {rules: [{ type: 'object', required: true, message: '请选择要导入的文件' }],})(
                <Upload {...props}>
                  <Button >
                    <Icon type="upload" /> 导入
                  </Button>
                </Upload>
                )}
                </Form.Item>
                </Col>
                <Col span ={12}>
                <Form.Item label="体系">
                  {getFieldDecorator('UUID', { rules: [{required: true , message: '请选择体系' }]})(
                    <SimpleAutoComplete
                    showSearch
                    placeholder=""
                    textField="[%CODE%]%NAME%"
                    valueField="UUID"
                    searchField="NAME"
                    //value={this.state.lineSystemValue}
                    queryParams={
                      {
                      tableName: 'SJ_ITMS_LINESYSTEM',
                      condition: 
                      { params: [{ field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
                      { field: 'DISPATCHCENTERUUID', rule: 'eq', val: [loginOrg().uuid]}]},
                    }
                  }
                  onChange = {(e)=>this.setState({lineSystemValue:e})}
                    noRecord
                    style={{width:200}}
                    allowClear={true}
                  />
                  )}
                </Form.Item>
               
                 </Col>
              </Row>
              </Form>
            </Modal>
          </Sider>
          {/* 右侧内容 */}
          <Content className={linesStyles.rightWrapper}>{this.drawContent()}</Content>
        </Layout>
      </Content>
    );
  }
}
