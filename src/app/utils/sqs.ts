import { SHIPMENT_CREATION_QUEUE_URL } from '../config';
import { SHIPMENT_CREATE_TYPE } from '../services/service-types';

export default class SQS {
  static async sendShipmentNotification(shipment: SHIPMENT_CREATE_TYPE) {
    if (!SHIPMENT_CREATION_QUEUE_URL) throw new Error('Missing Queue URL'); //for testing purposes
    const params = {
      MessageBody: JSON.stringify(shipment),
      QueueURL: SHIPMENT_CREATION_QUEUE_URL,
      MessageDeduplicationId: shipment.id,
      MessageGroupId: 'CustomerShipments'
    };
    return this._sendMessage(params);
  };
  /*
    Dummy to save downloading the entire npm aws package
  */
  static async _sendMessage(params) {
    return params;
  };
};