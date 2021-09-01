import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Layout, Button, Icon, Empty, message } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import styles from './RelationPlanBill.less';
import TodoShipPlanBill from './TodoShipPlanBill';
import NewShipPlanBill from './NewShipPlanBill';
import emptySvg from '@/assets/common/img_empoty.svg';

const { Content, Sider,Header, Footer, } = Layout;

@connect(({ relationplanbill, loading }) => ({
  relationplanbill,
  loading: loading.models.relationplanbill,
}))
export default class RelationPlanBill extends PureComponent {
  constructor(props){
    super(props);

    this.state = {
      todoList:[],
      newList:[],
      targetShipPlanBill:{}
    }
  }
  onTodoShipBillRef =(ref)=>{
    this.todoShipPlanBillRef=ref;
  }

  onNewShipBillRef =(ref)=>{
    this.newShipPlanBillRef=ref;
  }

  /**
   * 左到右
   */
  onClickToNew = ()=>{
    let list = [];
    if(this.state.targetShipPlanBill.relationPlanBillNum){
      message.warning('当前排车单已移车，不允许再次移车！');
      return;
    }
    list = this.todoShipPlanBillRef.getSelectRows&&this.todoShipPlanBillRef.getSelectRows();

    this.setState({
      todoList:list,
    })
  }
  /**
   * 右到左
   */
  onClickToDo= ()=>{
    let list = [];
    if(this.state.targetShipPlanBill.relationPlanBillNum){
      message.warning('当前排车单已移车，不允许再次移车！');
      return;
    }
    list = this.newShipPlanBillRef.getSelectRows&&this.newShipPlanBillRef.getSelectRows();

    this.setState({
      newList:list,
    })
  }

  refreshTodoBillPage = ()=>{
    this.todoShipPlanBillRef.resetValue&&this.todoShipPlanBillRef.resetValue();
    this.setState({
      targetShipPlanBill:{}
    })
  }

  targetShipPlanBillToNew = (data)=>{
    this.setState({
      targetShipPlanBill:data
    })
  }

  render() {
    const { shipBill,todoList,newList,targetShipPlanBill } = this.state;
    return  <PageHeaderWrapper>
      <Page>
        <Content className={styles.contentWrapper}>
          <Layout>
              <Sider width='50%' className={styles.leftWrapper}>
                <div style={{display:'flex',justifyContent:'space-around',minHeight:'825px'}}>
                  <TodoShipPlanBill 
                    onRef={this.onTodoShipBillRef} 
                    newList={newList}
                    targetShipPlanBillToNew = {this.targetShipPlanBillToNew}
                  />
                  <div style={{paddingTop:'50%'}}>
                    <Button style={{width:'35px',height:'80px',paddingRight:0,paddingLeft:0}} onClick={()=>this.onClickToNew()}><Icon type="right" /></Button>
                    <Button style={{width:'35px',height:'80px',paddingRight:0,paddingLeft:0}} onClick={()=>this.onClickToDo()}><Icon type="left" /></Button>
                  </div>
                </div>
              </Sider>
              <Content className={styles.rightWrapper}>
                <NewShipPlanBill 
                  onRef={this.onNewShipBillRef} 
                  todoList={todoList}
                  targetShipPlanBill ={targetShipPlanBill} 
                  refreshTodoBillPage ={this.refreshTodoBillPage}
                />
              </Content>
          </Layout>
        </Content>
      </Page>
    </PageHeaderWrapper>;
}
}
