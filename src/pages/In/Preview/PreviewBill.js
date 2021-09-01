import { PureComponent } from "react";
import { connect } from "dva";
import PreviewBillSearchPage from './PreviewBillSearchPage';
import PreviewBillViewPage from './PreviewBillViewPage';
import PreviewBillCreatePage from '@/pages/In/Preview/PreviewBillCreatePage';
import EditForSinglePreviewBill from '@/pages/In/Preview/EditForSinglePreviewBill';
import EditForGroupPreviewBill from '@/pages/In/Preview/EditForGroupPreviewBill';

@connect(({ preview, loading }) => ({
    preview,
    loading: loading.models.preview,
}))
export default class previewBill extends PureComponent {

    render() {
        if (this.props.preview.showPage === 'query') {
            return <PreviewBillSearchPage pathname={this.props.location.pathname}/>
        } else if (this.props.preview.showPage === 'create') {
          return <PreviewBillCreatePage pathname={this.props.location.pathname}
                                        orderBillNumbers={this.props.preview.orderBillNumbers} />
        } else if (this.props.preview.showPage === 'editForSingle') {
            return <EditForSinglePreviewBill pathname={this.props.location.pathname} />
        } else if (this.props.preview.showPage === 'editForGroup') {
            return <EditForGroupPreviewBill pathname={this.props.location.pathname}
                                            entityUuid = '-' />
        } else if (this.props.preview.showPage === 'edit') {
          return <PreviewBillCreatePage pathname={this.props.location.pathname}
                                        entityUuid={this.props.preview.entityUuid}
                                        groupNo={this.props.preview.groupNo}
                                        ocrDate={this.props.preview.ocrDate} />
        } else {
            return <PreviewBillViewPage pathname={this.props.location.pathname}
                                        entityUuid={this.props.preview.entityUuid}
                                        version={this.props.preview.version}
                                        groupNo={this.props.preview.groupNo}
                                        ocrDate={this.props.preview.ocrDate}
                                        refresh={this.props.preview.refresh} />
        }
    }
}
