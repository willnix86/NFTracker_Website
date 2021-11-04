import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import * as socketio from 'socket.io';
import moment from 'moment';

const port: number = parseInt(process.env.PORT || '3000', 10);
const dev: boolean = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async() => {
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true)
      handle(req, res, parsedUrl)
    }).listen(port)

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

    // tslint:disable-next-line:no-console
    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`
    )
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

  socket.emit("NFTracker", artistsWithNewDrops);
};