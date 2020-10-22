import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class EventAllocationLog {

@PrimaryGeneratedColumn()
id!: number;

@Column()
Date!: Date;

@Column()
Resource!: string;

@Column()
AllocationService!: string;

@Column({
    default: null,
  })
  TaskId!: number;

@Column({
    default: null,
  })
  ProcessId!: number;

@Column({
  default: null,
})
Duration!: number;

@Column({
  default: null,
})
Requester!: string;

@Column({
    default: null,
  })
  Costs!: number;

@Column({
    default: null,
  })
  WaitingTime!: number;

}

