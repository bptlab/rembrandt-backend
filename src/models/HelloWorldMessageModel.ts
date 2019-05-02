import { prop, Typegoose } from 'typegoose';

export class HelloWorldMessage extends Typegoose {
  @prop({ required: true })
  public message: string = '';

  @prop({ required: true })
  public sender: string = '';
}

const HelloWorldMessageModel = new HelloWorldMessage().getModelForClass(HelloWorldMessage);

export default HelloWorldMessageModel;
