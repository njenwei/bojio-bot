import {
	Column,
	Entity,
	ManyToOne,
	PrimaryColumn,
	PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class User {
	@PrimaryColumn()
	id!: number

	@Column()
	name!: string

	@Column()
	username!: string
}

@Entity()
export class Location {
	@PrimaryColumn()
	name!: string

	@Column()
	id!: number
}

export enum PlanStatus {
	'confirm' = 'confirm',
	'maybe' = 'maybe',
}

@Entity()
export class Plan {
	@PrimaryGeneratedColumn()
	id!: number

	@ManyToOne(() => User)
	user!: User

	@Column()
	date!: Date

	@ManyToOne(() => Location)
	location!: Location

	@Column()
	status!: string
}
