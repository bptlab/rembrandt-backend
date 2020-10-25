import { promises as fs } from 'fs';
import path, { resolve } from 'path';
import allocationLogger from '@/utils/allocationLogger';
import {createConnection, getConnection, getManager} from 'typeorm';
import { EventAllocationLog } from '@/entity/EventLogAllocation';
import { AllocationLog } from '@/entity/Allocations';

export default class EventLogReader {

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

public async readEventLog(filePathForEventLog: string): Promise<void> {
    const resultJSON = await fs.readFile(path.join(filePathForEventLog, 'eventlog.txt'), 'utf8');
    const resultObjects = JSON.parse(resultJSON);

    // now update database
    // for each activity in event log
    // find id of (first) corresponding event in allocationlog where resource = assignedresource

    // allocationLogger.setDurationEntry(id, activity.duration)
    // await getManager().update(EventAllocationLog,id, {column:value, column2: value2, ...})

  }

}
