import { IS_PRODUCTION } from "../paths";

export function getOptimization() {
    return {
        minimize: IS_PRODUCTION,
    };
}