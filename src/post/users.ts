import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';
import response from '../middlewares/response';
import SuccessResponse from '../dtos/success';
import { hashPassword } from '../utils/password';
import ErrorResponse from '../dtos/error';
import HttpException from '../exceptions/http';
import jwt from '@tsndr/cloudflare-worker-jwt';

export default async function users(request: Request, env: Env) {
	try {
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		const data = (await request.json()) as any;

		if (!(data.name && data.password && data.email)) throw new HttpException('require name, password and email', 400);
		const hashedPassword = await hashPassword(data.password);
		const user = await prisma.user.create({
			data: {
				name: data.name,
				password: hashedPassword,
				email: data.name,
			},
		});
		let pets: any;
		if (data.pets?.length > 0)
			pets = await prisma.pet.createManyAndReturn({ data: data.pets.map((e: any) => ({ ...e, ownerId: user.id })) });

		const payload = { userId: user.id, exp: Math.floor(Date.now() / 1000) + 3600 };
		const token = await jwt.sign(payload, env.JWT_SECRET);

		return response(new SuccessResponse({ user, pets, token }));
	} catch (e: unknown) {
		return response(new ErrorResponse(e));
	}
}
