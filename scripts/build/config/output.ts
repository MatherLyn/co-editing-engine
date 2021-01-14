import { IS_PRODUCTION, PROD_OUT_DIR, DEV_OUT_DIR, DEV_PUBLIC_PATH, PROD_PUBLIC_PATH } from "../paths";

export function getOutput() {
    return {
        path: IS_PRODUCTION ? PROD_OUT_DIR : DEV_OUT_DIR,
        filename: `js/[name].js`,
        chunkFilename: `js/[name].js`,
        publicPath: IS_PRODUCTION ? PROD_PUBLIC_PATH : DEV_PUBLIC_PATH,
    };
}