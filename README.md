# tota11y

An accessibility visualization toolkit

<img src="http://khan.github.io/tota11y/img/tota11y-logo.png" alt="tota11y logo" width="200">

[Try tota11y in your browser](http://khan.github.io/tota11y/#Try-it), or
[read why we built tota11y](http://engineering.khanacademy.org/posts/tota11y.htm).

## Installation

First, [grab the latest release of tota11y](https://github.com/Khan/tota11y/releases/latest).

Then, include it right before `</body>` like so:

```
<script src="tota11y.min.js"></script>
```

## Building

You can build tota11y with:

```
npm install
```

Then, if you want to use the original base class, you would run: 
```
npm run build
```
However, if you wish to support the use of the **Multi** plugin, you would run:
```
npm run-script build-multi
```
This uses _multi.webpack.config.js_ to specify index-multi.js, as the entry point for the webpack app build.

## Testing

You can perform manual testing with tota11y using the following:

```
npm test
```

This will open `http://localhost:8080/webpack-dev-server/` in your browser, which will automatically update as you make changes.

### Testing Plugins Using Config Files

If you wish to test the **Custom** plugin, you would run:
```
npm run-script test-custom
```
This pulls in the file, _./test/custom.json_, and uses it to create a custom plugin in the tota11y toolbar.

If you wish to use the **Multi** plugin, you would run:
```
npm run-script test-multi
```
This pulls in the file, _./test/multi.json_, and uses it to create a custom plugin in the tota11y toolbar.  However, if you test **Multi**, make sure you first run ```npm run-script build-multi```, as this uses a different base class.

## Plugins from Config Files

The **Custom** and **Multi** plugins create custom plugins in the tota11y toolbar, based on parameters passed in the URL string, one of which being the path to a json file containing information about the fixtures to be used and the rules to be run.  The json file contains an array of objects, each object containing:

- branding _(optional)_
- context
- options

Each of these follows the syntax for the [aXe Javascript Accessibility API](https://github.com/dequelabs/axe-core/blob/master/doc/API.md) . The values for [context](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#context-parameter) and [options](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#options-parameter) are based on the parameters passed to the [aXe.a11yCheck function](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#api-name-axea11ycheck), which, indeed is what is directly used to run the scans.

The **Custom** and **Multi** plugins function in almost the same way, except that the **Custom** plugin can only create one custom plugin from the objects in the JSON config file.  It uses the first object in the array and disregards any others.  The only reason you would use **Custom** rather than **Multi** is that **Custom** does not require any changes to the original tota11y base class, as found in _./index.js_.

If provided, the **brand** property of the _branding_ object supplies the title for the generated plugin/s.  

### Custom

To use the Custom plugin in a page, assuming you are not running it with ```npm run-script test-custom```, you would pass in the path to the JSON config file as the value of the **aXeTota11yConf** URL parameter, as follows:

- http://**domain**/?aXea11yConf=**/path/to/conf**.json

### Multi

To use the Multi plugin in a page, assuming you are not running it with ```npm run-script test-multi```, you would pass the **aXeA11yConf** URL parameter, as before, but would also pass in the **aXeTota11yMulti** with a value of true, as follows:

- http://**domain**/?aXeA11yConf=**/path/to/conf**.json&**aXeA11yMulti=true**

If the **application** property is provided for the _branding_ object in the JSON config file, then this is used for the description of the plugin.  If it is not provided, the description is automatically generated from the _options_ object. 

If the **brand** property of the _branding_ object is not provided, it is automatically generated from the _context_ object.

* If aXeA11yMulti=true is set as a URL parameter, and an aXeA11yConf URL paramater is provided which points to the absolute path to a valid conf file, then that conf file is used to populate the pluginscontainer, and the plugins set in plugins/index.js are ignored.
* If aXeA11yMulti=true is set as a URL parameter, and an aXeA11yConf URL paramater is not provided, and there is an aXeA11y object defined in the page, then the tests defined in that object are added to the tests defined in plugins/index.js
* If aXeA11yMulti is not set to true, and there is an aXeA11y object defined in the page, then only the first test defined in that object is added to the tests defined in plugins/index.js
* If aXeA11yMulti is not set to true, and an aXeA11yConf URL paramater is provided which points to the absolute path to a valid conf file, and there is not an aXeA11y object defined in the page, then the custom plugin is added  to the tests defined in plugins/index.js

## Special thanks

Many of tota11y's features come straight from [Deque's aXe](https://github.com/dequelabs/axe-core). We use this library heavily at [Khan Academy](http://khanacademy.org).

The awesome glasses in our logo were created by [Kyle Scott](https://thenounproject.com/Kyle/) and are licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/us/legalcode).

## License

MIT
