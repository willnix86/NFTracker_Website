import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as socketio from 'socket.io';

const port: number = parseInt(process.env.PORT || '3000', 10);
const dev: boolean = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async() => {
    const app: Express = express();
    const server: http.Server = http.createServer(app);
    const io: socketio.Server = new socketio.Server();
    io.attach(server);

    app.get('/', async (_: Request, res: Response) => {
        res.send('NFTracker: Coming Soon to Android and iOS')
    });

    let interval: NodeJS.Timeout;

    io.on('connection', (socket: socketio.Socket) => {
        console.log('connection');
        if (interval) {
          clearInterval(interval);
        }
        interval = setInterval(() => getApiAndEmit(socket), 1000);

        socket.on('disconnect', () => {
            console.log('client disconnected');
        })
    });

    app.all('*', (req: any, res: any) => nextHandler(req, res));

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});

const getApiAndEmit = (socket: socketio.Socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};