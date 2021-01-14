import webpack from "webpack";
import WebpackDevMiddleware, { Options } from 'webpack-dev-middleware';
import { getBaseConfig } from "../config";
import { DEV_PUBLIC_PATH } from '../paths';


const compiler = webpack(getBaseConfig());

const middleWareOptions: Options = {
    publicPath: DEV_PUBLIC_PATH,
    writeToDisk: false,
}

export const middleware = WebpackDevMiddleware(compiler, middleWareOptions);
