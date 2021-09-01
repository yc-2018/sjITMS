import React, { PureComponent } from 'react';
import { connect } from 'dva';
import ContentMap from '@/map/script/modules/common/views/manager_content';
export default class TmsMap extends PureComponent {
  componentDidMount() {
    let contentDiv=document.getElementsByClassName("ant-layout-content")[0];
    if(contentDiv){
      contentDiv.style.marginTop='0px';
    }
    mapControl.initMap();
  }

  render() {
    return (
      <div>
        <ContentMap />
      </div>
    );
  }
}