import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class EventAllocationLog {

@PrimaryGeneratedColumn()
public id!: number;

@Column()
public Date!: Date;

@Column()
public Resource!: string;

@Column()
public AllocationService!: string;

@Column({
    default: null,
  })
public TaskId!: number;

@Column({
    default: null,
  })
public ProcessId!: number;

@Column({
  default: null,
})
public Duration!: number;

@Column({
  default: null,
})
public Requester!: string;

@Column({
    default: null,
  })
public Costs!: number;

@Column({
    default: null,
  })
public WaitingTime!: number;

}
