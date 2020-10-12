import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class AllocationEntry {

@PrimaryGeneratedColumn()
id: number;

@Column()
Date: Date;

@Column()
Resource : string;

@Column()
AllocationService : string;

@Column()
Duration : number;

@Column()
Requester : string;

}
