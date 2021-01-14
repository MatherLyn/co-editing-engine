import MiniCssExtractPlugin from "mini-css-extract-plugin";

export function getModule() {
    return {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'babel-loader',
                    'ts-loader'
                ],
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            // 图片资源抽离为独立文件的阈值
                            limit: 4096,
                            fallback: 'file-loader',
                            // 用于 file-loader 的配置
                            name: '[name].[ext]',
                            outputPath: 'image',
                        },
                    },
                ],
            },
        ],
    }
}