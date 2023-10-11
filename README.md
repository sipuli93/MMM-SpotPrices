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
| `Chart`          | *Optional*  Display price chart <br><br>**Type:** `boolean` <br>**Default:** true
| `includeTax`     | *Optional*  Include tax in prices <br><br>**Type:** `boolean` <br>**Default:** true
| `taxModifier`    | *Optional*  Multiplier to add tax, ex. for 10% tax use `1.1` FI REGION TAXES ARE ADDED AUTOMATICALLY! <br>**Type:** `float` <br>**Default:** `1.0`
| `currentPriceHeader` | *Optional*  Add header for current price <br><br>**Type:** `string` <br>**Default:** "Sähkön hinta nyt"
| `currentPriceFooter` | *Optional*  Add footer for current price <br><br>**Type:** `string` <br>**Default:** "snt/kWh"
| `chartConfig`    | *Optional*  Modify default chart config <br><br>**Default:** `{
                                type: "bar",
                                data: {
                                        datasets: [{
                                                datalabels: {
                                                        align: "end",
                                                        anchor: "end",
                                                        rotation: -90
                                                }
                                        }]
                                },
                                options: {
                                        elements: {
                                                bar: {
                                                        backgroundColor: "#999"
                                                }
                                        },
                                        maxBarThickness: 12,
                                        barPercentage: 0.8,
                                        layout: {
                                                padding: {
                                                        top: 20
                                                }
                                        },
                                        title: {
                                                display: false
                                        },
                                        scales: {
                                                y: {
                                                        ticks: {
                                                                display: false
                                                        }
                                                },
                                                x: {
                                                        ticks: {
                                                                font: {
                                                                        weight: "bold"
                                                                },
                                                                color: "#fff"
                                                        }
                                                }
                                        },
                                        plugins: {
                                                legend: {
                                                        display: false
                                                },
                                                tooltip: {
                                                        enabled: false
                                                },
                                                datalabels: {
                                                        color: "#fff",
                                                        font: {
                                                                weight: "bold"
                                                        },
                                                        formatter: function(value, context){
                                                                let numb = Math.round((value + Number.EPSILON) * 10) / 10;
                                                                return numb.toFixed(1).replace(".",",");
                                                        }
                                                }
                                        }
                                }
                        }
`
