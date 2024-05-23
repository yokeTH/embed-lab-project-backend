import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';
import response from '../middlewares/response';
import SuccessResponse from '../dtos/success';
import ErrorResponse from '../dtos/error';

export default async function dust(request: Request, env: Env) {
	try {
		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		const dust = await prisma.record.findMany({
			where: {
				createAt: {
					gte: new Date(Date.now() - 1000 * 60 * 5),
				},
			},
		});

		return response(new SuccessResponse(dust));
	} catch (e: unknown) {
		return response(new ErrorResponse(e));
	}
}
