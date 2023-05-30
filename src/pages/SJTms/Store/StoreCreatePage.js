import { connect } from 'dva';
import { Form, Modal, message } from 'antd';
import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
import { commonLocale } from '@/utils/CommonLocale';
import FormPanel from '@/pages/Component/RapidDevelopment/CommonLayout/Form/FormPanel';
import CFormItem from '@/pages/Component/RapidDevelopment/CommonLayout/Form/CFormItem';
import { loginCompany, loginOrg ,loginUser,} from '@/utils/LoginContext';
import { havePermission } from '@/utils/authority';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class StoreCreatePage extends QuickCreatePage {
  onSave = () => {
    const { entity } = this;
    const { onlFormInfos } = this.state;

    //保存前对address字段做处理 不进行保存
    for (let onlFormInfo of onlFormInfos) {
      let addItem = onlFormInfo.onlFormFields.find(item => item.fieldShowType == 'address');
      if (addItem) {
        delete this.entity[onlFormInfo.onlFormHead.tableName][0][addItem.dbFieldName];
      }
    }
    const { SJ_ITMS_SHIP_ADDRESS_OWNERUUID } = this.state.runTimeProps;
    const saveDispatchCenter = entity.SJ_ITMS_SHIP_ADDRESS[0].DISPATCHCENTERUUID;
    const saveOwner = entity.SJ_ITMS_SHIP_ADDRESS[0].OWNERUUID;

    const DISPATCHCENTERUUID = SJ_ITMS_SHIP_ADDRESS_OWNERUUID.sourceData.find(
      x => x.UUID == saveOwner
    ).DISPATCHCENTERUUID;

    if (DISPATCHCENTERUUID !== saveDispatchCenter) {
      Modal.confirm({
        title: '调度中心配置与货主的调度中心不匹配，是否保存?',
        content: '',
        okText: '是',
        okType: 'primary',
        cancelText: '否',
        onOk: this.handleOk.bind(),
        onCancel() {
          return false;
        },
      });
    } else {
      this.handleOk();
    }
  };

  handleOk = async () => {
    const { entity } = this;
    this.onSaveSetOrg();

    //入参
    const param = { code: this.state.onlFormInfos[0].onlFormHead.code, entity: entity };
    this.onSaving();
    const response = await this.saveEntityData(param);
    const success = response.success == true;
    this.afterSave(success);
    this.onSaved(success);
    if (success) {
      message.success(commonLocale.saveSuccessLocale);
    }
  };

    /**
   * 渲染表单组件
   */
    drawFormItems = () => {
      const { getFieldDecorator } = this.props.form;
      let { formItems, categories, onlFormInfos } = this.state;
      let formPanel = [];
      categories = categories.filter(x => x.type == 0);
      if (!categories || !onlFormInfos) {
        return;
      }
      const rowCount = onlFormInfos[0].onlFormHead.formTemplate
        ? onlFormInfos[0].onlFormHead.formTemplate
        : 4;
      // let z = 0;
      // let gutt = onlFormInfos[0].onlFormHead.formTemplateList
      //   ? onlFormInfos[0].onlFormHead.formTemplateList
      //   : this.getGutt()
      //     ? this.getGutt()
      //     : [];
      for (const categoryItem of categories) {
        let cols = [];
        for (const formItemKey in formItems) {
          console.log("for",formItem,loginOrg());
          const formItem = formItems[formItemKey];
          const e = { ...formItem };
          const { categoryName, key, tableName, fieldName } = formItem;
          if (categoryName != categoryItem.category) {
            continue;
          }
          if((e.fieldName =="OVERBONUS" || e.fieldName =='SUBSIDYAREA')
            && (loginOrg().uuid =='000000750000005' ||loginOrg().uuid =='000008150000002' )
          ){
            e.props = {...e.props,disabled:!havePermission('sjtms.basic.store.subsidy')}
          }
          this.propsSpecialTreatment(e);
          this.drawcell(e);
  
          let initialValue = this.entity[tableName][0] && this.entity[tableName][0][fieldName]; // 初始值
          cols.push(
            <CFormItem key={key} label={e.label}>
              {getFieldDecorator(key, {
                initialValue: this.convertInitialValue(initialValue, e.fieldShowType, e.dbType),
                rules: e.rules,
              })(<e.component {...e.props} />)}
            </CFormItem>
          );
        }
        if (cols.length > 0) {
          formPanel.push(
            <FormPanel
              key={categoryItem.category}
              title={this.props.noCategory ? undefined : categoryItem.category}
              cols={cols}
              rowCount={rowCount}
              // gutterCols={gutt[z] ? gutt[z] : null}
            />
          );
          // z++;
        }
      }
      if (formPanel.length == 0) {
        return null;
      } else {
        return formPanel;
      }
    };
}
