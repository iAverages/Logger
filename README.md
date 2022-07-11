# Logger

Simple logger used in all my projects

## Usage

Simple

```js
const logger = require("@iaverage/logger");

logger.info("Log messages to logs/ and console!");
```

Loki

```js
const logger = require("@iaverage/logger");

logger.setLokiSettings({
    url: "https://ip:port/loki/api/v1/push",
    metadata: { label: "value" },
});
logger.info("Push messages to loki!");
```

