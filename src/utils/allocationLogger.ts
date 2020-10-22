import 'reflect-metadata';
import {createConnection, getConnection, getManager} from 'typeorm';
import { AllocationLog } from '@/entity/Allocations';
import winston = require('winston');
import { EventAllocationLog } from '@/entity/EventLogAllocation';

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

  public static async saveInEventAllocationLog(resource: string, allocationService: string,
                                              requester: string): Promise<void> {
    console.log('trying to save EventAllocation');
    const eventAllocation = new EventAllocationLog();
    eventAllocation.Date = new Date();
    eventAllocation.Resource = resource;
    eventAllocation.AllocationService = allocationService;
    eventAllocation.Requester = requester;
    await getManager().save(eventAllocation);
    winston.info('test saved');
    console.log('eventAllocation was saved');
  }

  public static async updateAllocationTable(table: string, column : string, value: string, id: number) : Promise<void>{
    await getManager().update(table,id, {column:value})
  }

  public static async setAllocationLogDuration(id : number, duration: number) : Promise<void>{
    await getManager().update(AllocationLog,id, {Duration:duration})
  }

}
