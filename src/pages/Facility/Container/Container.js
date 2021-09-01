import { PureComponent } from 'react';
import { connect } from 'dva';
import ContainerSearchPage from './ContainerSearchPage';
import ContainerViewPage from './ContainerViewPage';

@connect(({ container, loading }) => ({
    container,
    loading: loading.models.container,
}))
export default class Container extends PureComponent {

    render() {
        if (this.props.container.showPage === 'query') {
            return <ContainerSearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.container.showPage === 'view') {
            return <ContainerViewPage pathname={this.props.location.pathname} />
        }
    }
}