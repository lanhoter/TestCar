# TestCar


```
use a proxy to avoid CORS issue, just for test purpose.
just in case site that doesn’t send Access-Control-*
format: https://cors-anywhere.herokuapp.com/https://example.com
```

const proxyurl = "https://cors-anywhere.herokuapp.com/";

<p>
const liveApiURi = "https://www.cartrawler.com/ctabe/cars.json";


To use use liveApiURiwithProxy
<p>
const liveApiURiwithProxy = `${proxyurl}${liveApiURi}`
then replace the fetch URi in below codes:

```
fetch(liveApiURiwithProxy)
  .then(response => response.json())
  .then(dataJson => {
```

or start local URi served with python http server mainly to resolve CORS issue ( port: 3000)
```
python3 server.py

```
fetch local resource URi:
const localApiURi = 'http://0.0.0.0:3000/src/assets/static/cars.json'

```
fetch(localApiURi)
  .then(response => response.json())
  .then(dataJson => {
```


Start Project

```
 yarn
 yarn dev
```

Build

```
 yarn build
```


```
 yarn build:prod
```

