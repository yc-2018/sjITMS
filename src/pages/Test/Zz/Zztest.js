import React, { PureComponent } from 'react'
import {Table,Button,Input,Col,Row} from 'antd';
import {connect} from 'dva'
import { Route,Switch } from 'react-router-dom'
import List from './ZzList'
import Create from './testCreate'
import ZzSearch from './ZzSearch'
import ZzView from './ZzView'
const { Search } = Input;

@connect(({ zztest, loading }) => ({
    zztest,
    loading: loading.models.zztest,
  }))
export default class Zztest extends PureComponent {

    state = {employee:[]}

    // componentDidMount(){
    //     const { dispatch } = this.props;
    //     // this.toList();
    //     dispatch({
    //         type: 'zztest/query',
    //         payload: '',
    //       });
    // }

    onSearch=(value)=>{
        console.log('xxxxx',value)
        const { dispatch } = this.props;
        // this.toList();
        dispatch({
            type: 'zztest/query',
            payload: value,
          });
    }
   

    toForm=()=>{
        this.props.history.push('/form')
    }
  
    toList=()=>{
    // this.props.history.push({pathname:"/list",state:{employee:this.state.employee}})
        this.props.history.push('/test/ZzTest/Zzlist')
    }


    query=()=>{
        const { dispatch } = this.props;
        // this.toList();
        dispatch({
            type: 'zztest/query',
            payload: '',
          });
        console.log("zz的props",this.props);
        
    }

    toTest=(uuid)=>{
        const payload = {
                showPage: 'test'
            }
                if (uuid != '') {
                payload.entityUuid = uuid;
            }
                this.props.dispatch({
                type: 'zztest/showPage',
                payload: {
                    ...payload
            }
            });
    }

    render() {
        if (this.props.zztest.showPage === 'test') {
            return (
                <div>       
                    <Row align="center">
                    <Button onClick={this.toForm}>新增员工</Button>&nbsp;&nbsp;
                    <Col span={4}>
                        <div>
                            <Search  placeholder="输入员工姓名开始搜索" onSearh={this.onSearch} style={{ width: 350}} />
                        </div>             
                    </Col>
                    </Row>
                    <br/>
                    <button onClick={this.query}>点我</button>
                    <button onClick={this.toTest}>点我去test</button>
                   <List list={this.props.zztest.data.list}/>
                   {/* <Route path="/test/ZzTest/Zzlist" component={List}></Route>              */}
              </div>
            )
        }else if(this.props.zztest.showPage === 'create'){
            return (<Create/>)
        }else if(this.props.zztest.showPage === 'query'){
            return (<ZzSearch pathname={this.props.location.pathname}/>)
        }else if(this.props.zztest.showPage === 'view'){
            return (<ZzView pathname={this.props.location.pathname}/>)
        }
    }
}
