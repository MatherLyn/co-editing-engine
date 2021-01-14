import path from "path";
import { server } from "./dev-server";
import { middleware } from "./dev-server/middlewares";
import { DEV_OUT_DIR, DEV_SERVER_PORT } from "./paths";

function bootstrap() {
    server.use(middleware);

    server.listen(DEV_SERVER_PORT, () => {
        console.log(`Http server started at http://127.0.0.1:${DEV_SERVER_PORT}`);
    });

    server.get('/', (req, res) => {
        const fileName = path.resolve(DEV_OUT_DIR, `./index.html`);
        const { readFile } = middleware.context.compiler.outputFileSystem;

        function readIndexCallback(err: NodeJS.ErrnoException, buffer: Buffer) {
            err && middleware.waitUntilValid(() => readFile(fileName, readIndexCallback));

            const html = buffer.toString();
            res.set('Content-Type', 'text/html');
            res.send(html);
        }

        readFile(fileName, readIndexCallback);
    });
}

bootstrap();
