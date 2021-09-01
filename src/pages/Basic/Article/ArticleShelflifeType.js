export const articleShelflifeType = {
  PRODUCTDATE: {
    name: 'PRODUCTDATE',
    caption: '按生产日期',
  },
  VALIDDATE: {
    name: 'VALIDDATE',
    caption: '按到效期',
  },
  NOCARE: {
    name: 'NOCARE',
    caption: '不管理保质期',
  },
}

export function getShelflifeTypeCaption(state) {
  let caption;

  for (let x in articleShelflifeType) {
    if (articleShelflifeType[x].name === state) {
      caption = articleShelflifeType[x].caption;
      break;
    }
  }

  return caption;
}