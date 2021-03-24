import path from 'path';
import { PROJECT_DIR } from '../paths';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import MonacoEditorWebpackPlugin from 'monaco-editor-webpack-plugin';

export function getPlugins() {
    return [
        new HtmlWebpackPlugin({
            title: 'Co-Editing Test',
            template: path.join(PROJECT_DIR, './src/demos/index.html'),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].css',
        }),
        new FriendlyErrorsWebpackPlugin(),
        new MonacoEditorWebpackPlugin(),
    ];
}