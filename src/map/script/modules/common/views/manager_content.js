/**
 * @file 页面主 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */
import React, {Component} from 'react';
import {render} from 'react-dom';
import EntityControl from '../../entitycontrol/views/entitycontrol';
import TrackControl from '../../trackcontrol/views/trackcontrol';
import CommonStore from '../stores/commonStore';
import Mapcontrol from '../../../common/mapControl.js';

class ManagerContent extends React.Component {
    render() {
        return (
            <div className="main">
                <div className="trunk" id="trunk">
                    <TrackControl />
                    <EntityControl />
                </div>
                <div className="branch" id="branch">
                </div>
            </div>
        );
    }
}

export default ManagerContent;

