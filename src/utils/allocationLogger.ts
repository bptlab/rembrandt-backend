import 'reflect-metadata';
import {createConnection, getConnection, getManager} from 'typeorm';
import { AllocationLog } from '@/entity/Allocations';
import winston = require('winston');

export default class RootTypeInitializer {

 public static async queryAllocationLog(sqlQuery: string): Promise<string> {
  console.log('trying to query');
  const entityManager = getConnection().manager;
  const rawData = await entityManager.query(sqlQuery);
  console.log(rawData);
  return rawData;
 }

 public static async createAllocationLogConnection(): Promise<void>{
  const connection = await createConnection();
 }

 public static async saveInAllocationLog(resource: string, allocationService: string,
                                         requester: string): Promise<void> {
    console.log('trying to save');
    const allocation = new AllocationLog();
    allocation.Date = new Date();
    allocation.Resource = resource;
    allocation.AllocationService = allocationService;
    allocation.Requester = requester;
    await getManager().save(allocation);
    winston.info('test saved');
    console.log('test really saved - for real');
  }
}
