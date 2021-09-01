import React, { Component } from 'react';
import RenderAuthorized from '@/components/Authorized';
import FRPrintScript from '@/pages/Component/Printer/FRPrintScript';

import { getAuthority } from '@/utils/authority';
import Redirect from 'umi/redirect';
import { iterateAllData, getAuthorityInfo } from '@/utils/LoginContext';

export default class Authorized extends Component{

  constructor(props) {
    super(props);
  }

  state = {
    Authority:undefined,
    Authorized:undefined,
  }
  componentDidMount(){
    iterateAllData(()=>this.callback(this));
  }
  callback (value){
    let Authority = getAuthority();
    let Authorized = RenderAuthorized(Authority);
    this.setState({
      Authority:Authority,
      Authorized:Authorized,
    })
  }
  render(){

    const {Authorized,Authority} = this.state;
    const {children} = this.props;
    return <div>
      <FRPrintScript />
      {Authorized?<Authorized authority={children.props.route.authority} noMatch={<Redirect to="/user/login" />}>
        {children}
      </Authorized>:null}

    </div>
  }
}
