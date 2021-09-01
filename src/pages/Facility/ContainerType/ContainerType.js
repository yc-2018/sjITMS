import { PureComponent } from 'react';
import { connect } from 'dva';
import ContainerTypeSearchPage from './ContainerTypeSearchPage';
import ContainerTypeView from './ContainerTypeView';
import ContainerTypeCreate from './ContainerTypeCreate';

@connect(({ containerType, loading }) => ({
    containerType,
    loading: loading.models.containerType,
}))
export default class ContainerType extends PureComponent {

    render() {
        if (this.props.containerType.showPage === 'query') {
            return <ContainerTypeSearchPage pathname={this.props.location.pathname} />;
        } else if (this.props.containerType.showPage === 'view') {
            return <ContainerTypeView pathname={this.props.location.pathname} />;
        } else if (this.props.containerType.showPage === 'create') {
            return <ContainerTypeCreate pathname={this.props.location.pathname} />;
        }
    }
}