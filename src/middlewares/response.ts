import BaseResponse from '../dtos/base';

export default async function response(responseObj: BaseResponse) {
	return Response.json(responseObj, { status: responseObj.code || 200 });
}
