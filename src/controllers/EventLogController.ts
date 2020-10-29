import { promises as fs } from 'fs';
import path, { resolve } from 'path';
import allocationLogger from '@/utils/allocationLogger';
import {createConnection, getConnection, getManager, Timestamp} from 'typeorm';
import { EventAllocationLog } from '@/entity/EventLogAllocation';
import { AllocationLog } from '@/entity/Allocations';
var parser = require('fast-xml-parser');

interface EventLogObject {
  log: EventLog;
}

interface EventLog {
  extension: Attribute[];
  global: Object[];
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

public static async readEventLog(filePathForEventLog: string): Promise<void> {

  const options = {
    attributeNamePrefix : "",
    ignoreAttributes : false,
  };

  let startTime: number = 0; 

  const eventLogData = await fs.readFile(path.join(filePathForEventLog, 'eventlog.xes'), 'utf8');
  const eventLogObject : EventLogObject = parser.parse(eventLogData, options);
  //console.log(eventLogObject.log);
  for (const trace of eventLogObject.log.trace){
    for (const event of trace.event) {
      if (event.string.length == 3) {
        if (event.string[1].value == 'start') {
          console.log(event.date.value);
          startTime = Math.round((new Date(event.date.value)).getTime() / 1000);
        }
        if (event.string[1].value == 'complete') {
      //console.log(event.string[2].value)
          const endTime = Math.round((new Date(event.date.value)).getTime() / 1000);
          const duration  = endTime - startTime;
          console.log (duration);
          // TODO: include this: allocationLogger.findEntryWithoutDuration(event.string[2].value, event.string[0].value);
          const id = await allocationLogger.findEntryWithoutDuration(event.string[2].value, "SMile Tour Planning - Rule");
          console.log(id);
          if (id) {
            await allocationLogger.setDurationEntry('AllocationLog', duration.toString(), id)
          }
        }
      }
    }
  }
  eventLogObject.log.trace.forEach( async (trace: Trace) => {
    trace.event.forEach( async (event: Event) => {
      
    });
  });
    

    // now update database
    // for each trace
      // for each activity in trace
    // find id of (first) corresponding event in allocationlog where resource = assignedresource

    // allocationLogger.setDurationEntry(id, activity.duration)
    // await getManager().update(EventAllocationLog,id, {column:value, column2: value2, ...})

  }

}
