import { PureComponent } from 'react';
import { connect } from 'dva';
import DockSearchPage from './DockSearchPage';
import DockGroupSearchPage from './DockGroupSearchPage';
import DockViewPage from './DockViewPage';
import DockCreatePage from './DockCreatePage';
@connect(({ dock, loading }) => ({
  dock,
  loading: loading.models.dock,
}))
export default class Dock extends PureComponent {
  render() {
    if (this.props.dock.showPage === 'query') {
      return <DockSearchPage pathname={this.props.location.pathname}/>;
    }else if (this.props.dock.showPage === 'queryDockGroup') {
      return <DockGroupSearchPage pathname={this.props.location.pathname}/>;
    }else if (this.props.dock.showPage === 'view') {
      return <DockViewPage pathname={this.props.location.pathname}/>;
    }else if (this.props.dock.showPage === 'create') {
      return <DockCreatePage pathname={this.props.location.pathname}/>;
    }
  }
}
