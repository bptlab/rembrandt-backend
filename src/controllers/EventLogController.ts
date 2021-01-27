import { promises as fs } from 'fs';
import path, { resolve } from 'path';
import allocationLogger from '@/utils/AllocationLogger';
import { createConnection, getConnection, getManager, Timestamp } from 'typeorm';
import { EventAllocationLog } from '@/entity/EventLogAllocation';
import { AllocationLog } from '@/entity/Allocations';
const parser = require('fast-xml-parser');
import winston = require('winston');

interface EventLogObject {
  log: EventLog;
}

interface EventLog {
  extension: Attribute[];
  global: object[];
  classifier: Attribute[];
  string: Attribute[];
  trace: Trace[];
}

interface Trace {
  string: Attribute;
  event: Event[];
}

interface Event {
  string: Attribute[];
  date: Attribute;
}

interface Attribute {
  key: string;
  value: string;
}

export default class EventLogController {

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

  public static async readEventLog(filePathForEventLog: string): Promise<boolean> {

    const options = {
      attributeNamePrefix: '',
      ignoreAttributes: false,
    };

    try {
      const eventLogData = await fs.readFile(path.join(filePathForEventLog, 'eventlog.xes'), 'utf8');
      const eventLogObject: EventLogObject = parser.parse(eventLogData, options);
      if (Array.isArray(eventLogObject.log.trace)) {
        for (const trace of eventLogObject.log.trace) {
          this.updateLog(trace);
        }
      } else {
        this.updateLog(eventLogObject.log.trace);
      }
    } catch (error) {
      winston.error(error);
      return false;
    }
    return true;
  }

  public static async updateLog(trace: any): Promise<boolean> {
    let startTime: number = 0;
    try {
      for (const event of trace.event) {
        // if a resource was assinged to this event
        if (event.string.some((attribute: any) => (attribute.key.includes('org:resource')))) {
          // find correct line in eventLog
          const indexOfTransition = event.string.findIndex((attribute: Attribute) => attribute.key.includes('lifecycle:transition'));
          const indexOfResource = event.string.findIndex((attribute: Attribute) => attribute.key.includes('org:resource'));
          const indexOftask = event.string.findIndex((attribute: Attribute) => attribute.key.includes('concept:name'));
          const indexOfCosts = event.string.findIndex((attribute: Attribute) => attribute.key.includes('total'));
          if (event.string[indexOfTransition].value === 'start') {
            startTime = Math.round((new Date(event.date.value)).getTime() / 1000);
          }
          if (event.string[indexOfTransition].value === 'complete') {
            const endTime = Math.round((new Date(event.date.value)).getTime() / 1000);
            const duration = endTime - startTime;
            // look for matching entry based on taskname and resource
            const id = await allocationLogger.findEntryWithoutDuration(event.string[indexOfResource].value, event.string[indexOftask].value);
            winston.info('Duration of' + id + ' will be set to ' + duration);
            if (id) {
              await allocationLogger.setDurationEntry('AllocationLog', duration, id);
              if (indexOfCosts >= 0) {
                const costs = event.string[indexOfCosts].value;
                await allocationLogger.setCostsEntry('EventAllocationLog', parseInt(costs, 10), id);
              }
              // include other database column updates (e.g. process ID, taskId) here,
              // like it was done for the costs of a task.
            }
          }
        }
      }
    } catch (error) {
      winston.error(error);
      return false;
    }
    return true;
  }

}
