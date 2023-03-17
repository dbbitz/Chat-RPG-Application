import { Schema, model, now } from 'mongoose';
import { ChatFeedMessagesModel } from './interface';

const ChatFeedMessagesSchema = new Schema<ChatFeedMessagesModel>({
  chatRoomId: { type: Schema.Types.ObjectId, required: true, ref: 'ChatRooms' },
  author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  content: { type: String, required: true },
  image: { type: String },
  directedTo: { type: Number },
  choices: [
    {
      choiceContent: { type: String },
      maxDiceValue: { type: Number },
      selected: { type: Boolean },
    },
  ],
  numberOfComments: { type: Number, required: true },
  numberOfLikes: { type: Number, required: true },
  createdAt: { type: Date, default: now, immutable: true },
  deletedAt: { type: Date },
});

export const ChatFeedMessages = model('ChatFeedMessages', ChatFeedMessagesSchema);
