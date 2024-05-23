import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';
import jwt from '@tsndr/cloudflare-worker-jwt';
import { verifyPassword } from '../utils/password';
import response from '../middlewares/response';
import ErrorResponse from '../dtos/error';
import SuccessResponse from '../dtos/success';
import HttpException from '../exceptions/http';

export default async function login(request: Request, env: Env) {
	try {
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		const { email, password } = (await request.json()) as { email?: string; password?: string };

		if (!email || !password) throw new HttpException('require email and password', 400);

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) throw new HttpException('invalid email or password', 401);
		const verify = await verifyPassword(user.password, password);
		if (!verify) throw new HttpException('invalid email or password', 401);

		const payload = { userId: user.id, exp: Math.floor(Date.now() / 1000) + 3600 };
		const token = await jwt.sign(payload, env.JWT_SECRET);
		return response(new SuccessResponse({ user: { ...user, password: undefined }, token }));
	} catch (e: unknown) {
		return response(new ErrorResponse(e));
	}
}
