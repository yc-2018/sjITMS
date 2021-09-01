/**
 * @file 页面底部 Reflux View
 * @author 崔健 cuijian03@baidu.com 2016.08.20
 */
import React from 'react';
import SelectAll from './selectall';
import Remove from './remove';
import Page from './page';

class Bottomcontrol extends React.Component{
    render() {
        return (
            <div className="bottomControl">
                <SelectAll />
                <Remove />
                <Page />
            </div>
        )
    }
}

export default Bottomcontrol;
