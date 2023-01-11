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
import {
  Button,
  Switch,
  Modal,
  message,
  Layout,
  Icon,
  Tree,
  Tabs,
  Input,
  Upload,
  Row,
  Col,
  Form,
  Divider,
} from 'antd';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import LineShipAddress from './LineShipAddress';
import LineSystemCreatePage from './LineSystemCreatePage';
import LineMap from './LineMap';
import configs from '@/utils/config';
import { dynamicqueryById, dynamicDelete, dynamicQuery } from '@/services/quick/Quick';
import { loginKey, loginCompany, loginOrg } from '@/utils/LoginContext';
import {
  findLineSystemTree,
  deleteLines,
  deleteLineSystemTree,
  backupLineSystem,
  isEnable,
  updateState,
  findLineSystemTreeByStoreCode,
} from '@/services/sjtms/LineSystemHis';
import linesStyles from './LineSystem.less';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import Select from '@/components/ExcelImport/Select';
import request from '@/utils/request';
import ExportJsonExcel from 'js-export-excel';
import { LineSystemAddPage } from './LineSystemAddPage';
import LineShipAddressSearchPage from './LineShipAddressSearchPage';
const { Content, Sider } = Layout;
const { TreeNode } = Tree;
const { TabPane } = Tabs;
import { havePermission } from '@/utils/authority';

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
      uploadLineVisible: false,
      lineSystemValue: '',
      file: {},
      uploading: false,
      authority: props.authority,
      treeuuid :'treeuuid'
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
  // queryLineSystema = async lineuuid => {
  //   await findLineSystemTree({ company: loginCompany().uuid, dcUuid: loginOrg().uuid }).then(
  //     async response => {
  //       let lineTreeData = [];
  //       let lineData = [];
  //       if (response) {
  //         const data = response?.data;
  //         await data?.forEach(element => {
  //           let itemData = {};
  //           this.getLineSystemTree(element, itemData, lineData);
  //           lineTreeData.push(itemData);
  //         });
  //         if (lineuuid == undefined) {
  //           lineuuid = lineTreeData
  //             ? lineTreeData[0]?.children
  //               ? lineTreeData[0].children[0]?.key
  //               : lineTreeData[0]?.key
  //             : undefined;
  //         }
  //         this.setState({
  //           expandKeys: lineTreeData.map(x => x.key),
  //           lineTreeData,
  //           lineData,
  //           selectLineUuid: lineuuid,
  //         });
  //         this.onSelect([this.state.selectLineUuid]);
  //       }
  //     }
  //   );
  // };
  //查询所有线路体系
  queryLineSystem = async lineuuid => {
    const parmas = {
      company: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      code: this.state.lineStoreCode ? this.state.lineStoreCode : '',
    };
    await findLineSystemTreeByStoreCode(parmas).then(response => {
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
          lineuuid = lineTreeData? lineTreeData[0].key:undefined;
          // lineuuid = lineTreeData
          //   ? lineTreeData[0]?.children
          //     ? lineTreeData[0].children[0]?.key
          //     : lineTreeData[0]?.key
          //   : undefined;
        }
       const treeData = {
          expandKeys: lineTreeData.map(x => x.key),
          lineTreeData,
          lineData,
          //selectLineUuid: lineuuid,
          treeuuid:Date.now()
        };
        this.onSelects([lineuuid],treeData);
      }
    });
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
        await deleteLines(lineUuid).then(result => {
          if (result.success && result.data && result.data.success) {
            message.success('删除成功');
            this.queryLineSystem();
          } else {
            message.error(result.data.message);
          }
        });
      },
    });
  };
  onApproval = async (systemUuid, status) => {
    // const params = [
    //   {
    //     tableName: 'SJ_ITMS_LINESYSTEM',
    //     condition: {
    //       params: [{ field: 'UUID', rule: 'eq', val: [systemUuid] }],
    //     },
    //     deleteAll: 'false',
    //   },
    // ];
    await updateState(systemUuid, status).then(result => {
      if (result.success) {
        message.success('操作成功');
        this.queryLineSystem(systemUuid);
      } else {
        message.error('操作成功');
      }
    });
  };
  onCancelApproval = async systemUuid => {
    await updateState(systemUuid, 'Revising').then(result => {
      if (result.success) {
        message.success('取消批准成功！');
        this.queryLineSystem(systemUuid);
      } else {
        message.error('取消批准失败！');
      }
    });
  };
  onInvalid = async systemUuid => {
    await updateState(systemUuid, 'Discard').then(result => {
      if (result && result.success) {
        message.success('作废成功！');
        this.queryLineSystem();
      } else {
        message.error('作废失败！');
      }
    });
  };
  onBackup = async () => {
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
      return isenable.result?.records[0];
    }
  };
  //遍历查找
  pdChildren = (data, selectedKeys) => {
    //let node = {};
    for (const item of data) {
      if (item.key == selectedKeys) {
        return item;
      } else {
        if (item.children) {
          let node = this.pdChildren(item.children, selectedKeys);
          if (node) {
            return this.pdChildren(item.children, selectedKeys);
          }
        }
      }
    }
    return false;
  };
  //选中树节点
  onSelect = async (selectedKeys, event) => {
    const { lineTreeData, lineData } = this.state;
    let Children = await this.pdChildren(lineTreeData, selectedKeys[0]);
    if (selectedKeys.length == 1 && selectedKeys[0] == undefined) {
      this.setState({ rightContent: <></>, selectLineUuid: undefined });
      return;
    }
    if (event && !event.selected) return;
    const systemuuid = lineTreeData.find(x => x.key == selectedKeys[0]);
    const systemData = await this.swithCom(systemuuid, selectedKeys[0]);
    this.setState({
      selectLineUuid: selectedKeys[0],
      systemData: systemData,
      systemuuid: systemuuid,
      sdf: Children,
    });
  };
    //选中树节点
    onSelects = async (selectedKeys,treedata) => {
      const { lineTreeData, lineData } = this.state;
      let sdf = await this.pdChildren(lineTreeData, selectedKeys[0]);
      if (selectedKeys.length == 1 && selectedKeys[0] == undefined) {
        this.setState({ rightContent: <></>, selectLineUuid: undefined });
        return;
      }
      const systemuuid = treedata.lineTreeData.find(x => x.key == selectedKeys[0]);
      const systemData = await this.swithCom(systemuuid, selectedKeys[0]);
      console.log("onsystemuuid",systemuuid,"sdf",sdf);
      console.log("ssds",lineTreeData);
      console.log("treedata",treedata);
      console.log("selectedKeys",selectedKeys[0]);
      this.setState({
        ...treedata,
        selectLineUuid: selectedKeys[0],
        systemData: systemData,
        systemuuid: systemuuid,
        sdf: sdf,
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
    // const formItemLayout = {
    //   labelCol: 8,
    //   wrapperCol: 8,
    // };
    const renderTreeNode = data => {
      let nodeArr = data.map(item => {
        item.title = (
          <div>
            <span>{item.title}</span>
            {item.key != selectLineUuid ? (
              <></>
            ) : item.system ? (
              <a
                style={{ marginRight: 15, marginLeft: 5 }}
                onClick={() => this.lineSystemCreatePageModalRefupdate.show()}
                hidden={!havePermission(this.state.authority + '.leftEdit')}
              >
                编辑
              </a>
            ) : (
              <span>
                <a
                  style={{ marginRight: 15, marginLeft: 5 }}
                  onClick={() => this.lineEditPageModalRef.show()}
                  hidden={!havePermission(this.state.authority + '.leftDelete')}
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
      <div style={{ height: '100%' }}>
        <div className={linesStyles.navigatorPanelWrapper}>
          {/* className={linesStyles.action} */}
          {/* <span className={linesStyles.sidertitle}>线路体系</span> */}

          <div>
            <Row gutter={[_, 2]} align="middle" type="flex">
              <Col span={9}>
                <Input
                  placeholder="线路编号或者门店号"
                  onBlur={e => this.setState({ lineStoreCode: e.target.value })}
                />
              </Col>
              <Col span={3} push={1}>
                <Button type="primary" size="small" onClick={() => this.handleSubmitLine()}>
                  查询
                </Button>
              </Col>
              <Col span={6} push={2}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => this.lineSystemCreatePageModalRef.show()}
                >
                  新建体系
                </Button>
              </Col>
              <Col span={6} push={1}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => this.setState({ uploadLineVisible: true })}
                >
                  导入线路
                </Button>
              </Col>
            </Row>
          </div>
          <div />
        </div>
        <div style={{ height: '90%', overflow: 'auto' }}>
          {this.state.lineTreeData.length> 0 && <Tree
            showLine={true}
            showIcon={true}
            selectable
           // expandedKeys={expandKeys}
            selectedKeys={[selectLineUuid]}
            onSelect={this.onSelect}
           // onExpand={this.onExpand}
           key = {this.state.treeuuid}
           defaultExpandAll
          >
            {renderTreeNode(lineTreeData)}
          </Tree>}
        </div>
      </div>
    );
  };
  downloadTemplate = () => {
    var option = [];
    option.fileName = '线路导入模板'; //导出的Excel文件名
    option.datas = [
      {
        sheetData: [],
        sheetName: '线路', //工作表的名字
        sheetFilter: [],
        sheetHeader: ['门店号', '班组', '门店名称', '调整后线路'],
      },
    ];
    var toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  };
  //绘制右侧内容
  drawContent = () => {
    return <LineShipAddressSearchPage authority={this.props.authority} />;
    //return <></>
    //return this.state.rightContent;
  };
  handleCancel = async () => {
    this.queryLineSystem(this.state.selectLineUuid);
  };

  handleSubmitLine = e => {
    this.queryLineSystem();
  };
  /**
   * 导入线路
   */
  handleUpload = async () => {
    const { file } = this.state;
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      this.setState({
        uploading: true,
      });
      request(`/itms-schedule/itms-schedule/lineShipAddress/upload/${this.state.lineSystemValue}`, {
        method: 'POST',
        body: formData,
      }).then(result => {
        this.setState({ uploading: false });
        if (result && result.success) {
          //message.success('导入成功,共导入'+result.data+'家门店');
          this.setState({
            errorMessage: '导入成功,共导入' + result.data + '家门店',
            errorMessageVisible: true,
          });
        } else {
          this.setState({ errorMessage: result.message, errorMessageVisible: true });
        }
      });
    });
  };
  render() {
    this.lineSystemEditPage?.init();
    const { selectLineUuid, systemuuid } = this.state;
    const { getFieldDecorator } = this.props.form;
    const props = {
      name: 'file',
      action: configs[API_ENV].API_SERVER + '/itms-schedule/itms-schedule/LineSystem/upload',
      headers: {
        //authorization: 'authorization-text',
        iwmsJwt: loginKey(),
      },
      beforeUpload: flie => {
        this.setState({ file: flie });
        return false;
      },
      accept: '.xlsx',
      onChange(info) {
        if (info.file.status !== 'uploading') {
          //this.setState({fileList:info.fileList[0]})
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
          <Sider width={350} className={linesStyles.leftWrapper}>
            {this.state.lineTreeData.length> 0 && this.drawSider()}
            <CreatePageModal
              modal={{
                title: '新建线路体系',
                width: 500,
                bodyStyle: { marginRight: '40px' },
                afterClose: this.handleCancel,
              }}
              page={{
                quickuuid: 'sj_itms_create_linesystem',
                noCategory: true,
                params: { entityUuid: selectLineUuid },
              }}
              onRef={node => (this.lineSystemCreatePageModalRef = node)}
              customPage={LineSystemAddPage}
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
            <CreatePageModal
              modal={{
                title: '编辑线路体系',
                width: 500,
                bodyStyle: { marginRight: '40px' },
                afterClose: this.handleCancel,
              }}
              page={{
                quickuuid: 'sj_itms_create_linesystem',
                noCategory: true,
                params: { entityUuid: selectLineUuid },
                showPageNow: 'update',
              }}
              onRef={node => (this.lineSystemCreatePageModalRefupdate = node)}
              customPage={LineSystemAddPage}
            />

            <Modal
              title="备份"
              visible={this.state.visible}
              onOk={this.onBackup}
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
              title="错误提示"
              visible={this.state.errorMessageVisible}
              onOk={() => this.setState({ errorMessageVisible: false })}
              onCancel={() => this.setState({ errorMessageVisible: false })}
            >
              {this.state.errorMessage?.split(',').map(e => {
                return <p>{e}</p>;
              })}
            </Modal>
            <Modal
              title="导入线路"
              visible={this.state.uploadLineVisible}
              onOk={this.handleUpload}
              confirmLoading={this.state.uploading}
              onCancel={() => this.setState({ uploadLineVisible: false })}
              //okButtonProps={{ hidden: true }}
              afterClose={() => this.queryLineSystem(this.state.selectLineUuid)}
              destroyOnClose={true}
            >
              <Form layout="inline" ref={node => (this.formRef = node)}>
                <Row gutter={[8, 8]}>
                  <Col span={24}>
                    <a onClick={() => this.downloadTemplate()}>点击下载导入模板</a>
                  </Col>
                  <Divider />
                  <Col span={8}>
                    <Form.Item label="文件">
                      {getFieldDecorator('file', {
                        rules: [{ type: 'object', required: true, message: '请选择要导入的文件' }],
                      })(
                        <Upload {...props}>
                          <Button>
                            <Icon type="upload" /> 导入
                          </Button>
                        </Upload>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item label="体系">
                      {getFieldDecorator('UUID', {
                        rules: [{ required: true, message: '请选择体系' }],
                      })(
                        <SimpleAutoComplete
                          showSearch
                          placeholder=""
                          textField="[%CODE%]%NAME%"
                          valueField="UUID"
                          searchField="NAME"
                          //value={this.state.lineSystemValue}
                          queryParams={{
                            tableName: 'SJ_ITMS_LINESYSTEM',
                            isCache: 'false',
                            condition: {
                              params: [
                                { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
                                { field: 'DISPATCHCENTERUUID', rule: 'eq', val: [loginOrg().uuid] },
                              ],
                            },
                          }}
                          onChange={e => this.setState({ lineSystemValue: e })}
                          noRecord
                          style={{ width: 200 }}
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
          <Content className={linesStyles.rightWrapper}>
            {
             selectLineUuid&&<LineShipAddressSearchPage
             selectedKey={selectLineUuid}
             systemuuid={systemuuid}
             lineTreeData={this.state.lineTreeData}
             lineData={this.state.lineData}
             systemData={this.state.systemData}
             queryLineSystem={this.queryLineSystem}
             sdf={this.state.sdf}
             authority={this.props.authority}
           />
            }
            {/* {{this.drawContent()}} */}
            {/* <LineShipAddressSearchPage></LineShipAddressSearchPage> */}
          </Content>
        </Layout>
      </Content>
    );
  }
}
