import { HelloWorldMessage } from '@/models/HelloWorldMessageModel';

export default class HelloWorld {
  // region public static methods
  // endregion

  // region private static methods
  // endregion

  // region public members
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  public helloWorld(message: HelloWorldMessage): string {
    return `${message.sender}: ${message.message}`;
  }
  // endregion

  // region private methods
  // endregion
}
