import React, { PureComponent } from 'react';
import Script from 'react-load-script';
import configs from '@/utils/config';

export default class FRPrintScript extends PureComponent {

  handleScriptCreate() {
    this.setState({ scriptLoaded: false })
  }

  handleScriptError() {
    this.setState({ scriptError: true })
  }

  handleScriptLoad() {
    this.setState({ scriptLoaded: true })
  }

  render() {
    return (
      <div>
        <Script
          url={configs[API_ENV].RPORTER_SERVER + "?op=emb&resource=finereport.js"}
          onCreate={this.handleScriptCreate.bind(this)}
          onError={this.handleScriptError.bind(this)}
          onLoad={this.handleScriptLoad.bind(this)}
        />
        <Script
          url={configs[API_ENV].RPORTER_SERVER +"?op=resource&resource=/com/fr/web/core/js/socket.io.js"}
          onCreate={this.handleScriptCreate.bind(this)}
          onError={this.handleScriptError.bind(this)}
          onLoad={this.handleScriptLoad.bind(this)}
        />
        <Script
          url={configs[API_ENV].RPORTER_SERVER +"?op=resource&resource=/com/fr/web/core/js/jquery.watermark.js"}
          onCreate={this.handleScriptCreate.bind(this)}
          onError={this.handleScriptError.bind(this)}
          onLoad={this.handleScriptLoad.bind(this)}
        />
      </div>
    );
  }


}
