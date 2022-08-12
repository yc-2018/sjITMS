
import React, { Spin, PureComponent } from 'react';
import { Layout, Card, Row, Col } from 'antd'
const { Header, Footer, Sider, Content } = Layout;
import { Chart, Util } from '@antv/g2';
import { getOrderCount, getVehicleCount, getJobTodayCount,getTodayCompareOrder,getCollectbin } from '@/services/sjitms/ResourceMoitoring'

export default class CountInfo extends PureComponent {
  componentDidMount() {
    this.dors();
    this.yunli();
    this.drzys();
    this.bw();
    this.tddb();
  }
  state = {

  }
  componentDidUpdate() {

  }
  dors = async () => {
    await getOrderCount().then(res => {
      if(res.data==undefined){
        return
      }
     // debugger
      const result = res.data[0];
      const arr = [];
      //debugger;
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
    const chart = new Chart({
      container: 'yunli',
      autoFit: true,
      height: 260,
    });

    chart.data(this.state.vehicleCount);

    chart.coordinate('theta', {
      radius: 0.85
    });

    chart.scale('percent', {
      formatter: (val) => {
        // val = val * 100 + '%';
        return val;
      },
    });
    chart.tooltip({
      showTitle: false,
      showMarkers: false,
    });
    chart.axis(false); // 关闭坐标轴
    const interval = chart
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
    chart.interaction('element-single-selected');
    chart.render();

    // 默认选择
    interval.elements[0].setState('selected', true);
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
    const chart = new Chart({
      container: 'bw',
      autoFit: true,
      height: 258,
    });

    chart.data(this.state.collectbin);

    chart.coordinate('theta', {
      radius: 0.85
    });

    chart.scale('percent', {
      formatter: (val) => {
        // val = val * 100 + '%';
        return val;
      },
    });
    chart.tooltip({
      showTitle: false,
      showMarkers: false,
    });
    chart.axis(false); // 关闭坐标轴
    const interval = chart
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
    chart.interaction('element-single-selected');
    chart.render();

    // 默认选择
    //interval.elements[0].setState('selected', true);
  }
  drzys = async () => {
    await getJobTodayCount().then(res => {
      debugger;
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
    var colorSet = {
      订单数: 'bb',
      件数: 'bb2',
      使用车辆数: 'bb3',
      排车单数:'bb4'
    };
    await getTodayCompareOrder().then(e=>{
     // debugger
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
      var chart = new Chart({
        container: colorSet[ss],
        autoFit: true,
        //forceFit: true,
        //height:200,
        //width:258
      });
      //chart.legend(false);
     
      chart.data(tddbData[ss], {
        // value: {
        //   alias: '访问数'
        // },
        // name: {
        //   alias: '步骤名称'
        // }
      });
      chart.axis('name', {
        title: null
      });//.shape('textInterval').
      chart.scale('sales', {
        // tickInterval: 20,
        nice: true
      });
      chart.interval().position('name*value').color('name',['#4FAAEB', '#FFE78F']
      ).size(30).label("value");
      //chart.interval().position('name*value').color('#E4E4E4');//.shape('fallFlag');
      chart.render();
     }
    
    })
    
  }

 
  render() {
    // const styles = [
    //   "#3e1ec0",
    //   "#4abf2e",
    //   "#cb6917",
    //   "#b40466",
    //   "#365ceb",
    //   "#a1c606"
    // ]
    const { orderCount ,jobTodayCount} = this.state;
   // debugger;
    return <Layout>
      <Content style={{ backgroundColor: "#eef1f4", height: '800', padding: '0 5px', lineHeight: '15px' }}>
        <div style={{
          width: '100%',
          //height: '250px',
          //boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)',
          textAlign: 'center',
          display: 'inline-block',
          backgroundColor: '#ecf0f9',
          borderRadius: '2px',
          padding: 2,
          paddingBottom: 5
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
            <div id="drzys" style={{height:230,padding:5}}>
            {jobTodayCount && <div><Row gutter={[16,16]}>
              {jobTodayCount.map((element, index) => {
                //const ss = styles[index];
                return <Col className="gutter-row" span={8}>
                  <Card title={element.分类} bordered={true} hoverable
                    headStyle={{ fontSize: 15, fontWeight: 'bold',backgroundColor:'#6fa29d', color: '#ffffff',borderRadius: '5px 5px 0 0', }}
                    style={{
                      width: '100%',
                      height: '300',
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
        <div style={{ paddingTop: 5,height:240,backgroundColor: '#ecf0f9'}}>
      
         <div style={{
            width: '100%',
            //height: '250px',
            boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19)',
            textAlign: 'center',
            display: 'inline-block',
            backgroundColor: '#ecf0f9',
            borderRadius: '2px',
            float: 'right',
            height:290.5

          }} >
           <div style={{height:30,backgroundColor:'#dbf0fd' ,textAlign:'left',paddingLeft:10,paddingTop:6,fontWeight: 'bold',}}>昨日与今日数据对比</div>
            <div  style={{height:'90%',padding:5,float:'left',width:'24%',backgroundColor:'',padding:0.5}}>
              <div id ="bb" style={{height:'90%'}}></div>
              <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',paddingTop:4}}>订单数</div>
            </div>
            <div style={{height:'90%',padding:5 ,float:'left',width:'24%',backgroundColor:'',padding:0.5}}>
              <div  id ="bb2" style={{height:'90%'}}></div>
              <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',paddingTop:4}}>订单件数</div>
            </div>
            <div style={{height:'90%',padding:5,float:'left',width:'24%',backgroundColor:'',padding:0.5}}>
            <div style={{height:'90%'}} id ="bb3"></div>
            <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',paddingTop:4}}>使用车辆数</div>
            </div>
            <div style={{height:'90%',padding:5,float:'left',width:'24%',padding:0.5}} >
            <div id="bb4" style={{height:'90%'}}></div>
            <div style={{textAlign: 'center',fontWeight: 'bold',height:'10%',paddingTop:4}}>排车单数</div>
            </div>
            
          </div>
        </div>
      </Content>
    </Layout>

  }
}