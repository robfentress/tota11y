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
npm run build
```

## Testing
### Testing with default plugins

You can perform manual testing with tota11y using the following:

```
npm test
```

This will open `http://localhost:8080/webpack-dev-server/` in your browser, which will automatically update as you make changes.

### Testing the Multi plugin

If you wish to use the **Multi** plugin, you would run either `npm run-script test-param` or `npm run-script test-conf`.  Both generate custom plugins from an array of conf objects.  The difference is that `test-param` gets the conf objects from a separate JSON file, as specified in the _aXeA11yConf_ URL parameter, whereas `test-conf` loads a page that has the conf objects defined in the page itself.

##Configuring
### conf object format

The **Multi** plugin creates a separate custom plugin in the tota11y toolbar for each conf object specified in the JSON config file or in the _conf_ array of the _aXeA11y_ object defined in the page itself.  Each conf object describes the _context_ within the page that the checks are to be run on, along with _options_ that determine which rules are to be tested.  So, the _conf_ object consists of the following properties, which are, themselves, objects:

- plugin _(optional)_
- context
- options

Each of these follows the syntax for the [aXe Javascript Accessibility API](https://github.com/dequelabs/axe-core/blob/master/doc/API.md) . The values for [context](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#context-parameter) and [options](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#options-parameter) are based on the parameters passed to the [aXe.a11yCheck function](https://github.com/dequelabs/axe-core/blob/master/doc/API.md#api-name-axea11ycheck), which, indeed is what is directly used to run the scans.

The _plugin_ object is used to control how the custom plugins are listed in the tota11y toolbar.  It consists of the **title** and **description** properties.  

If provided, the **title** property supplies the title for the generated plugin/s.  If it is not provided, it is automatically generated from the _context_ object.

If the **description** property is provided, then this is used for the description of the plugin.  If it is not provided, the description is automatically generated from the _options_ object. 

### Configuring Multi with URL parameters

To configure the Multi plugin to create custom plugins based on a separate JSON config file, you would pass in the path to the config file as the value of the **aXeA11yConf** URL parameter, as follows

- http://**domain**/?aXeA11yConf=**/path/to/conf.json**

The path is relative to the root of the domain and should include the initial slash.

By default, this will only display the tests you have specified in the config file.  If you wish to also display the plugins that usually display in the tota11y toolbar, you would set the **aXeA11yMulti** URL parameter to true.

- http://**domain**/?aXeA11yConf=/path/to/conf.json&**aXeA11yMulti=true**

### Configuring Multi from within the page to be scanned

You can also configure the custom plugins you want Multi to display by creating an _aXeA11y_ object within the page itself.  This object would contain the **conf** and **multi** properties with these serving roughly the same purpose as the **aXeA11yConf** and **aXeA11yMulti** URL parameters. However, rather than referencing the path to a config file, the **conf** property would be the actual array of conf objects that would have been provided in that config file.  The **multi** property would be a boolean and would serve thge same function as the **aXeA11yMulti** URL parameter.

### Precedence in configuration methods

If a page contains an _aXeA11y_ object, its properties can be overridden by specifying the corresponding parameters in the URL string.  

If the **aXeA11yConf** parameter is provided, it completely replaces the array specified by the **conf** parameter of the _aXeA11y_ object.

Assuming either the **conf** property or the **aXeA11yConf** parameter have been set, if no value is provided for **aXeA11yMulti** or **multi**, only the plugins specified in the conf objects are displayed.  However, if neither **conf** nor **aXeA11yConf** have been set, then the default plugins _are_ displayed.

## Special thanks

Many of tota11y's features come straight from [Deque's aXe](https://github.com/dequelabs/axe-core). We use this library heavily at [Khan Academy](http://khanacademy.org).

The awesome glasses in our logo were created by [Kyle Scott](https://thenounproject.com/Kyle/) and are licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/us/legalcode).

## License

MIT
