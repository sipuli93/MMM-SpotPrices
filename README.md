# MMM-SpotPrices

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

Module displays current and available future energy prices.
Default settings display prices in Finland including taxes.
Source for data is [spot-hinta.fi](https://spot-hinta.fi/).

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
| `region`         | *Optional*  Energy price region <br><br>**Options:** DK1, DK2, EE, FI, LT, LV, NO1, NO2, NO3, NO4, NO5, SE1, SE2, SE3, SE4 <br>**Type:** `string` <br>**Default:** "FI"
| `chart`          | *Optional*  Display price chart <br><br>**Type:** `boolean` <br>**Default:** true
| `onlyChart`          | *Optional*  Disable current price block and show chart only. <br><br>**Type:** `boolean` <br>**Default:** false
| `priceResolution`    | *Optional*  Price resolution. <br><br>**Options:** 15 or 60 <br>**Type:** `integer` <br>**Default:** 15
| `includeCurrent` | *Optional*  Include current price to chart. Current price is highlighted. <br><br>**Type:** `boolean` <br>**Default:** false
| `includePast`    | *Optional*  Include past prices to chart. Current price is highlighted. <br><br>**Type:** `boolean` <br>**Default:** false
| `includeTax`     | *Optional*  Include tax in prices <br><br>**Type:** `boolean` <br>**Default:** true
| `taxModifier`    | *Optional*  Multiplier to add tax, ex. for 10% tax use `1.1` FI REGION TAXES ARE ADDED AUTOMATICALLY! <br>**Type:** `float` <br>**Default:** `1.0`
| `priceDesimals`      | *Optional*  Set amount of displayed desimals. <br><br>**Type:** `integer` <br>**Default:** 1
| `priceDesimalSeparator`      | *Optional*  Set desimal separator. <br><br>**Type:** `string` <br>**Default:** ","
| `currentPriceHeader` | *Optional*  Add header for current price <br><br>**Type:** `string` <br>**Default:** "Sähkön hinta nyt"
| `currentPriceFooter` | *Optional*  Add footer for current price <br><br>**Type:** `string` <br>**Default:** "snt/kWh"
