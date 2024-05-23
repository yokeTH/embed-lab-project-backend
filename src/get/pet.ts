import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';
import jwt from '@tsndr/cloudflare-worker-jwt';
import response from '../middlewares/response';
import ErrorResponse from '../dtos/error';
import HttpException from '../exceptions/http';
import SuccessResponse from '../dtos/success';

export default async function pet(request: Request, env: Env) {
	try {
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		const auth = request.headers.get('Authorization');
		if (!auth) throw new HttpException('require Authorization', 400);
		const [authType, token, ..._] = auth.split(' ');
		if (authType != 'Bearer') throw new HttpException('require Bearer token', 400);

		const isValid = await jwt.verify(token, env.JWT_SECRET);
		if (!isValid) throw new HttpException('Invalid token', 401);

		const { payload } = jwt.decode(token) as { payload: any };
		const { userId } = payload;
		const pet = await prisma.pet.findMany({
			where: {
				owner: { id: userId },
			},
			include: {
				record: {
					where: {
						NOT: {
							AND: {
								latitude: 0,
								longitude: 0,
								dustValue: 0,
							},
						},
					},
					orderBy: {
						createAt: 'desc',
					},
					take: 1,
				},
			},
		});

		return response(new SuccessResponse(pet));
	} catch (e: unknown) {
		return response(new ErrorResponse(e));
	}
}
