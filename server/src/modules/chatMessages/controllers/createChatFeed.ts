import { Request, Response } from 'express';
import { ChatFeedMessagesModel } from '../interface';
import * as chatFeedRoomServices from '../services';
import { webSocketInitializer } from '../../../index';
import { AuthenticatedUserDataRequest } from '../../../interfaces';

export async function createChatFeed(req: Request, res: Response): Promise<void> {
  const feedData: ChatFeedMessagesModel = req.body;
  feedData['author'] = (req as AuthenticatedUserDataRequest).userId;

  const result = await chatFeedRoomServices.create(feedData);

  if (!result.error) {
    const newPost = { ...result.data.newFeed } ;

    const message = {
      action: 'message',
      data: {
        chatRoom: result.data.newFeed.chatRoomId,
        message: newPost,
      }
    }

    await webSocketInitializer.redisPub.publish('feedRoom', JSON.stringify(message));

    res.status(200).json(result);
    return;
  }

  res.status(result.error).json(result.message);
  return;
}