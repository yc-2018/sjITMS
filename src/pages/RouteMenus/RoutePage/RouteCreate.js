import QuickCreatePage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickCreatePage';
// import QuickCreatePageDefault from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageDefault';
import { connect } from 'dva';
import { Form, message } from 'antd';
import { commonLocale } from '@/utils/CommonLocale';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
@Form.create()
export default class RouteCreate extends QuickCreatePage {
  entity = {};
  state = {
    ...this.state,
    entityTest: {},
  };

  initUpdateEntity = async onlFormInfos => {
    for (const onlFormInfo of onlFormInfos) {
      const { onlFormHead, onlFormFields } = onlFormInfo;
      let tableName = onlFormHead.tableName;
      //初始化total
      this.isTotalCol[tableName] = [];
      let param;
      // 主表用主键关联，附表用外键关联
      if (onlFormHead.tableType != 2) {
        var field = this.props.searchField
          ? this.props.searchField
          : onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
        param = {
          tableName: tableName,
          condition: {
            params: [{ field: field, rule: 'eq', val: [this.props.params.entityUuid] }],
          },
        };
      } else {
        console.log('entity', this.entity);
        let itemParam = this.props.searchField
          ? this.entity['sj_menus_permissions'][0].UUID
          : this.props.params.entityUuid;
        var field = onlFormFields.find(x => x.mainField != null && x.mainField != '')?.dbFieldName;
        param = {
          tableName: onlFormHead.tableName,
          condition: {
            params: [{ field: field, rule: 'eq', val: [itemParam] }],
          },
        };
      }
      const response = await this.queryEntityData(param);
      // 请求的数据为空
      if (response.result.records == 'false') {
        return;
      }
      const records = response.result.records;

      if (onlFormHead.tableType != 2) {
        this.entity[tableName] = records;
        //address组件初始值
        let addItem = onlFormFields.find(item => item.fieldShowType == 'address');
        if (addItem) {
          let address = {
            country: records[0].COUNTRY,
            city: records[0].CITY,
            province: records[0].PROVINCE,
            district: records[0].DISTRICT,
            street: records[0].STREET,
          };
          this.entity[tableName][0][addItem.dbFieldName] = address;
        }

        //title处理
        let title = onlFormHead.formTitle;
        if (onlFormHead.formTitle && onlFormHead.formTitle.indexOf(']') != -1) {
          const titles = onlFormInfo.onlFormHead.formTitle.split(']');
          var entityCode = records[0][titles[0].replace('[', '')];
          var entityTitle =
            titles[1].indexOf('}') == -1
              ? titles[1]
              : records[0][titles[1].replace('}', '').replace('{', '')];
          title = '[' + entityCode + ']' + entityTitle;
        }
        this.setState({ title: title });
      } else {
        this.entity[tableName] = response.result.records;
        // 一对多增加line
        if (onlFormHead.relationType == 0) {
          for (let i = 0; i < this.entity[tableName].length; i++) {
            this.entity[tableName][i] = {
              ...this.entity[tableName][i],
              line: i + 1,
              key: this.tableKey++,
            };
          }
        }
        this.setState({});
      }
    }
  };

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.params.entityUuid != this.props.params.entityUuid) {
  //     this.props.params.entityUuid = nextProps.params.entityUuid;
  //     this.initEntity();
  //     //   this.init();
  //   }
  // }

  // initEntity = async () => {
  //   this.entity = {};
  //   const { onlFormInfos } = this.state;
  //   //初始化entity
  //   onlFormInfos.forEach(item => {
  //     this.entity[item.onlFormHead.tableName] = [];
  //   });
  //   if (this.props.showPageNow == 'update') {
  //     await this.initUpdateEntity(onlFormInfos);
  //   } else {
  //     this.initCreateEntity(onlFormInfos);
  //   }
  // };

  //   onSave = async data => {
  //     const { entity } = this;
  //     const { onlFormInfos } = this.state;

  //     console.log('entity', entity);
  //     //保存前对address字段做处理 不进行保存
  //     for (let onlFormInfo of onlFormInfos) {
  //       let addItem = onlFormInfo.onlFormFields.find(item => item.fieldShowType == 'address');
  //       if (addItem) {
  //         delete this.entity[onlFormInfo.onlFormHead.tableName][0][addItem.dbFieldName];
  //       }
  //     }

  //     const result = this.beforeSave(entity);
  //     if (result === false) {
  //       return;
  //     }

  //     this.onSaveSetOrg();

  //     //入参
  //     const param = { code: this.state.onlFormInfos[0].onlFormHead.code, entity: entity };
  //     this.onSaving();
  //     const response = await this.saveEntityData(param);
  //     const success = response.success == true;
  //     this.afterSave(success);
  //     this.onSaved({ response, param });
  //     if (success) {
  //       message.success(commonLocale.saveSuccessLocale);
  //     }
  //   };

  componentWillUnmount() {}
}
