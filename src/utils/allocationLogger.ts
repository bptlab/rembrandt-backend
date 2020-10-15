import 'reflect-metadata';
import {createConnection} from 'typeorm';
import { AllocationLog } from '@/entity/Allocations';
import winston = require('winston');

export default class RootTypeInitializer {

 public static async saveInAllocationLog(resource: string, allocationService: string,
                                         requester: string): Promise<void> {

  createConnection().then(async (connection) => {
    const allocation = new AllocationLog();
    allocation.Date = new Date();
    allocation.Resource = resource;
    allocation.AllocationService = allocationService;
    allocation.Requester = requester;
    await connection.manager.save(allocation);
    winston.info('test saved');
    }).catch((error) => winston.error(error));
  }
}
