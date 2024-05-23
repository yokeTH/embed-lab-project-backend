import { PrismaD1 } from '@prisma/adapter-d1';
import { PrismaClient } from '@prisma/client';
import jwt from '@tsndr/cloudflare-worker-jwt';
import response from '../middlewares/response';
import ErrorResponse from '../dtos/error';
import HttpException from '../exceptions/http';
import { HttpClientError } from '../enums/http';
import SuccessResponse from '../dtos/success';

export default async function token(request: Request, env: Env) {
	try {
		const auth = request.headers.get('Authorization');
		if (!auth) return new Response(null, { status: 400 });
		const [authType, authToken, ...other] = auth.split(' ');

		const deviceStatus = await fetch('https://api.netpie.io/v2/device/status', {
			headers: { Authorization: `${authType} ${authToken}` },
			method: 'get',
		});
		if (deviceStatus.status != 200)
			throw new HttpException(`got message:${deviceStatus} code:${deviceStatus.status} from netpie`, HttpClientError.BadRequest);

		const deviceStatusJson = (await deviceStatus.json()) as any;
		const deviceId = deviceStatusJson.deviceid;

		const adapter = new PrismaD1(env.DB);
		const prisma = new PrismaClient({ adapter });

		const pet = await prisma.pet.findUnique({ where: { deviceId } });
		if (!pet) throw new HttpException('please create user first', 400);
		const token = await jwt.sign({ petId: pet?.id }, env.JWT_SECRET);
		return response(new SuccessResponse({ token }));
	} catch (e: unknown) {
		return response(new ErrorResponse(e));
	}
}
