# MMM-SpotPrices

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

Module displays current and available future energy prices.
Default settings display prices in Finland.

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-SpotPrices',
            config: {
                // See below for configurable options
            }
        }
    ]
}
```

## Configuration options

| Option           | Description
|----------------- |-----------
| `region`         | *Optional*  Energy price region <br><br>**Options:** DK1, DK2, EE, FI, LT, LV, NO1, NO2, NO3, NO4, NO5, SE1, SE2, SE3, SE4 <br>**Default** "FI"
| `noChart`        | *Optional*  Remove price chart <br><br>**Options:** true, false <br>**Default** false
