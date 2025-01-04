import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import app from '../../app';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { accessTokenCookieName } from '../../constants';
import { IUser } from '../../models/user';
import { IOrganization } from '../../models/organization';
import { ICategory } from '../../models/category';
import { IStudent } from '../../models/student';
import {
	createMockCategory,
	createMockOrganization,
	createMockStudent,
	createMockUser,
} from '..';

let accessToken: string;
let mongoServer: MongoMemoryServer;

// mock entities
let user: IUser;
let organization: IOrganization;
let category: ICategory;
let student: IStudent;

beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	process.env.ME_CONFIG_MONGODB_URL = mongoServer.getUri();

	const res = await createMockUser();
	user = res.user;
	accessToken = res.accessToken;

	organization = await createMockOrganization(accessToken);
	category = await createMockCategory(accessToken, organization._id);
	student = await createMockStudent(accessToken);
});

afterAll(async () => {
	await mongoServer.stop();
});

describe('POST - Create Transaction', () => {
	it('should create a transaction', async () => {
		const transaction = {
			amount: 100,
			categoryID: category._id,
			studentID: student.studentID,
		};

		const res = await supertest(app)
			.post(`/transaction`)
			.set('Cookie', [`${accessTokenCookieName}=${accessToken}`])
			.send(transaction)
			.expect(200);

		expect(res.body.success).toBe(true);
	});

	it('should not create a transaction with invalid category', async () => {
		const transaction = {
			amount: 100,
			categoryID: '60f1d1f6c9d9b6a5c8b5e7d9',
			studentID: student.studentID,
		};

		const res = await supertest(app)
			.post(`/transaction`)
			.set('Cookie', [`${accessTokenCookieName}=${accessToken}`])
			.send(transaction)
			.expect(200);

		expect(res.body.success).toBe(false);
	});

	it('should not create a transaction with invalid student', async () => {
		const transaction = {
			amount: 100,
			categoryID: category._id,
			studentID: '2301106590',
		};

		const res = await supertest(app)
			.post(`/transaction`)
			.set('Cookie', [`${accessTokenCookieName}=${accessToken}`])
			.send(transaction)
			.expect(200);

		expect(res.body.success).toBe(false);
	});

	it('should not create a transaction with invalid amount', async () => {
		const transaction = {
			amount: -1,
			categoryID: category._id,
			studentID: student.studentID,
		};

		const res = await supertest(app)
			.post(`/transaction`)
			.set('Cookie', [`${accessTokenCookieName}=${accessToken}`])
			.send(transaction)
			.expect(200);

		expect(res.body.success).toBe(false);
	});
});