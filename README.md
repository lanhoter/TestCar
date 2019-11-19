# TestCar


```
use a proxy to avoid CORS issue, just for test purpose.
just in case site that doesn’t send Access-Control-*
format: https://cors-anywhere.herokuapp.com/https://example.com
```

const proxyurl = "https://cors-anywhere.herokuapp.com/";

<p>
const liveApiURi = "https://www.cartrawler.com/ctabe/cars.json";


use liveApiURiwithProxy 
<p>
const liveApiURiwithProxy = `${proxyurl}${liveApiURi}`


or start local URi served with python http server mainly to resolve CORS issue ( port: 3000)
```
python3 server.py

```
fetch local resource URi:
const localApiURi = 'http://0.0.0.0:3000/src/assets/static/cars.json'




Start Project

```
 yarn
 npm run dev
```

Build

```
 npm run build
```


```
 npm run build:prod
```

