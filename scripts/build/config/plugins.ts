import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import { PROJECT_DIR } from '../paths';

export function getPlugins() {
    return [
        new HtmlWebpackPlugin({
            title: 'Co-Editing Test',
            template: path.join(PROJECT_DIR, './test.html'),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].css',
        }),
        new FriendlyErrorsWebpackPlugin()
    ];
}