import path from 'path';
import { PROJECT_DIR } from "../paths";

export function getResolve() {
    return {
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
        alias: {
            'src': path.resolve(PROJECT_DIR, 'src'),
        },
    };
}