import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import jwt from '@tsndr/cloudflare-worker-jwt';
import HttpException from '../exceptions/http';
import ErrorResponse from '../dtos/error';
import response from '../middlewares/response';
import SuccessResponse from '../dtos/success';
import { HttpSuccess } from '../enums/http';

export default async function webhook(request: Request, env: Env) {
	try {
		const auth = request.headers.get('Authorization');
		if (!auth) throw new HttpException('require Authorization', 400);
		const [authType, token, ..._] = auth.split(' ');

		if (authType != 'Bearer') throw new HttpException('require Bearer token', 400);

		const isValid = await jwt.verify(token, env.JWT_SECRET);
		if (!isValid) throw new HttpException('jwt signature is not valid', 401);

		const data = await request.json();
		const { dustValue, latitude, longitude } = data as any;

		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		if (!dustValue || !latitude || !longitude) throw new HttpException('require key dustValue, latitude and longitude');

		const { payload } = jwt.decode(token) as { payload: any };
		const { petId } = payload;
		const createdRecord = await prisma.record.create({
			data: { latitude: Number(latitude), longitude: Number(longitude), dustValue: Number(dustValue), pet: { connect: { id: petId } } },
		});

		return response(new SuccessResponse(createdRecord, HttpSuccess.Created));
	} catch (e: unknown) {
		return Response.json(new ErrorResponse(e));
	}
}
