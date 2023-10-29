module.exports = {
    //...
    resolve: {
        extensions: ['.js', '.jsx'],
        alias: {
            core: path.join(__dirname, 'core'),
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                loader: "css-loader",
                options: {
                    modules: false,
                },
            },
        ],
    }
};
