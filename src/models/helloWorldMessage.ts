import { Document, Schema, Model, model } from 'mongoose';
import HelloWorldMessage from '@/interfaces/HelloWorldMessage';

export interface IHelloWorldMessageModel extends HelloWorldMessage, Document {
}

const helloWorldMessageSchema = new Schema({
    message: String,
    sender: String,
});

const helloWorldMessageModel: Model<IHelloWorldMessageModel> = model('HelloWorldMessage', helloWorldMessageSchema);

export default helloWorldMessageModel;
