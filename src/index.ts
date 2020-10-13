import 'reflect-metadata';
import {createConnection} from 'typeorm';
import { AllocationLog } from './entity/Allocations';

createConnection({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '12345',
  database: 'mysql',
  entities: [
     __dirname + '/entity/*.ts',
  ],
  synchronize: true,
  logging: false,
}).then(async connection => {
  const allocation = new AllocationLog();

  allocation.Date = new Date();
  allocation.Resource = 'Testresource';
  allocation.AllocationService = 'Testservice';
  allocation.Duration = 100;
  allocation.Requester = 'testrequester';

  await connection.manager.save(allocation);
  console.log('test saved');

}).catch(error => console.log(error));
