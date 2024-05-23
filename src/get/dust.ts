import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';
import response from '../middlewares/response';
import SuccessResponse from '../dtos/success';
import ErrorResponse from '../dtos/error';

export default async function dust(request: Request, env: Env) {
	try {
		const url = new URL(request.url);
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		const r = Number(url.searchParams.get('r')) || 5;

		const dust = await prisma.record.findMany({
			where: {
				createAt: {
					gte: new Date(Date.now() - 1000 * 60 * r),
				},
			},
		});

		return response(new SuccessResponse(dust));
	} catch (e: unknown) {
		return response(new ErrorResponse(e));
	}
}
