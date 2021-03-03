# devcert - Development SSL made easy

**Fork of https://github.com/davewasmer/devcert/ with the following change:**

_A full root certificate is generated and authorized each time for security,
deleting the private keybefore returning the signed key and certificate which
should then be cached by the application.
If the certificate is invalidated, a new full generation process can be run._

Available at:

```
npm install devcert-sanscache
```

### Overview

So, running a local HTTPS server usually sucks. There's a range of approaches,
each with their own tradeoff. The common one, using self-signed certificates,
means having to ignore scary browser warnings for each project.

devcert makes the process easy. Want a private key and certificate file to use
with your server? Just ask:

```js
import * as https from 'https';
import * as express from 'express';
import getDevelopmentCertificate from 'devcert';

let app = express();

app.get('/', function (req, res) {
  res.send('Hello Secure World!');
});

getDevelopmentCertificate('myapp').then((ssl) => {
  https.createServer(ssl, app).listen(3000);
});
```

Now open https://myapp:3000 (assuming host configuration, or otherwise https://localhost:3000) and voila
- your page loads with no scary warnings or hoops to jump through.

### Certificate Installation

Thankully, Firefox makes this easy. There's a point-and-click wizard for
importing and trusting a certificate - devcert will instead automatically
open Firefox and kick off this wizard for you. Simply follow the prompts to
trust the certificate.

The software installed varies by OS:

* Mac: `brew install nss`
* Linux: `apt install libnss3-tools`
* Windows: N/A

## How it works

When you ask for a development certificate, devcert  will create a root certificate
authority and add it to your OS and various browser trust stores. You'll likely
see password prompts from your OS at this point to authorize the new root CA.

devcert-sanscache then uses this root certificate to authorize a new SSL certificate,
before deleting the private key for the root certificate.
This ensures that browsers won't show scary warnings about untrusted certificates,
since your OS and browsers will now trust devcert's certificate. The root CA
certificate is unique to your machine only, and is generated on-the-fly when it
is first installed. No other certificates can be generated from this root CA
once the private key has been deleted.

Since your browser & OS now trust the root authority, they'll trust the certificate
for your app - no more scary warnings!

## License

MIT © [Dave Wasmer](http://davewasmer.com)
