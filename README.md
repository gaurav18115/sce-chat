# Socket Chat Express

## Installation

Firstly, install packages and run the users json server. Go to `db` directory:

```bash
npm install
npm run json:server

```

Secondly, install packages in the root folder annd run the chat application:

```bash
npm install
npm run devstart
```

## Packages Used

```bash
express
express-session

passport
passport-local

session-file-store
socket.io
uuid
```

## Usage

Go the `http://localhost:3000/ to access the chat application.

By default, there are two users - test/pass and user/pass. You can add more users in `db/db.json` json file.

## License

[MIT](https://choosealicense.com/licenses/mit/)
