import React, { PureComponent } from 'react'
import {Table,Button,Input,Col,Row} from 'antd';
import {connect} from 'dva'
import { Route,Switch } from 'react-router-dom'
import List from '../../Test/Zz/ZzList'
import Create from '../../Test/Zz/ZzCreate'
import ZzSearch from '../../Test/Zz/ZzSearch'
import ZzView from '../../Test/Zz/ZzView'
import BatchNumberConfigCreate from './BatchNumberConfigCreate';
import BatchNumberConfigSearchForm from '@/pages/Basic/BatchNumberConfig/BatchNumberConfigSearchForm';
const { Search } = Input;
import  BatchNumberConfigDetails from './BatchNumberConfigDetails'

@connect(({ batchNumberConfig, loading }) => ({
  batchNumberConfig,
    loading: loading.models.batchNumberConfig,
  }))
export default class BatchNumberConfig extends PureComponent {

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
            type: 'batchNumberConfig/query',
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
            type: 'batchNumberConfig/query',
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
                type: 'batchNumberConfig/showPage',
                payload: {
                    ...payload
            }
            });
    }

    render() {
        if (this.props.batchNumberConfig.showPage === 'test') {
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
                   <List list={this.props.batchNumberConfig.data.list}/>
                   {/* <Route path="/test/ZzTest/Zzlist" component={List}></Route>              */}
              </div>
            )
        }else if(this.props.batchNumberConfig.showPage === 'create'){
            return (<BatchNumberConfigCreate/>)
        }else if(this.props.batchNumberConfig.showPage === 'query'){
            return (<BatchNumberConfigSearchForm pathname={this.props.location.pathname}/>)
        }else if(this.props.batchNumberConfig.showPage === 'view'){
            return (<BatchNumberConfigDetails pathname={this.props.location.pathname}/>)
        }
    }
}
