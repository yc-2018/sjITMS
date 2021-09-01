import { formatMessage } from 'umi/locale';
export const noticeLocale = {
  titleNew: formatMessage({ id: 'notice.title.new' }),
  new: formatMessage({ id: 'notice.new' }),
  title: formatMessage({ id: 'notice.title' }),
  type: formatMessage({ id: 'notice.type' }),
  typeManage: formatMessage({ id: 'notice.type.manage' }),
  toPublish: formatMessage({ id: 'notice.index.button.new' }),

  formAll: formatMessage({ id: 'notice.index.radioAll' }),
  formPublished: formatMessage({ id: 'notice.index.radiopublished' }),
  formReceived: formatMessage({ id: 'notice.index.radioReceived' }),

  createTitle: formatMessage({ id: 'notice.create.title' }),
  createReceiver: formatMessage({ id: 'notice.create.receiver' }),

  createSelectHEADING: formatMessage({ id: 'notice.create.HEADING' }),
  createSelectCompany: formatMessage({ id: 'notice.create.COMPANY' }),
  createSelectAllCompany: formatMessage({ id: 'notice.create.AllCOMPANY' }),
  createSelectDC: formatMessage({ id: 'notice.create.DC' }),
  createSelectCarrier: formatMessage({ id: 'notice.create.CARRIER' }),
  createSelectVendor: formatMessage({ id: 'notice.create.VENDOR' }),
  createSelectStore: formatMessage({ id: 'notice.create.STORE' }),
  createSelectSelf: formatMessage({ id: 'notice.create.SELF' }),

  createAnswer: formatMessage({ id: 'notice.create.answer' }),
  createAttachment: formatMessage({ id: 'notice.create.attachment' }),
  createUpload: formatMessage({ id: 'notice.create.upload' }),
  createUploadDescribe: formatMessage({ id: 'notice.create.uploadDescribe' }),
  createText: formatMessage({ id: 'notice.create.text' }),
  createUploadSuccess: formatMessage({ id: 'notice.create.uploadSuccess' }),
  createUploadError: formatMessage({ id: 'notice.create.uploadError' }),

  itemTextValide: formatMessage({ id: 'notice.item.text.validate' }),
  itemHasReaded: formatMessage({ id: 'notice.item.hasReaded' }),
  itemUnReaded: formatMessage({ id: 'notice.item.unReaded' }),
  itemNoAttachment: formatMessage({ id: 'notice.item.noAttachment' }),
  itemReply: formatMessage({ id: 'notice.item.reply' }),
  itemReadedCount: formatMessage({ id: 'notice.item.readedCount' }),
  itemDownload: formatMessage({ id: 'notice.item.download' }),
  itemOpen: formatMessage({ id: 'notice.item.open' }),
  itemClose: formatMessage({ id: 'notice.item.close' }),
};