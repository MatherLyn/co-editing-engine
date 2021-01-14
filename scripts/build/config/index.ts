import { Configuration } from 'webpack';
import { IS_PRODUCTION, PROJECT_DIR } from '../paths';
import { getResolve } from './resolve';
import { getEntry } from './entry';
import { getOutput } from './output';
import { getOptimization } from './optimization';
import { getModule } from './module';
import { getPlugins } from './plugins';

const sourceMap = IS_PRODUCTION ? 'source-map' : 'cheap-module-source-map';

export function getBaseConfig(): Configuration {
    return {
        mode: IS_PRODUCTION ? 'production' : 'development',
        context: PROJECT_DIR,
        devtool: sourceMap,
        resolve: getResolve(),
        entry: getEntry(),
        output: getOutput(),
        optimization: getOptimization(),
        module: getModule(),
        plugins: getPlugins(),
        stats: 'none',
    };
}
