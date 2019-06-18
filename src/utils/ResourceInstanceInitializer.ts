import ResourceType from '@/models/ResourceType';
import winston from 'winston';
import resourceInstances from '@/utils/resourceInstances';
import ResourceInstance from '@/models/ResourceInstance';
import axios from 'axios';
import { capitalize } from '@/utils/utils';
import config from '@/config.json';

const targetAmountOfHumanResources = config.resourceInstanceInitializer.targetAmountOfHumanResources;
const humanResourceTypeName = 'Human Resource';
const targetAmountOfExhaustibleResources = config.resourceInstanceInitializer.targetAmountOfExhaustibleResources;
const exhaustibleResourceName = 'Exhaustible Resource';

interface Human {
  name: {
    title: string,
    first: string,
    last: string,
  };
}

interface Exhaustible {
  location: string;
  limit: number;
}

export default class ResourceInstanceInitializer {

  // region public static methods
  public static async initializeResourceInstances(): Promise<void> {
    const resourceTypeCount = await ResourceType.find().estimatedDocumentCount();

    if (resourceTypeCount === 0) {
      return;
    }

    winston.info('Begin initializing resourceInstance...');

    if (config.resourceInstanceInitializer.random) {
      await ResourceInstanceInitializer.initializeHumans();
      await ResourceInstanceInitializer.initializeExhaustibles();
    } else {
      await ResourceInstanceInitializer.initializeFromFile();
    }

    winston.info('Finished saving all instances.');
  }
  // endregion

  // region private static methods
  private static async initializeHumans() {
    winston.debug('Initializing Humans...');

    const humanResourceType = await ResourceType.findOne({ name: humanResourceTypeName }).exec();

    if (!humanResourceType) {
      winston.warn('Could not initialize human resources as the type could not be found.');
      return;
    }
    const currentAmountOfHumans = await ResourceInstance.countDocuments({
      resourceType: humanResourceType._id,
    }).exec();

    const deviationFromTarget = targetAmountOfHumanResources - currentAmountOfHumans;

    if (deviationFromTarget <= 0) {
      winston.debug(`You already have ${currentAmountOfHumans} humans in your database.`);
      return;
    }

    winston.debug('Generating ' + deviationFromTarget + ' humans for you.');
    const humanNames = await ResourceInstanceInitializer.fetchHumanNames(deviationFromTarget);
    for (const human of humanNames) {
      const newName = capitalize(human.name.first) + ' ' + capitalize(human.name.last);
      const newHumanResource = new ResourceInstance({
        attributes: [
          {
            name: 'name',
            value: newName,
          },
        ],
      });
      newHumanResource.resourceType = humanResourceType._id;
      try {
        await newHumanResource.save();
        winston.debug(`Created human instance '${newName}'`);
      } catch (error) {
        winston.error(error.message);
        winston.error(`Could not save human. See error above.`);
      }
    }
  }

  private static async fetchHumanNames(amount: number): Promise<Human[]> {
    try {
      const response = await axios.get('https://randomuser.me/api/', {
        params: {
          inc: 'name',
          results: amount,
        },
      });
      return response.data.results;
    } catch (error) {
      winston.warn(error);
      winston.info('Using default values for generating human resources.');
      const defaultUsers = [];
      for (let i = 0; i < amount; i++) {
        defaultUsers.push({
          name: {
            title: 'mr',
            first: 'Max',
            last: 'Mustermann',
          },
        });
      }
      return defaultUsers;
    }
  }

  private static async initializeExhaustibles() {
    winston.debug('Initializing Exhaustible Resources...');

    const exhaustibleResourceType = await ResourceType.findOne({ name: exhaustibleResourceName }).exec();

    if (!exhaustibleResourceType) {
      winston.warn('Could not initialize exhaustible resources as the type could not be found.');
      return;
    }

    const currentAmountOfExhaustibles = await ResourceInstance.countDocuments({
      resourceType: exhaustibleResourceType._id,
    }).exec();

    const deviationFromTarget = targetAmountOfExhaustibleResources - currentAmountOfExhaustibles;
    if (deviationFromTarget <= 0) {
      winston.debug(`You already have ${currentAmountOfExhaustibles} exhaustible resources in your database.`);
      return;
    }

    winston.debug(`Generating ${deviationFromTarget} exhaustible resources for you.`);
    const exhaustibles = await ResourceInstanceInitializer.fetchExhaustibleNames(deviationFromTarget);
    for (const exhaustible of exhaustibles) {
      const newExhaustible = new ResourceInstance({
        attributes: [
          {
            name: 'location',
            value: exhaustible.location,
          },
          {
            name: 'exhaustion limit',
            value: exhaustible.limit,
          },
        ],
      });
      newExhaustible.resourceType = exhaustibleResourceType._id;
      try {
        await newExhaustible.save();
        winston.debug(`Created new exhaustible resource at '${exhaustible.limit}'`);
      } catch (error) {
        winston.error(error.message);
        winston.error(`Could not save exhaustible resource. See error above.`);
      }
    }
  }

  private static async fetchExhaustibleNames(amount: number): Promise<Exhaustible[]> {
    try {
      const response = await axios.get('https://randomuser.me/api/', {
        params: {
          inc: 'location, dob',
          results: amount,
        },
      });
      return response.data.results.map((result: any) => {
        return {
          location: result.location.city,
          limit: result.dob.age,
        };
      });
    } catch (error) {
      winston.warn(error);
      winston.info('Using default values for generating exhaustible resources.');
      const defaultExhaustibles = [];
      for (let i = 0; i < amount; i++) {
        defaultExhaustibles.push({
          location: 'Factory',
          limit: Math.floor(Math.random() * 100),
        });
      }
      return defaultExhaustibles;
    }
  }

  private static async initializeFromFile() {
    winston.debug('Initializing Resource Instances from file...');

    for (const instance of resourceInstances) {
      const resource = new ResourceInstance({ attributes: instance.attributes });
      try {
        await resource.setResourceTypeByName(instance.resourceType);
      } catch (error) {
        winston.error(`Resource type ${instance.resourceType} not found.`);
      }

      try {
        await resource.save();
        winston.debug(`saved instance of type ${instance.resourceType}`);
      } catch (error) {
        winston.error(error.message);
        winston.error(`instance for type ${instance.resourceType} could not be initialized. See error above.`);
      }
    }
  }
  // endregion

  // region public members
  // endregion

  // region private members
  // endregion

  // region constructor
  // endregion

  // region public methods
  // endregion

  // region private methods
  // endregion
}
