import { Ref } from 'typegoose';
import { ObjectID } from 'bson';
import 'reflect-metadata';
import {createConnection} from 'typeorm';
import { AllocationLog } from 'src/entity/Allocations';

export function capitalize(inputString: string): string {
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}

export function getIdFromRef(reference: Ref<any>): string {
  if (reference instanceof ObjectID) {
    return reference.toHexString();
  }
  return reference.id;
}

export async function saveInAllocationLog(resource: string, allocationService: string, requester: string): Promise<void>{
  createConnection().then(async (connection) => {
    const allocation = new AllocationLog();

    allocation.Date = new Date();
    allocation.Resource = resource;
    allocation.AllocationService = allocationService;

    allocation.Requester = requester;
    await connection.manager.save(allocation);
    console.log('test saved');
  }).catch(error => console.log(error));
};
