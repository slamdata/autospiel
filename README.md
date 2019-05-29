Install https://github.com/WP-API/Basic-Auth onto your Wordpress, add `styles.css` to your theme and then run the following

```
node ./index.js www.example.com "username" "password" ./sources ./extras.json ./Menu.md ./templates/Machine\ learning
node ./index.js www.example.com "username" "password" ./sources ./extras.json ./Menu.md ./templates/Data warehousing
node ./index.js www.example.com "username" "password" ./sources ./extras.json ./Menu.md ./templates/Visualization
```

You can add more templates to each template type by adding markdown / mustache files to each folder in `./templates`. Try copying one as a starting point.

You can add more destinations to each template type by adding json files to each folder in `./templates`. Try copying one as a starting point.

You can add more sources by adding json files to `./sources`. Try copying one as a starting point.
