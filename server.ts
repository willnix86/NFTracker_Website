import express, { Express } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as socketio from 'socket.io';
import moment from 'moment';

const port: number = parseInt(process.env.PORT || '3000', 10);
const dev: boolean = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async() => {
    const app: Express = express();
    const server: http.Server = http.createServer(app);
    const io: socketio.Server = new socketio.Server();
    io.attach(server);

    let interval: NodeJS.Timeout;

    io.on('connection', (socket: socketio.Socket) => {
        console.log('connection');
        if (interval) {
          clearInterval(interval);
        }
        interval = setInterval(async () => await getApiAndEmit(socket), 5000);

        socket.on('disconnect', () => {
            console.log('client disconnected');
        })
    });

    app.all('*', (req: any, res: any) => nextHandler(req, res));

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});

const getApiAndEmit = async (socket: socketio.Socket) => {
  const artistsJSON = socket.handshake.query.artists;
  const artists = JSON.parse(artistsJSON as string);
  if (!artists || artists.length === 0) {
    return;
  }

  const date = moment().subtract(5, 'seconds').unix();
  const artistsWithNewDrops = [];

  for (let i = 0; i < artists.length; i++) {
    let res, resJSON;
    switch (artists[i].platform) {
      case 'opensea':
        res = await fetch(`https://api.opensea.io/api/v1/events?account_address=${artists[i].address}&event_type=created&occurred_after=${date}`);
        resJSON = await res.json();
        break;
      default:
        break;
    }

    if (resJSON && resJSON.asset_events.length > 0) {
      artistsWithNewDrops.push(artists[i].artist);
    }
  }

  socket.emit("FromAPI", artistsWithNewDrops);
};