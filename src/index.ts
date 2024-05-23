/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import webhook from './post/webhook';
import token from './post/token';
import dust from './get/dust';
import users from './post/users';
import login from './post/login';
import pet from './get/pet';
import response from './middlewares/response';
import SuccessResponse from './dtos/success';

// declare global {
// 	interface Env {
// 		DB: D1Database;
// 	}
// }

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const { method } = request;

		console.log(method, url.pathname);

		if (method == 'POST' && url.pathname == '/webhook') {
			return webhook(request, env);
		} else if (method == 'POST' && url.pathname == '/token') {
			return token(request, env);
		} else if (method == 'POST' && url.pathname == '/login') {
			return login(request, env);
		} else if (method == 'POST' && url.pathname == '/users') {
			return users(request, env);
		} else if (method == 'GET' && url.pathname == '/dust') {
			return dust(request, env);
		} else if (method == 'GET' && url.pathname == '/pet') {
			return pet(request, env);
		}
		return response(new SuccessResponse({ name: 'pet-society-backend', description: 'a final project for embed lab', version: '1.0.13' }));
	},
} satisfies ExportedHandler<Env>;
