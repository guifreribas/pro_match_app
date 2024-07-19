import { environment } from '../../environments/environment.development';
import { environment as prod } from '../../environments/environment';

const enum Environment {
  dev = 'dev',
  prod = 'prod',
}
const ENV: Environment = Environment.dev;

const apiUrl = ENV === Environment.dev ? environment.api_url : prod.api_url;

export const config = {
  apiUrl,
};
