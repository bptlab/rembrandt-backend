import 'reflect-metadata';
import { createConnection, getConnection, getManager } from 'typeorm';
import { AllocationLog } from '@/entity/Allocations';
import { EventAllocationLog } from '@/entity/EventLogAllocation';
import winston = require('winston');

export default class RootTypeInitializer {

  public static async queryDatabase(sqlQuery: string): Promise<string> {
    const entityManager = getConnection().manager;
    const rawData = await entityManager.query(sqlQuery);
    return rawData;
  }

  public static async createAllocationLogConnection(): Promise<void> {
    const connection = await createConnection();
  }

  public static async saveInAllocationLog(resource: string, allocationService: string,
                                          requester: string): Promise<void> {
    winston.info('now saving in allocationlog: '
                  + resource + ', '
                  + allocationService);
    const allocation = new AllocationLog();
    allocation.Date = new Date();
    allocation.Resource = resource;
    allocation.AllocationService = allocationService;
    allocation.Requester = requester;
    await getManager().save(allocation);
  }

  public static async saveInEventAllocationLog(resource: string, allocationService: string,
                                               requester: string): Promise<void> {
    const eventAllocation = new EventAllocationLog();
    eventAllocation.Date = new Date();
    eventAllocation.Resource = resource;
    eventAllocation.AllocationService = allocationService;
    eventAllocation.Requester = requester;
    await getManager().save(eventAllocation);
  }

  public static async updateAllocationTable(table: string, column: string, value: string, id: number): Promise<void> {
    await getManager().update(table, id, { column: value });
  }

  public static async setDurationEntry(table: string, value: string, id: number): Promise<void> {
    await getManager().update(table, id, { Duration: value });
  }

  public static async findEntryWithoutDuration(resource: string, allocationService: string): Promise<number | undefined> {
    const resourceid = resource.substr(resource.indexOf('_') + 1,resource.length)
    try {
      const entry = await getManager().findOne(AllocationLog, {
        select: ["id"],
        where: {
          Duration: null,
          AllocationService: allocationService,
          //Resource: resourceid
        }
        
      })
      return entry?.id;
    } catch (error) {
      return undefined;
    }
  }

}
