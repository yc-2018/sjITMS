import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import { Form, Input, Upload, Button, Icon, message, Select, Tabs, Layout,Spin ,Card, Row, Col} from 'antd';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import { savePlan } from '@/services/cost/Cost';
import Page from '@/pages/Component/Page/inner/Page';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
// import QuickFormSearchPage from './CostProjectSearch';
// import CostProjectCreate from './CostProjectCreate';
import QuickForm from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickForm';
import CreatePage from '@/pages/Component/RapidDevelopment/CommonLayout/CreatePage';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import CostPlanSearch from './CostPlanSearch'
import Item from 'antd/lib/list/Item';
import SearchForm from '@/pages/Component/Form/SearchForm';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { dynamicQuery } from '@/services/quick/Quick';
import { res } from '@/pages/In/Move/PlaneMovePermission';
const { Header, Footer, Sider, Content } = Layout;
const { TabPane } = Tabs
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class CostPlanIndex  extends PureComponent{
  state = {
    ...this.state,
    isNotHd: true,
    filelist: [],
    title:"计费方案",
    data :[],
  }
  componentDidMount(){
    console.log("componentDidMount");
    const params = {
      tableName:"COST_PLAN"
      
      }
    
    dynamicQuery(params).then(e=>{
    this.setState({data:e})
   });
  }
  onClickPlan = (e)=>{
   this.props.switchTab("update",{entityUuid:e});
    console.log("e",e);
  }
  drowe =  ()=>{
    if(this.state.data.length==0){
      return ;
    }
    console.log(this.state);
    const{records} = this.state.data?.result;
    let ros = [];
    if(records){
      // for(var f = 0;f<records.length;f+=4){
      //     let children = [];
      //   for(var i = f;i<f+4 && i<records.length;i++){
      //     children.push(<Col span={6}>
      //       <Card hoverable 
      //          key={records[i].UUID}
      //          headStyle={{backgroundColor:'#3B77E3',color:'#fff'}}
      //          title={records[i].SCHEME_NAME}
      //          extra={<a href="#">More</a>} 
      //          style={{ width: 300,border:'0.5px solid #3B77E3'}}
      //          actions ={[<Button type='primary' onClick={()=>{this.onClickPlan(records[i].UUID)}}>编辑</Button>,<Button type ="danger">禁用</Button>]}
      //          >
      //       </Card>
      //     </Col>)
           
      //   }
      //   ros.push(<Row align = "flex" style={{paddingBottom:20}} children= {children}/>);
      // }
      let ssds = [];
      for(var i = 0;i<records.length;i++){
        ssds.push()
      }
      
     return  <Row children={records.map(e=>{return <Col style={{paddingBottom:20}} span={6}>
      <Card hoverable 
         key={e.UUID}
         headStyle={{backgroundColor:'#3B77E3',color:'#fff'}}
         title={e.SCHEME_NAME}
         extra={<a href="#">More</a>} 
         style={{ width: 300,border:'0.5px solid #3B77E3'}}
         actions ={[<Button type='primary' onClick={()=>this.onClickPlan(e.UUID)}>编辑</Button>,<Button type ="danger">禁用</Button>]}
         >
      </Card>
    </Col>})}   style={{paddingBottom:20}} gutter ={4}/>
   // console.log("ros",ros);
    //return ros;
     
  }}
  handleShowExcelImportPage =()=>{
    console.log("props",this.props);
      this.props.switchTab("create");
  }
  onCreate =()=>{}
  drawButtion =()=>{
    return <>
    <Button 
    onClick={() => this.handleShowExcelImportPage()}>
    {'添加'}
  </Button>
  <Button icon="plus" type="primary"
    onClick={this.onCreate.bind(this, '')}>
    {'保存'}
  </Button>
  </>
  }
  render() {
    console.log("render");
    const layout = {
      width :'100%',
      height:'100%'

    }
    return <PageHeaderWrapper>
          <Spin indicator={LoadingIcon('default')} delay={5} spinning={this.props.loading}>
            <Page withCollect={true}>
              <Card bordered={false}>
                <NavigatorPanel style={{ marginTop:'-24px',marginLeft:'-22px' }} title={this.state.title} action={this.drawButtion()}/>
                <Layout style={{width :'100%',height:'600px'}}>
                <Header style={{backgroundColor:'white'}}>{this.drForm}</Header>
                <Content style={{overflow:true,backgroundColor:'white'}}>
                  {this.drowe()}
                </Content>
                <Footer></Footer>
              </Layout>
              </Card>
            </Page>
          </Spin>
        </PageHeaderWrapper>
   
  }
}
