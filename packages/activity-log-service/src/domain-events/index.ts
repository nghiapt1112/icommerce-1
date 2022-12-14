import { Message } from 'amqplib';
import { ACTIVITY_TOPICS, USER_ACTIVITY_EVENTS } from '@lib/common';
import { logger } from '../config';
import { DBServices } from '../database';

async function handleUserActivityEvent(
  event: T.Events.UserPlacedOrderEvent | T.Events.UserViewedProductEvent | T.Events.UserSearchFilterProductsEvent,
): Promise<void> {
  await DBServices.userActivities.insert({
    payload: event,
    type: event.type,
    userId: (event.metadata as T.ObjectAny).userid as string,
  });
}

export async function handleEventMessage(message: Message) {
  const topic = message.fields.exchange;
  const event = JSON.parse(message.content.toString()) as T.Events.GenericEvent;
  logger.info(`handling ${event.type} event, event id: ${event.id}`);

  if (topic === ACTIVITY_TOPICS.USER_ACTIVITIES) {
    if (event.type === USER_ACTIVITY_EVENTS.USER_ORDER_PLACED) {
      await handleUserActivityEvent(event as T.Events.UserPlacedOrderEvent);
    }

    if (event.type === USER_ACTIVITY_EVENTS.USER_PRODUCT_VIEWED) {
      await handleUserActivityEvent(event as T.Events.UserViewedProductEvent);
    }

    if (event.type === USER_ACTIVITY_EVENTS.USER_PRODUCT_SEARCH_FILTER) {
      await handleUserActivityEvent(event as T.Events.UserSearchFilterProductsEvent);
    }
  }

  return Promise.resolve();
}
