
import React, { Spin, PureComponent } from 'react';
import { Layout, Card, Row, Col, Button ,Icon} from 'antd'
const { Header, Footer, Sider, Content } = Layout;
import { Chart, Util } from '@antv/g2';
import { getOrderCount, getVehicleCount, getJobTodayCount,getTodayCompareOrder,getCollectbin } from '@/services/sjitms/ResourceMoitoring'

export default class CountInfo extends PureComponent {
  componentDidMount() {
    this.onFush();
    this.timingOnFush = setInterval(async ()=>{
      this.onFush();
    },10*60*1000)
  
  }
  state ={
    loading:false

  };
 componentWillUnmount(){
  clearInterval(this.timingOnFush)
 }
  yunlichart;
  bwchart;
  tddbchart;
  colorSet = {
    订单数: 'bb',
    件数:'bb2',
    使用车辆数: 'bb3',
    排车单数:'bb4'
  };
  chartEmt = {
    订单数: this.bbChart,
    件数: this.bb2Chart,
    使用车辆数: this.bb3Chart,
    排车单数:this.bb4Chart
  }
  onFush =()=>{
    
    this.dors();
    this.yunli();
    this.drzys();
    this.bw();
    this.tddb()
  }
  handOnfush=()=>{
    this.setState({loading:true})
    this.onFush();
    setTimeout(()=>this.setState({loading:false}), 1000);
    
  }
  componentDidUpdate() {

  }
  dors = async () => {
    await getOrderCount().then(res => {
      if(res.data==undefined){
        return
      }
      const result = res.data[0];
      const arr = [];
      for (const a in result) {
        const itme = {
          分类: a,
          数量: result[a]
        }
        arr.push(itme);
      }
      this.setState({ orderCount: arr })
    })
  }

  yunli = async () => {
    await getVehicleCount().then(res => {
      if(res.data==undefined){
        return
      }
      const result = res.data[0];
      const arr = [];
      for (const a in result) {
        const itme = {
          type: a,
          value: result[a],
          percent: result[a]
        }
        arr.push(itme);
      }
      this.setState({ vehicleCount: arr })
    })
   if(this.yunlichart){
     this.yunlichart.changeData(this.state.vehicleCount);
     return ;
   }
     this.yunlichart = new Chart({
      container: 'yunli',
      autoFit: true,
      height: 260,
    });

    this.yunlichart.data(this.state.vehicleCount);

    this.yunlichart.coordinate('theta', {
      radius: 0.85
    });

    this.yunlichart.scale('percent', {
      formatter: (val) => {
        // val = val * 100 + '%';
        return val;
      },
    });
   
    this.yunlichart.tooltip({
      showTitle: false,
      showMarkers: false,
    });
   this.yunlichart.axis(false); // 关闭坐标轴
    const interval = this.yunlichart
      .interval()
      .adjust('stack')
      .position('percent')
      .color('type')
      .label('percent', {
        offset: -40,
        style: {
          textAlign: 'center',
          shadowBlur: 2,
          shadowColor: 'rgba(0, 0, 0, .45)',
          fill: '#fff',
        },
      })
      .tooltip('type*percent', (item, percent) => {
        //percent = percent * 100 + '%';
        return {
          name: item,
          value: percent,
        };
      })
      .style({
        lineWidth: 1,
        stroke: '#fff',
      });
      this.yunlichart.interaction('element-single-selected');
      this.yunlichart.render(true);

    // 默认选择
    //interval.elements[0].setState('selected', true);
  }


  bw = async () => {
    await getCollectbin().then(res => {
      if(res.data==undefined){
        return
      }
      const result = res.data[0];
    
      const arr = [];
      for (const a in result) {
        const itme = {
          type: a,
          value: result[a],
          percent: result[a]
        }
        arr.push(itme);
      }
      this.setState({ collectbin: arr })
    })
    if(this.bwchart){
      this.bwchart.changeData(this.state.collectbin);
      return;
    }
    this.bwchart = new Chart({
      container: 'bw',
      autoFit: true,
      height: 258,
    });

    this.bwchart.data(this.state.collectbin);

    this.bwchart.coordinate('theta', {
      radius: 0.85
    });

    this.bwchart.scale('percent', {
      formatter: (val) => {
        // val = val * 100 + '%';
        return val;
      },
    });
    this.bwchart.tooltip({
      showTitle: false,
      showMarkers: false,
    });
    this.bwchart.axis(false); // 关闭坐标轴
    const interval =  this.bwchart
      .interval()
      .adjust('stack')
      .position('percent')
      .color('type')
      .label('percent', {
        offset: -40,
        style: {
          textAlign: 'center',
          shadowBlur: 2,
          shadowColor: 'rgba(0, 0, 0, .45)',
          fill: '#fff',
        },
      })
      .tooltip('type*percent', (item, percent) => {
        //percent = percent * 100 + '%';
        return {
          name: item,
          value: percent,
        };
      })
      .style({
        lineWidth: 1,
        stroke: '#fff',
      });
      this.bwchart.interaction('element-single-selected');
      this.bwchart.render();

    // 默认选择
    //interval.elements[0].setState('selected', true);
  }
  drzys = async () => {
    await getJobTodayCount().then(res => {
      if(res.data==undefined){
        return
      }
      const result = res.data[0];
      const arr = [];
      for (const a in result) {
        const itme = {
          分类: a,
          数量: result[a]
        }
        arr.push(itme);
      }
      this.setState({ jobTodayCount: arr })
    })
  }
  tddb = async () => {
    await getTodayCompareOrder().then(e=>{
     if(e.data==undefined){
      return
    }
     const data =  e.data;
     let params = {};
     data.forEach(element => {
       let arr = [];
        for(const obj in element){
          if(obj!='TYPE'){
            let objs = {
              name :obj,
              value : element[obj]
            }
            arr.push(objs)
          }
         
        }
        params[element['TYPE']] = arr;
     });
     this.setState({tddbData:params});
     var tddbData = this.state.tddbData;
     for(const ss in tddbData){
      if(this.chartEmt[ss]){
        this.chartEmt[ss].changeData(tddbData[ss])
        continue
      }
      this.chartEmt[ss] = new Chart({
        container: this.colorSet[ss],
        autoFit: true,
        //forceFit: true,
        //height:200,
        //width:258
      });
      //chart.legend(false);
     
      this.chartEmt[ss].data(tddbData[ss], {});
      this.chartEmt[ss].axis('name', {
        title: null
      });//.shape('textInterval').
      const arrs = tddbData[ss].map(e=>e.value)
      const number = Math.max.apply(null,arrs);
      this.chartEmt[ss].scale('value', {
        min:0,
        max:number+(number*0.18)
        // tickInterval: 20,
        //nice:false,
      });
      this.chartEmt[ss].interval().position('name*value').color('name',['#4FAAEB', '#FFE78F']
      ).size(30).label("value",{
        //offsetX:22,
        //offsetY:30
      });
      // this.chartEmt[ss].annotation()
      // .text({
      //   position: [item.type, item.value],
      //   content: item.value,
      //   style: {
      //     textAlign: 'center',
      //   },
      //   offsetY: -30,
      // })
      //chart.interval().position('name*value').color('#E4E4E4');//.shape('fallFlag');
      this.chartEmt[ss].render();
     }
    
    })
    
  }

 
  render() {
  
    const { orderCount ,jobTodayCount} = this.state;
    return <Layout style={{ backgroundColor: "#eef1f4",marginTop:-20}}>
      {/* <Header style={{height: '1%',backgroundColor: "#eef1f4"}}>
      </Header> */}
      <Content style={{ backgroundColor: "#eef1f4", height: '99%', padding: '0 5px', lineHeight: '15px' }}>
      <div style={{marginRight:5}}><Button loading={this.state.loading} style = {{backgroundColor: "#ecf0f9  ",float:'right'}}  onClick={()=>this.handOnfush() } icon ='redo'></Button></div>
        <div style={{
          width: '100%',
          //height: '250px',
          //boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)',
          textAlign: 'center',
          display: 'inline-block',
          backgroundColor: '#ecf0f9',
          borderRadius: '2px',
          padding: 2,
          paddingBottom: 5,
          //marginTop:10
        }}>
          {/* <div style={{
            fontSize: 24, fontWeight: 'bold', marginBottom: 30
          }}>
            订单
          </div> */}
          <div>
            {orderCount && <div><Row gutter={16}>
              {orderCount.map((element, index) => {
                //const ss = styles[index];
                return <Col className="gutter-row" span={4}>
                  <Card title={element.分类} bordered={true} hoverable
                    headStyle={{ fontSize: 15, fontWeight: 'bold',backgroundColor:'#002EA6', color: '#FFE78F',borderRadius: '5px 5px 0 0', }}
                    style={{
                      width: '100%',
                      height: '300',
                      // marginBottom: '1%',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                      , fontWeight: 'bold',
                      color: 'white',
                      borderRadius: '5px',
                      fontSize: 18,
                      
                      //background: ss,
                      backgroundColor:'#FFE78F',
                      //opacity:0.7

                    }}
                    bodyStyle={{
                      margin: '4.6% auto',fontWeight:'normal', position: 'relative', width: '100%', padding: '0 0 0 0', textAlign: 'center'
                      ,color: '#002EA6',
                    }}
                  >
                    {element.数量}
                  </Card>
                </Col>
              })}
            </Row></div>}
          </div>

        </div>
        <div style={{ paddingTop: 5,height:270 }}>
          <div style={{
            width: '49.4%',
            //height: '250px',
            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)',
            textAlign: 'center',
            display: 'inline-block',
            backgroundColor: '#ecf0f9',
            borderRadius: '5px',
            float: 'left',
            height:260

          }} >
            {/* <div style={{
              fontSize: 24, fontWeight: 'bold', marginBottom: 30
            }}>
              运力
            </div> */}
            <div style={{height:30,backgroundColor:'#dbf0fd' ,textAlign:'left',paddingLeft:10,paddingTop:6,fontWeight: 'bold',}}>单日作业数</div>
            <div id="drzys" style={{height:'calc(26vh)',padding:5,minHeight:'calc(10vh)'}}>
            {jobTodayCount && <div><Row gutter={[16,8]}>
              {jobTodayCount.map((element, index) => {
                //const ss = styles[index];
                return <Col className="gutter-row" span={8}>
                  <Card title={element.分类} bordered={true} hoverable
                    headStyle={{ fontSize: 15, fontWeight: 'bold',backgroundColor:'#6fa29d', color: '#ffffff',borderRadius: '5px 5px 0 0', }}
                    style={{
                      width: '100%',
                      height: 'calc(12vh)+4px',
                      // marginBottom: '1%',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                      , fontWeight: 'bold',
                      color: 'white',
                      fontSize: 18,
                      borderRadius: '5px',
                      //background: ss,
                      backgroundColor:'#FFE78F',
                      //opacity:0.7

                    }}
                    bodyStyle={{
                      borderRadius: '0 0 5px 5px',
                      margin: '4.6% auto',fontWeight:'normal', position: 'relative', width: '100%', padding: '0 0 0 0', textAlign: 'center'
                      ,color: '#002EA6',
                    }}
                  >
                    {element.数量}
                  </Card>
                </Col>
              })}
            </Row></div>}
            </div>
          </div>
          <div style={{
            width: '24.5%',
            //height: '250px',
            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)',
            textAlign: 'center',
            display: 'inline-block',
            backgroundColor: '#ecf0f9',
            borderRadius: '5px',
            float: 'left',
            marginRight:10,
            marginLeft:10
            

          }} >
            <div style={{height:30,backgroundColor:'#dbf0fd' ,textAlign:'left',paddingLeft:10,paddingTop:6,fontWeight: 'bold',}}>运力</div>
            <div style={{height:230,padding:5}} id="yunli"></div>
          </div>
          <div  style={{
            width: '24.5%',
            //height: '250px',
            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)',
            textAlign: 'center',
            display: 'inline-block',
            backgroundColor: '#ecf0f9',
            borderRadius: '5px',
            float: 'left',
            //height:300
          }} >
          <div style={{height:30,backgroundColor:'#dbf0fd' ,textAlign:'left',paddingLeft:10,paddingTop:6,fontWeight: 'bold',}}>板位</div>
            <div style={{height:230,padding:5}} id ='bw'></div>
          </div>
        </div>
        {/* <div style={{ paddingTop: 5,height:'calc(36vh)',backgroundColor: '#ecf0f9'}}> */}
      
         <div style={{
            width: '100%',
            //height: '250px',
            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)',
            textAlign: 'center',
            display: 'inline-block',
            backgroundColor: '#ecf0f9',
            borderRadius: '2px',
            float: 'right',
            height:'calc(36vh)',
            marginTop: 5
          }} >
           {/* <div style={{height:'13%',backgroundColor:'#dbf0fd' ,textAlign:'left',paddingLeft:10,paddingTop:6,fontWeight: 'bold',}}>昨日与今日数据对比</div>
            <div  style={{height:'100%',padding:5,float:'left',width:'24%',padding:0.5,}}>
              <div id ="bb" style={{height:'76%'}}></div>
              <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',paddingTop:4}}>订单数</div>
            </div>
            <div style={{height:'100%',padding:5 ,float:'left',width:'24%',padding:0.5,}}>
              <div  id ="bb2" style={{height:'76%'}}></div>
              <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',paddingTop:4}}>订单件数</div>
            </div>
            <div style={{height:'100%',padding:5,float:'left',width:'24%',padding:0.5,}}>
              <div style={{height:'76%'}} id ="bb3"></div>
              <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',paddingTop:4}}>使用车辆数</div>
            </div>
            <div style={{height:'100%',padding:5,float:'left',width:'24%',padding:0.5,}} >
              <div id="bb4" style={{height:'76%'}}></div>
              <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',paddingTop:4}}>排车单数</div>
            </div> */}
             <div style={{height:30,backgroundColor:'#dbf0fd' ,textAlign:'left',paddingLeft:10,paddingTop:6,fontWeight: 'bold',marginBottom:'2'}}>昨日与今日数据对比</div>
            <Row gutter={[8,8]}>
            <Col className="gutter-row" span={6}>
              <div style={{height:'calc(31.5vh)',backgroundColor:'#eef1f4', borderRadius:'0 0 2px 2px'}}>
                <div id ="bb" style={{height:'90%'}}></div>
                <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',}}>订单数</div>
              </div>
            </Col>
            <Col className="gutter-row" span={6}>
            <div style={{height:'calc(31.5vh)',backgroundColor:'#eef1f4', borderRadius: '0 0 2px 2px'}}>
              <div  id ="bb2" style={{height:'90%'}}></div>
              <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',}}>订单件数</div>
            </div>
            </Col>
            <Col className="gutter-row" span={6}>
            <div style={{height:'calc(31.5vh)',backgroundColor:'#eef1f4', borderRadius: '0 0 2px 2px'}}>
              <div style={{height:'90%'}} id ="bb3"></div>
              <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',}}>使用车辆数</div>
            </div>
            </Col>
            <Col className="gutter-row" span={6}>
            <div style={{height:'calc(31.5vh)',backgroundColor:'#eef1f4', borderRadius: '0 0 2px 2px'}}>
              <div id="bb4" style={{height:'90%'}}></div>
              <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',}}>排车单数</div>
            </div>
            </Col>
            </Row>
          </div>
        {/* </div> */}
      </Content>
    </Layout>

  }
}