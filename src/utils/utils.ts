import { Ref } from 'typegoose';
import { ObjectID } from 'bson';

export function capitalize(inputString: string): string {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}

export function getIdFromRef(reference: Ref<any>): string {
  if (reference instanceof ObjectID) {
    return reference.toHexString();
  }
  return reference.id;
}
