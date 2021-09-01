/**状态 */
export const InWrhState ={
  INITIAL: {
    name: 'INITIAL',
    caption: '已入园'
  },
  HASDOCK:{
    name: 'HASDOCK',
    caption: '已分配码头'
  },

  RECEIVING: {
    name: 'RECEIVING',
    caption: '收货中'
  },

  FINISHED: {
    name: 'FINISHED',
    caption: '已出园'
  },

  ABORTED:{
    name: 'ABORTED',
    caption: '已作废'
  }
};