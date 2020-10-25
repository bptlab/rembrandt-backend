import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class AllocationLog {

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
public Duration!: number;

@Column({
  default: null,
})
public Requester!: string;

}
