export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './Account/Login/Login' },
    ],
  },
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [
      {
        path: '/hdmgr',
        name: 'hdmgr',
        icon: 'icon-management_uncheck',
        org: ['HEADING'],
        routes: [
          {
            path: '/hdmgr/comp',
            name: 'comp',
            component: './Account/Company/Company',
            divider: true,
          },
          {
            path: '/hdmgr/report',
            name: 'report',
            component: './Account/Report/Report',
            divider: true,
          },
          {
            path: '/hdmgr/template',
            name: 'template',
            component: './Account/PrintTemplate/PrintTemplate',
          },
          {
            path: '/hdmgr/imTemplate',
            name: 'imTemplate',
            component: './Account/ImTemplate/ImTemplate',
            // divider: true,
          },
          // {
          //   path: '/hdmgr/config',
          //   name: 'config',
          //   component: './Account/Config/Config',
          // }
        ],
      },
      {
        path: '/compmgr',
        name: 'compmgr',
        icon: 'icon-menu_system',
        org: ['COMPANY', 'DC', 'STORE', 'CARRIER', 'VENDOR','DISPATCH_CENTER'],
        authority: ['iwms.account'],
        routes: [
          {
            path: '/compmgr/role',
            name: 'role',
            component: './Account/Role/Role',
            authority: ['iwms.account.role'],
          },
          {
            path: '/compmgr/user',
            name: 'user',
            component: './Account/User/User',
            authority: ['iwms.account.user'],
          },
          {
            path: '/compmgr/config',
            name: 'config',
            org: ['COMPANY','DISPATCH_CENTER'],
            component: './Account/Config/Config',
            authority: ['iwms.account.configcenter']
          },
          {
            path: '/compmgr/report',
            name: 'report',
            org: ['COMPANY'],
            component: './Account/Report/Report',
            authority: ['iwms.account.report'],
          },
          {
            path: '/compmgr/template',
            name: 'template',
            org: ['COMPANY'],
            component: './Account/PrintTemplate/PrintTemplate',
            authority: ['iwms.account.print'],
          },
          {
            path: '/compmgr/billImport',
            name: 'billImport',
            org: ['DC','DISPATCH_CENTER'],
            component: './Inner/BillImport/BillImport',
            authority: ['iwms.account.billImport']
          },
        ]
      },
      {
        path: '/basic',
        name: 'basic',
        icon: 'icon-menu_info',
        org: ['COMPANY', 'DC','DISPATCH_CENTER'],
        authority: ['iwms.basic'],
        routes: [

          {
            path: '/basic/dc',
            name: 'dc',
            org: ['COMPANY'],
            component: './Basic/DC/DC',
            authority: ['iwms.basic.dc'],
          },
          {
            path: '/basic/dispatchCenter',
            name: 'dispatchCenter',
            org: ['COMPANY'],
            component: './Basic/DispatchCenter/DispatchCenter',
            divider: true,
            authority: ['iwms.basic.dispatchcenter'],
          },
          {
            path: '/basic/owner',
            name: 'owner',
            component: './Basic/Owner/Owner',
            authority: ['iwms.basic.owner'],
            divider: true,

          },
          {
            path: '/basic/vendor',
            name: 'vendor',
            component: './Basic/Vendor/Vendor',
            authority: ['iwms.basic.vendor'],
          },
          {
            path: '/basic/store',
            name: 'store',
            component: './Basic/Store/Store',
            authority: ['iwms.basic.store'],
          },
          {
            path: '/basic/category',
            name: 'category',
            component: './Basic/Category/Category',
            authority: ['iwms.basic.category']
          },
          {
            path: '/basic/article',
            name: 'article',
            component: './Basic/Article/Article',
            authority: ['iwms.basic.article'],
          }, {
            path: '/basic/wrh',
            name: 'wrh',
            org: ['COMPANY'],
            component: './Basic/Wrh/Wrh',
            authority: ['iwms.basic.wrh'],
          },
          {
            path: '/basic/team',
            name: 'team',
            org: ['DISPATCH_CENTER'],
            component: './Basic/Team/Team',
            authority: ['iwms.basic.dispatchcenter.classgroup'],
          },
          {
            path: '/basic/BatchNumberConfig',
            name: 'BatchNumberConfig',
            component: './Basic/BatchNumberConfig/BatchNumberConfig',
            authority: ['iwms.basic.store'],
          }
        ]
      },
      {
        path: '/facility',
        name: 'facility',
        icon: 'icon-menu_wuliusheshi',
        org: ['DC', 'DISPATCH_CENTER'],
        authority: ['iwms.facility'],
        routes: [
          {
            path: '/facility/wrh',
            name: 'wrh',
            org: ['DC'],
            component: './Basic/Wrh/Wrh',
            authority: ['iwms.basic.wrh'],
            divider: true,
          },
          {
            path: '/facility/binType',
            name: 'binType',
            org: ['DC'],
            component: './Facility/BinType/BinType',
            authority: ['iwms.facility.bintype'],
          }, {
            path: '/facility/bin',
            name: 'bin',
            org: ['DC'],
            component: './Facility/Bin/Bin',
            authority: ['iwms.facility.bin'],
          }, {
            path: '/facility/containerType',
            name: 'containerType',
            org: ['DC'],
            component: './Facility/ContainerType/ContainerType',
            authority: ['iwms.facility.containerType']
          }, {
            path: '/facility/container',
            name: 'container',
            org: ['DC'],
            authority: ['iwms.facility.container'],
            component: './Facility/Container/Container',
          },
          {
            path: '/facility/dock',
            name: 'dock',
            org: ['DC'],
            component: './Facility/Dock/Dock',
            authority: ['iwms.facility.dock'],
            divider: true,
          },
          {
            path: '/facility/pickArea',
            name: 'pickArea',
            org: ['DC'],
            component: './Facility/PickArea/PickArea',
            authority: ['iwms.facility.pickarea'],
          },
          {
            path: '/facility/palletBinType',
            name: 'palletBinType',
            org: ['DC'],
            component: './Facility/PalletBinType/PalletBinType',
            // authority: ['iwms.out.palletBinType']
          },
          {
            path: '/facility/palletBin',
            name: 'palletBin',
            org: ['DC'],
            component: './Facility/PalletBin/PalletBin',
            // authority: ['iwms.out.palletBin']
          },
          {
            path: '/facility/highLowStock',
            name: 'highLowStock',
            org: ['DC'],
            component: './Facility/HighLowStock/HighLowStock',
            authority: ['iwms.facility.highlowstock'],
            divider: true,
          },
          {
            path: '/facility/supermanagementboard',
            name: 'superManagementBoard',
            org: ['DC'],
            component: './Facility/SuperManagementBoard/SuperManagementBoard',
            authority: ['iwms.facility.overprotectboard']
          },
          {
            path: '/facility/config',
            name: 'config',
            component: './Facility/Config/Config',
            authority: ['iwms.facility.configcenter']
          }
        ]
      },
      {
        path: '/in',
        name: 'in',
        org: ['DC'],
        icon: 'icon-menu_rukuguanli',
        authority: ['iwms.in'],
        routes: [
          {
            path: '/in/order',
            name: 'order',
            component: './In/Order/Order',
            authority: ['iwms.in.order'],
            divider: true,
          },
          {
            path: '/in/bookboard',
            name: 'bookboard',
            component: './In/Book/BookBoard',
            authority: ['iwms.in.book'],
          },
          {
            path: '/in/book',
            name: 'book',
            component: './In/Book/Book',
            authority: ['iwms.in.book'],
            divider: true,
          },
          {
            path: '/in/preview',
            name: 'preview',
            component: './In/Preview/PreviewBill',
            authority: ['iwms.in.prevexam'],
          },
          {
            path: '/in/checkinwrh',
            name: 'checkinwrh',
            component: './In/CheckInWrh/CheckInWrh',
            authority: ['iwms.in.inwrh.create'],
          },
          {
            path: '/in/inwrhbill',
            name: 'inwrhbill',
            component: './In/InWrhBill/InWrhBill',
            authority:['iwms.in.inwrh.board'],
            divider: true,
          },
          {
            path: '/in/receive',
            name: 'receive',
            component: './In/Receive/Receive',
            authority: ['iwms.in.receive']
          },
          {
            path: '/in/planeMove',
            name: 'planeMove',
            component: './In/Move/PlaneMoveBill',
            authority: ['iwms.in.move']
          },
          {
            path: '/in/putaway',
            name: 'putaway',
            component: './In/Putaway/Putaway',
            authority: ['iwms.in.putaway'],
            divider: true,
          },
          {
            path: '/in/adjBill',
            name: 'adjBill',
            component: './Inner/AdjBill/AdjBill',
            authority: ['iwms.in.adj'],
          },
          {
            path: '/in/packageBill',
            name: 'packageBill',
            authority: ['iwms.in.packagebill'],
            component: './In/PackageBill/PackageBill'
          },
        ]
      },
      {
        path: '/inner',
        name: 'inner',
        org: ['DC'],
        icon: 'icon-menu_neibuguanli',
        authority: ['iwms.inner'],
        routes: [
          {
            path: '/inner/movebill',
            name: 'movebill',
            authority: ['iwms.inner.moveBill'],
            component: './Inner/MoveBill/MoveBill'
          },
          {
            path: '/inner/dec',
            name: 'dec',
            component: './Inner/Dec/DecInvBill',
            authority: ['iwms.inner.dec']
          },
          {
            path: '/inner/inc',
            name: 'inc',
            component: './Inner/Inc/IncInvBill',
            authority: ['iwms.inner.inc']
          },
          {
            path: '/inner/pickBinAdjBill',
            name: 'pickBinAdjBill',
            component: './Inner/PickBinAdjBill/PickBinAdjBill',
            authority: ['iwms.inner.pickBinAdj'],
            divider: true,
          },
          {
            path: '/inner/close',
            name: 'close',
            component: './Inner/Close/WrhCloseBill',
            authority: ['iwms.inner.close']
          },
          {
            path: '/inner/stocklock',
            name: 'stocklock',
            component: './Inner/StockLock/StockLockBill',
            authority: ['iwms.inner.lock'],
          },
          {
            path: '/inner/stockadj',
            name: 'stockAdjBill',
            component: './Inner/StockAdjBill/StockAdjBill',
            authority: ['iwms.inner.stockAdjBill'],
            divider: true,
          },
          {
            path: '/inner/prerpl',
            name: 'prerpl',
            authority: ['iwms.inner.prerpl'],
            component: './Inner/PreRpl/PreRpl'
          },
          {
            path: '/inner/processingScheme',
            name: 'processingScheme',
            component: './Distribution/ProcessingScheme/ProcessingScheme',
            authority: ['iwms.inner.processScheme'],
          },
          {
            path: '/inner/processBill',
            name: 'processBill',
            component: './Inner/ProcessBill/ProcessBill',
            authority: ['iwms.inner.processBill'],
            divider: true,
          },
          {
            path: '/inner/stockTakePlanBill',
            name: 'stockTakePlan',
            component: './Inner/StockTakePlan/StockTakePlan',
            authority: ['iwms.inner.stockTakePlan']
          },
          {
            path: '/inner/stockTakeBill',
            name: 'stockTakeBill',
            component: './Inner/StockTakeBill/StockTakeBill',
            authority: ['iwms.inner.stockTake']
          },
        ]
      },
      {
        path: '/out',
        name: 'out',
        org: ['DC'],
        icon: 'icon-menu_chukuguanli',
        authority: ['iwms.out'],
        routes: [
          {
            path: '/out/alcNtc',
            name: 'alcNtc',
            component: './Out/AlcNtc/AlcNtc',
            divider: true,
            authority: ['iwms.out.alcntc']
          },
          {
            path: '/out/wave',
            name: 'waveBill',
            component: './Out/Wave/WaveBill',
            authority: ['iwms.out.wave']
          },
          {
            path: '/out/rpl',
            name: 'rpl',
            component: './Out/Rpl/Rpl',
            divider: true,
            authority: ['iwms.out.rpl']
          },
          {
            path: '/out/pickup',
            name: 'pickUpBill',
            component: './Out/PickUp/PickUpBill',
            authority: ['iwms.out.pickup']
          },
          {
            path: '/out/crossPickUp',
            name: 'crossPickUpBill',
            component: './Out/CrossPickUp/CrossPickUpBill',
            authority: ['iwms.out.crosspickup'],
            divider: true,
          },
          {
            path: '/out/crossPrintLabel',
            name: 'crossPrintLabel',
            component: './Out/CrossPrintLabel/CrossPrintLabelPage',
            // authority: ['iwms.out.crossPrintLabel']
          },
          {
            path: '/out/pickUpBillPrintLabel',
            name: 'pickUpBillPrintLabel',
            component: './Out/PickUpBillPrintLabel/PickUpBillPrintLabelPage',
            divider: true,
            authority: ['iwms.out.pickUpBillPrintLabel']
          },
          {
            path: '/out/containerreview',
            name: 'containerreview',
            authority: ['iwms.out.containerReview'],
            component: './Inner/ContainerReviewBill/ContainerReviewBill'
          },

          {
            path: '/out/collectbinreview',
            name: 'collectbinreview',
            authority: ['iwms.out.collectBinReview'],
            component: './Inner/CollectBinReviewBill/CollectBinReviewBill'
          },
          {
            path: '/out/collectBinBatchReview',
            name: 'collectBinBatchReview',
            // authority: ['iwms.out.collectBinBatchReview'],
            divider: true,
            component: './Out/CollectBinBatchReview/CollectBinBatchReview'
          },
          {
            path: '/out/containermerger',
            name: 'containermerger',
            authority: ['iwms.out.containerMerger'],
            component: './Inner/ContainerMergerBill/ContainerMergerBill',
          },
          {
            path: '/out/containerbind',
            name: 'containerbind',
            component: './Inner/ContainerBindBill/ContainerBindBill',
            authority: ['iwms.out.containerBind'],
            divider: true,
          },
          {
            path: '/out/storePickOrder',
            name: 'pickOrder',
            component: './Out/PickOrder/PickOrder',
            authority: ['iwms.out.storePickScheme']
          },
          {
            path: '/out/deliverycycle',
            name: 'deliverycycle',
            component: './Out/Deliverycycle/Deliverycycle',
            authority: ['iwms.out.deliveryCycle']
          },
          {
            path: '/out/stockorder',
            name: 'stockorder',
            component: './Out/StockOrder/StockOrder',
            authority: ['iwms.out.stockOrderScheme']
          },
          {
            path: '/out/collectBin',
            name: 'collectBin',
            component: './Out/CollectBin/CollectBin',
            authority: ['iwms.out.collectBinScheme']
          },
          {
            path: '/out/palletBinScheme',
            name: 'palletBinScheme',
            component: './Out/PalletBinScheme/PalletBinScheme',
            // authority: ['iwms.out.palletBinScheme']
          },
        ]
      }, {
        path: '/rtn',
        name: 'rtn',
        org: ['DC'],
        icon: 'icon-menu_nixiangwuliu',
        authority: ['iwms.rtn'],
        routes: [
          {
            path: '/rtn/storeRtnNtc',
            name: 'storeRtnNtc',
            component: './Rtn/StoreRtnNtc/StoreRtnNtcBill',
            authority: ['iwms.rtn.storeRtnNtc']
          }, {
            path: '/rtn/storeRtn',
            name: 'storeRtn',
            component: './Rtn/StoreRtn/StoreRtnBill',
            authority: ['iwms.rtn.storeRtn']
          }, {
            path: '/rtn/rtnPutaway',
            name: 'rtnPutaway',
            component: './Rtn/RtnPutaway/RtnPutawayBill',
            authority: ['iwms.rtn.rtnPutaway'],
            divider: true,
          }, {
            path: '/rtn/vendorDispatch',
            name: 'vendorDispatch',
            component: './Rtn/VendorDispatch/VendorDispatch',
            authority: ['iwms.rtn.vendorRtnDispatch']
          }, {
            path: '/rtn/vendorRtnNtc',
            name: 'vendorRtnNtc',
            component: './Rtn/VendorRtnNtc/VendorRtnNtcBill',
            // authority: ['iwms.rtn.VendorRtnNtc']
          }, {
            path: '/rtn/vendorRtnPick',
            name: 'vendorRtnPick',
            component: './Rtn/VendorRtnPick/VendorRtnPickBill',
            authority: ['iwms.rtn.vendorRtnPick']
          }, {
            path: '/rtn/vendorHandover',
            name: 'vendorHandover',
            component: './Rtn/VendorHandover/VendorHandoverBill',
            authority: ['iwms.rtn.vendorRtnHandover']
          },
        ]
      },
      {
        path: '/wcs',
        name: 'wcs',
        org: ['DC'],
        icon: 'icon-menu_wcs',
        authority: ['iwms.wcs'],
        routes: [
          {
            path: '/wcs/dps',
            name: 'dps',
            routes: [
              {
                path: '/wcs/dps/pickUpBillElectronicLabel',
                name: 'pickUpBillElectronicLabel',
                component: './Wcs/Dps/PickUpBillElectronicLabel/PickUpBillElectronicLabelPage',
                divider: true,
              },
              {
                path: '/wcs/dps/facilitiesMaintenance',
                name: 'facilitiesMaintenance',
                component: './Wcs/Dps/FacilitiesMaintenance/FacilitiesMaintenance',
                divider: true,
              },
              {
                path: '/wcs/dps/operationPoint',
                name: 'operationPoint',
                component: './Wcs/Dps/OperationPoint/OperationPoint',
                divider: true,
              },
              {
                path: '/wcs/dps/job',
                name: 'job',
                component: './Wcs/Dps/Job/Job',
                divider: true,
              }
            ]
          },
          {
            path: '/wcs/electronicBalance',
            name: 'electronicBalance',
          },
          {
            path: '/wcs/sorter',
            name: 'sorter',
          },
          {
            path: '/wcs/agv',
            name: 'agv',
          },
          {
            path: '/wcs/asrs',
            name: 'asrs',
          },
        ]
      },
      {
        path: '/dcmgr',
        name: 'dcmgr',
        org: ['COMPANY'],
        // authority: ['iwms.dcmgr'],
        authority: ['iwms.dcmgr'],
        routes: [
          {
            path: '/dcmgr/processingScheme',
            name: 'processingScheme',
            component: './Distribution/ProcessingScheme/ProcessingScheme',
            authority: ['iwms.inner.processScheme']
          }
        ]
      },
      {
        path: '/tms',
        name: 'tms',
        org: ['COMPANY', 'DC','DISPATCH_CENTER'],
        authority: ['iwms.tms'],
        icon: 'icon-menu_yunshuguanli1',
        routes: [
          {
            path: '/tms/serialArch12',
            name: 'serialArch',
            org: ['COMPANY', 'DC'],
            component: './Tms/SerialArch/SerialArch',
            authority: ['iwms.tms.serialArch']
          },
          {
            path: '/tms/dispatchCenterSerialArch',
            name: 'serialArch',
            org: ['DISPATCH_CENTER'],
            component: './Tms/DispatchCenterSerialArch/SerialArch',
            authority: ['iwms.tms.serialArch']
          },
          {
            path: '/tms/lineMaintenance',
            name: 'lineMaintenance',
            org: ['DISPATCH_CENTER'],
            component: './Tms/LineMaintenance/LineMaintenance'
          },
          {
            path: '/tms/carrier',
            name: 'carrier',
            org: ['COMPANY', 'DC','DISPATCH_CENTER'],
            component: './Tms/Carrier/Carrier',
            authority: ['iwms.tms.carrier'],
          },
          {
            path: '/tms/vehicleType',
            name: 'vehicleType',
            org: ['COMPANY', 'DC','DISPATCH_CENTER'],
            component: './Tms/VehicleType/VehicleType',
            authority: ['iwms.tms.vehicleType']
          },
          {
            path: '/tms/vehicle',
            name: 'vehicle',
            org: ['COMPANY', 'DC','DISPATCH_CENTER'],
            component: './Tms/Vehicle/Vehicle',
            authority: ['iwms.tms.vehicle'],
            divider: true
          },
          {
            path: '/tms/scheduleGroup',
            name: 'scheduleGroup',
            org: ['DISPATCH_CENTER'],
            component: './Tms/ScheduleGroup/ScheduleGroup',
            // authority: ['iwms.tms.scheduleGroup'],

          },
          {
            path: '/tms/transportOrder',
            name: 'transportOrder',
            org: ['DISPATCH_CENTER'],
            component: './Tms/TransportOrder/TransportOrder',
            divider: true

            // authority: ['iwms.tms.transportOrder'],
          },
          {
            path: '/tms/vehicleDispatching',
            name: 'vehicleDispatching',
            org: ['DISPATCH_CENTER'],
            component: './Tms/VehicleDispatching/VehicleDispatching',
            // authority: ['iwms.tms.alcDiff'],
          },

          // TODO:以下 暂未开发完成  勿删除、勿打开代码
          {
            path: '/tms/pickUpDispatching',
            name: 'pickUpDispatching',
            org: ['DISPATCH_CENTER'],
            component: './Tms/PickUpDispatching/PickUpDispatching',
            // authority: ['iwms.tms.alcDiff'],
            divider: true
          },
          {
            path: '/tms/billDispatching',
            name: 'billDispatching',
            org: ['DISPATCH_CENTER'],
            component: './Tms/BillDispatching/BillDispatching',
            divider: true

            // authority: ['iwms.tms.alcDiff'],
          },
          // TODO:以上 暂未开发完成  勿删除、勿打开代码
          // {
          //   path: '/tms/shipPlanBillDispatch',
          //   name: 'shipPlanBillDispatch',
          //   org: ['DISPATCH_CENTER'],
          //   component: './Tms/ShipPlanBillDispatch/ShipPlanBillDispatch',
          // },
          // TODO:以下 暂未开发完成  勿删除、勿打开代码
          {
            path: '/tms/dispatchCenterShipPlanBill',
            name: 'dispatchCenterShipPlanBill',
            org: ['DISPATCH_CENTER'],
            component: './Tms/DispatchCenterShipPlanBill/DispatchCenterShipPlanBill'
          },
          // TODO:以上 暂未开发完成  勿删除、勿打开代码
          {
            path: '/tms/dispatchCenterShipBill',
            name: 'dispatchCenterShipBill',
            org: ['DISPATCH_CENTER'],
            component: './Tms/DispatchCenterShipBill/DispatchCenterShipBill',
          },
          {
            path: '/tms/chargeLoading',
            name: 'chargeLoading',
            org: ['DISPATCH_CENTER'],
            component: './Tms/ChargeLoading/ChargeLoading',
          },
          {
            path: '/tms/relationplanbill',
            name: 'relationplanbill',
            org: ['DISPATCH_CENTER'],
            component: './Tms/RelationPlanBill/RelationPlanBill',
          },
          {
            path: '/tms/checkInAndCheckOut',
            name: 'checkInAndCheckOut',
            org: ['DISPATCH_CENTER'],
            component: './Tms/CheckInAndCheckOut/CheckInAndCheckOut',
            // authority: ['iwms.tms.checkInAndCheckOut'],
          },

          {
            path: '/tms/dispatchReturn',
            name: 'dispatchReturn',
            org: ['DISPATCH_CENTER'],
            component: './Tms/DispatchReturn/DispatchReturn',
          },
          {
            path: '/tms/deliveredConfirm',
            name: 'deliveredConfirm',
            org: ['DISPATCH_CENTER'],
            component: './Tms/DeliveredConfirm/DeliveredConfirm',
          },
          {
            path: '/tms/pickUpConfirm',
            name: 'pickUpConfirm',
            org: ['DISPATCH_CENTER'],
            component: './Tms/PickUpConfirm/PickUpConfirm',
          },
          {
            path: '/tms/checkReceiptBill',
            name: 'checkReceiptBill',
            org: ['DISPATCH_CENTER'],
            component: './Tms/CheckReceiptBill/CheckReceiptBill',
          },
          {
            path: '/tms/storeCashCollRecords',
            name: 'storeCashCollRecords',
            org: ['DISPATCH_CENTER'],
            component: './Tms/StoreCashCollRecords/StoreCashCollRecords',
            divider: true
          },
          // 时捷版本配送中心取消调度
          {
            path: '/tms/ShipPlanDispatch',
            name: 'ShipPlanDispatch',
            org: ['COMPANY', 'DC'],
            component: './Tms/ShipPlanDispatch/ShipPlanDispatch',
            authority: ['iwms.tms.shipPlanDispatch'],
          },
          {
            path: '/tms/shipplanbill',
            name: 'shipplanbill',
            org: ['COMPANY', 'DC'],
            component: './Tms/ShipPlanBill/ShipPlanBill',
            authority: ['iwms.tms.shipPlanBill'],
          },
          {
            path: '/tms/shipbill',
            name: 'shipbill',
            org: ['COMPANY', 'DC','DISPATCH_CENTER'],
            component: './Tms/ShipBill/ShipBill',
            authority: ['iwms.tms.shipBill'],
          },
          {
            path: '/tms/selfTackShip',
            name: 'selfTackShip',
            org: ['DC'],
            authority: ['iwms.tms.selfHandover'],
            component: './Tms/SelfTackShip/SelfTackShip',
          },
          {
            path: '/tms/storeHandoverbill',
            name: 'storehandoverbill',
            org: ['COMPANY', 'DC'],
            component: './Tms/StoreHandoverBill/StoreHandoverBill',
            authority: ['iwms.tms.storeHandover'],
            divider: true
          },
          {
            path: '/tms/containerRecycle',
            name: 'containerRecycle',
            org: ['COMPANY', 'DC'],
            component: './Tms/ContainerRecycle/ContainerRecycle',
            authority: ['iwms.tms.containerRecycle'],
          },
          {
            path: '/tms/attachmentReturn',
            name: 'attachmentReturn',
            org: ['DC'],
            component: './Tms/AttachmentReturn/AttachmentReturn',
            // authority: ['iwms.tms.attachmentReturn'],
          },
          {
            path: '/tms/alcDiff',
            name: 'alcDiff',
            org: ['DC'],
            component: './Tms/AlcDiff/AlcDiffBill',
            authority: ['iwms.tms.alcDiff'],
          },
        ]
      },
      {
        path:'/billmanage',
        name:'billManage',
        org:['COMPANY'],
        icon: 'icon-cangchuguanli_uncheck',
        routes:[
          {
            path: '/billmanage/dataImport',
            name: 'dataImport',
            component: './BillManage/DataImport/DataImport',
            // authority: ['']
          },
          {
            path: '/billmanage/billType',
            name: 'billType',
            component: './BillManage/DataType/DataType',
            // authority: ['']
          },
          {
            path: '/billmanage/billSort',
            name: 'sort',
            component: './BillManage/BillSort/BillSort',
            // authority: ['']
          },
          {
            path: '/billmanage/unitConversion',
            name: 'unitConversion',
            component: './BillManage/UnitConversion/UnitConversion',
            // authority: ['']
            divider: true,
          },
          {
            path: '/billmanage/billList',
            name: 'billList',
            component: './BillManage/BillList/BillList',
            // authority: ['']
          },
          // {
          //   path: '/billmanage/contract',
          //   name: 'contract',
          //   component: './Tms/Contract/Contract',
          // },
        ]
      },
      {
        path: '/call',
        name: 'call',
        org: ['STORE'],
        authority: ['iwms.call'],
        icon: 'icon-menu_chukuguanli',
        routes: [
          {
            path: '/call/alcNtc',
            name: 'alcNtc',
            component: './Out/AlcNtc/AlcNtc',
            authority: ['iwms.call.alcntc']
          },
          {
            path: '/call/storeHandover',
            name: 'storeHandover',
            component: './Tms/StoreHandoverBill/StoreHandoverBill',
            authority: ['iwms.call.storeHandover']
          },
          {
            path: '/call/vehicleMonitoring',
            name: 'vehicleMonitoring',
            component: './Tms/Map/TmsMap',
            authority: ['iwms.call.vehicleMonitoring']
          }
        ]
      },
      {
        path: '/rtnMsg',
        name: 'rtnMsg',
        org: ['STORE'],
        icon: 'icon-menu_nixiangwuliu',
        authority: ['iwms.rtnMsg'],
        routes: [
          {
            path: '/rtnMsg/storeRtnNtc',
            name: 'storeRtnNtc',
            component: './Rtn/StoreRtnNtc/StoreRtnNtcBill',
            authority: ['iwms.rtnMsg.storeRtnNtc']
          },
          {
            path: '/rtnMsg/storeRtn',
            name: 'storeRtn',
            component: './Rtn/StoreRtn/StoreRtnBill',
            authority: ['iwms.rtnMsg.storeRtn']
          }
        ]
      },
      {
        path: '/tmsMsg',
        name: 'tmsMsg',
        org: ['CARRIER'],
        authority: ['iwms.tmsMsg'],
        icon: 'icon-menu_yunshuguanli1',
        routes: [
          {
            path: '/tmsMsg/vehicle',
            name: 'vehicle',
            component: './Tms/Vehicle/Vehicle',
            authority: ['iwms.tmsMsg.vehicle'],
          },
          {
            path: '/tmsMsg/shipplanbill',
            name: 'shipplanbill',
            component: './Tms/ShipPlanBill/ShipPlanBill',
            authority: ['iwms.tmsMsg.shipPlanBill'],
          },
          {
            path: '/tmsMsg/shipbill',
            name: 'shipbill',
            component: './Tms/ShipBill/ShipBill',
            authority: ['iwms.tmsMsg.shipBill'],
          },
          {
            path: '/tmsMsg/storeHandover',
            name: 'storeHandover',
            component: './Tms/StoreHandoverBill/StoreHandoverBill',
            authority: ['iwms.tmsMsg.storeHandover']
          },
          {
            path: '/tmsMsg/vehicleMonitoring',
            name: 'vehicleMonitoring',
            component: './Tms/Map/TmsMap',
            authority: ['iwms.tmsMsg.vehicleMonitoring']
          }
        ]
      },
      {
        path: '/inMsg',
        name: 'inMsg',
        org: ['VENDOR'],
        authority: ['iwms.inMsg'],
        icon: 'icon-menu_rukuguanli',
        routes: [
          {
            path: '/inMsg/order',
            name: 'order',
            component: './In/Order/Order',
            authority: ['iwms.inMsg.order'],
            divider: true,
          },
          {
            path: '/inMsg/receive',
            name: 'receive',
            component: './In/Receive/Receive',
            authority: ['iwms.inMsg.receive'],
          }
        ]
      },
      {
        path: '/bigdata',
        name: 'bigData',
        icon: 'icon-menu_data1',
        routes: [{
          path: '/bigdata/:folder/:report',
          component: './Report/ReportPage'
        }]
      },
      {
        path: '/notice',
        name: 'notice',
        icon: 'icon-menu_notice',
        component: './Basic/Notice/Notice',
        authority: ['iwms.system.notice'],
      },
      {
        path: '/account',
        name: 'account',
        hideInMenu: true,
        routes: [
          {
            path: '/account/center',
            name: 'center',
            component: './Account/Profile/Profile',
          },
          {
            path: '/account/version',
            name: 'version',
            component: './Account/Version/Version',
          },
        ],
      },
      {
        path: '/test',
        name: 'test',
        icon: 'icon-menu_info',
        org: ['COMPANY', 'DC','DISPATCH_CENTER'],
        authority: ['iwms.basic'],
        routes: [
          {
            path: '/test/mystore',
            name: 'mystore',
            component: './Basic/MyStore/Store',
            authority: ['iwms.basic.store'],
          },
          {
            path: '/test/ZzTest',
            name: 'ZzTest',
            component: './Test/Zz/ZzTest',
            authority: ['iwms.basic.store'],
          },
          {
            path: '/test/quick',
            name: 'quick',
            component: './Quick/Quick',
            quickuuid:'quickDemo',
            authority: ['iwms.basic.store'],
          },
          {
            path: '/test/quick2',
            name: 'quick2',
            component: './Quick/Quick',
            quickuuid:'ONL_FORM_HEAD',
            authority: ['iwms.basic.store'],
          },
          {
            path: '/test/quick6',
            name: '快速开发框架扩展代码Demo',
            component: './QuickDemo/QuickDemo',
            quickuuid:'quickDemo',
            authority: ['iwms.basic.store'],
          },
          {
            path: '/test/quick7',
            name: '白白白白白',
            component: './Quick/Quick',
            quickuuid:'demo',
            authority: ['iwms.basic.store'],
          },
          {
            path: '/test/qiuhui1',
            name: '邱辉',
            component: './Quick/QuickReport/QuickReport',
            quickuuid:'qiuhui3',
            authority: ['iwms.basic.store'],
          },
          {
            path: '/test/test_note',
            name: 'qiuhuitest',
            component: './Quick/QuickReport/QuickReport',
            quickuuid:'qiuhuitest',
            authority: ['iwms.basic.store'],
          }

        ]
      }

    ],
  }
];
