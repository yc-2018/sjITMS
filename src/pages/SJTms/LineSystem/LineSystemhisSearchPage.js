/*
 * @Author: guankongjin
 * @Date: 2022-03-09 10:31:16
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-26 16:34:44
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineSystemSearchPage.js
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Switch, Modal, message, Form, Layout, Menu, Icon, Tree, Tabs } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { convertCodeName } from '@/utils/utils';
import Page from '@/pages/Component/Page/inner/NewStylePage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import LineShipAddresshis from './LineShipAddresshis';
import LineSystemCreatePage from './LineSystemCreatePage';
import LineMap from './LineMap';
import {
  dynamicqueryById,
  dynamicDelete,
  findLineSystemTree,
  deleteLineSystemTree,
  saveOrUpdateEntities,
  approval
} from '@/services/quick/Quick';
import configs from '@/utils/config';
import fetch from 'dva/fetch';
import {findLineSystemHisTree,systemHisExport} from '@/services/sjtms/LineSystemHis'
import linesStyles from './LineSystem.less';
import refundReceiveConfig from '@/models/facility/refundReceiveConfig';
import ExportJsonExcel from 'js-export-excel';

const { Content, Sider } = Layout;
const Item = Menu.Item;
const { SubMenu } = Menu;
const { TreeNode } = Tree;
const { TabPane } = Tabs;
@connect(({ lineSystem, loading }) => ({
  lineSystem,
  loading: loading.models.lineSystem,
}))
export default class LineSystemhisSearchPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lineTreeData: [],
      lineData: [],
      expandKeys: [],
      selectLineUuid: '',
      rightContent: '',
      isNotHd:true
    };
  }
  componentDidMount() {
    this.queryLineSystem();
  }
  //遍历树
  getLineSystemTree =(data,itemData,lineData)=>{
      let treeNode = [];
      let ef = [];
      if(Array.isArray(data)){
        data.forEach(e =>{
         let temp = {};
         temp.value=e.uuid;
         temp.key=e.uuid;
         temp.title =  `[${e.code}]` + e.name;
         temp.type=e.type;
         temp.icon=<Icon type="swap" rotate={90} />;
         treeNode.push(temp);
         ef.push(e);
         temp.selectable = false;
         data.type='line' &&  lineData.push(e);
        })
        itemData.children = treeNode; 
       ef.forEach((f,index)=>{
         this.getLineSystemTree(f,treeNode[index],lineData);
       })
      }else{
       itemData.value=data.uuid;
        itemData.key=data.uuid;
        itemData.title =  `[${data.code}]` + data.name;
        itemData.icon=<Icon type="swap" rotate={90} />;
        itemData.type = data.type;
        itemData.selectable = false;
        } 
        data.type='line' && lineData.push(data);
          
         
        if(data.childLines){
          this.getLineSystemTree(data.childLines,itemData,lineData);
      }
    }
  
  

  //查询所有线路体系
  queryLineSystem = async (lineuuid) => {
    await findLineSystemHisTree().then(async response => {
      let lineTreeData = [];
      let lineData = [];
      if (response) {
        const data = response.data;
        data?.forEach(element => {
          let itemData = {};
          this.getLineSystemTree(element, itemData, lineData);
          lineTreeData.push(itemData);
        });
        if(lineuuid==undefined){
          lineuuid = lineTreeData ? lineTreeData[0]?.children ? lineTreeData[0].children[0]?.key : lineTreeData[0]?.key : undefined
        }
        this.setState({
          expandKeys: lineTreeData.map(x => x.key),
          lineTreeData,
          lineData,
          selectLineUuid:lineuuid
        });
        this.onSelect([this.state.selectLineUuid]);
      }
    });
  };
  //查询线路体系下所有线路
  // getSerialArchLineList = async defSchemeUuid => {
  //   const param = {
  //     tableName: 'SJ_ITMS_LINE_HIS',
  //     condition: {
  //       params: [{ field: 'systemUuid', rule: 'eq', val: [defSchemeUuid] }],
  //     },
  //   };
  //   return await dynamicqueryById(param);
  // };
  
  export =  (selectedKeys)=>{
    systemHisExport(selectedKeys).then(response=>{
      if(response){
       const system = ["版本号","体系编号","体系名称","备注","线路编号","线路名称","上级线路名称","上级线路编号"];
       const address = ["线路编号","线路名称","送货点编号","送货点名称"];
       var option = [];
      const sytemCode = ["version","systemCode","systemName","note","lineCode","lineName","parentName","parentCode"];
      const addressCode = ["lineCode","lineName","addressCode","addressName"];
      option.fileName= response.data.tableName
      option.datas = [
        {
          sheetData: response.data.systemExcelList?response.data.systemExcelList:[],
          sheetName: response.data.sheet1, //工作表的名字
          sheetFilter: sytemCode,
          sheetHeader: system,
        },
      ];
        option.datas.push({
          sheetData: response.data.lineAddressHisExcels?response.data.lineAddressHisExcels:[],
          sheetName: response.data.sheet2, //工作表的名字
          sheetFilter: addressCode,
          sheetHeader: address,
        },)
      const toExcel = new ExportJsonExcel(option);
      toExcel.saveExcel();
    }
    });
  
  }

  //选中树节点
  onSelect = (selectedKeys, event) => {
    if (event && !event.selected) return;
    const { lineTreeData, lineData } = this.state;
    if( selectedKeys[0]==undefined || selectedKeys[0].split("-")[1]=="systemCode"){
      this.setState({rightContent:<></>})
      return;
    }
    selectedKeys = [selectedKeys[0].split("-")[0]];
    const system = lineTreeData.find(x => x.children.find(f=>f.key==selectedKeys[0]));
    this.setState({
      rightContent: system ? (
        <div>
          <div className={linesStyles.navigatorPanelWrapper}>
            <span className={linesStyles.sidertitle}>线路体系</span>  
            <div className={linesStyles.action}> 
            <Button   type="primary" onClick={
              () => {            
                Modal.confirm({
                 title: '确定导出吗？',
                 onOk: () => {
                  this.export(selectedKeys[0]);
                 },
               });
             }
            }>导出</Button>
            </div>
          </div>
          <LineSystemCreatePage
            key={new Date()}
            quickuuid="sj_itms_linesystem_his"
            showPageNow="update"
            noBorder={true}
            noCategory={true}
            params={{ entityUuid: selectedKeys[0]}}
            onRef={node => (this.lineSystemEditPage = node)}
          />
        </div>
      ) : (
        <Tabs defaultActiveKey={`Tab${selectedKeys[0]}`}>
          <TabPane tab="线路门店" key="1">
            <LineShipAddresshis
              key={`Line${selectedKeys[0]}`}
              quickuuid="sj_itms_line_shipaddress_his"
              lineuuid={selectedKeys[0]}
              lineTreeData={this.state.lineTreeData}
              showadfa = {this.queryLineSystem}
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
        item.title = <span>{item.title}</span>;
        if (item.children) {
          return (
            <TreeNode title={item.title} key={item.key+"-"+item.type} dataRef={item}>
              {renderTreeNode(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode title={item.title} key={item.key+"-"+item.type} />;
      });
      return nodeArr;
    };
    return (
      <div>
        <div className={linesStyles.navigatorPanelWrapper}>
          <span className={linesStyles.sidertitle}>历史线路体系</span>
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
  handleCancel = async ()=>{
    this.queryLineSystem(this.state.selectLineUuid);
   
  }

  render() {
    const { createSystemModalVisible, createLineModalVisible, selectLineUuid } = this.state;
    return (
          <Page withCollect={true} pathname={this.props.location ? this.props.location.pathname : ''}>
          <Content className={linesStyles.contentWrapper}>
            <Layout>
              {/* 左侧内容 */}
              <Sider width={300} className={linesStyles.leftWrapper} style={{overflow:'auto'}}>
                {this.drawSider()}
              </Sider>
              {/* 右侧内容 */}
              <Content className={linesStyles.rightWrapper}>{this.drawContent()}</Content>
            </Layout>
          </Content>
        </Page>
        
    );
  }
}