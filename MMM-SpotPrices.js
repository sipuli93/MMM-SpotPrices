/* global Module */

/* Magic Mirror
 * Module: MMM-SpotPrices
 *
 * By sipuli93
 * MIT Licensed.
 */

Module.register("MMM-SpotPrices", {
	defaults: {
		updateInterval: 1000*60*1,
		updateDataInterval: 1000*60*60,
		retryDelay: 1000*60,
		animationSpeed: 400,
		Chart: true,
		includeCurrent: false,
		includePast: false,
		region: "FI",
		includeTax: true,
		taxModifier: 1.0,
		currentPriceHeader: "Sähkön hinta nyt",
		currentPriceFooter: "snt/kWh",
		chartConfig:{
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
							top: 27
						}
					},
					title: {
						display: false
					},
					scales: {
						y: {
							ticks: {
								display: false
							},
							suggestedMax: 15
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
		},
	},

	requiresVersion: "2.1.0", // Required version of MagicMirror

	start: function() {
		var self = this;
		Log.info("Starting module: " + this.name);
		var dataRequest = null;

		Chart.register(ChartDataLabels);

		//Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.getData();
		setInterval(function() {
			self.loadPricesChart();
		}, this.config.updateInterval);
	},

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;
		var corsProxy = "http://" + address + ":" + port + "/cors?url="
		var url = "https://api.spot-hinta.fi/TodayAndDayForward?region=" + this.config.region + "&HomeAssistant=false";
		var retry = true;

		var dataRequest = new XMLHttpRequest();
		dataRequest.open("GET", corsProxy + url, true);
		dataRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processData(JSON.parse(this.response));
				} else if (this.status === 401) {
					self.updateDom(self.config.animationSpeed);
					Log.error(self.name, this.status);
					retry = false;
				} else {
					Log.error(self.name, "Could not load data.");
				}
				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataRequest.send();
	},


	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var self = this;
		var nextLoad = this.config.updateDataInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var self = this;

		var wrapper = document.createElement("div");
		wrapper.classList.add("flex-row");

		if (this.dataRequest) {
			var currentPriceElem = document.createElement("div");
			currentPriceElem.classList.add("flex-column");
			var currentPriceHeader = document.createElement("div");
			currentPriceHeader.appendChild(document.createTextNode(this.config.currentPriceHeader));
			currentPriceElem.appendChild(currentPriceHeader);
			var currentPriceValue = document.createElement("div");
			currentPriceValue.id = "currentPrice";
                        currentPriceValue.appendChild(document.createTextNode(". . ."));
			currentPriceElem.appendChild(currentPriceValue);
                        var currentPriceSup = document.createElement("div");
                        currentPriceSup.appendChild(document.createTextNode(this.config.currentPriceFooter));
                        currentPriceElem.appendChild(currentPriceSup);

			wrapper.appendChild(currentPriceElem);

			if (! this.config.noChart){
				var futureCanvasWrapper = document.createElement("div");
				futureCanvasWrapper.classList.add("chart-holder");
				var futureCanvasElem = document.createElement("canvas");
				futureCanvasElem.id = "pricesChart";
				futureCanvasWrapper.appendChild(futureCanvasElem);

				wrapper.appendChild(futureCanvasWrapper);
			}
		}

		return wrapper;
	},

	getScripts: function() {
		return [
			"https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.0.0-release/chart.umd.js",
			"https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-datalabels/2.2.0/chartjs-plugin-datalabels.js",
		];
	},

	getStyles: function () {
		return [
			"MMM-SpotPrices.css",
		];
	},

	processData: function(data) {
		var self = this;

		this.dataRequest = {"prices":[]};
		for (let i=0;i<data.data.length;i++){
			this.dataRequest.prices.push({
				"DateTimeUTC": new Date(new Date(data.data[i].DateTime).toUTCString()),
				"Price": ( this.config.includeTax ? ( data.data[i].PriceWithTax * this.config.taxModifier ) : data.data[i].PriceNoTax ) * 100
			});
		}

		//Sort prices
		this.dataRequest.prices.sort((a,b) => (a.DateTimeUTC > b.DateTimeUTC) ? 1 : ((b.DateTimeUTC > a.DateTimeUTC) ? -1 : 0));

		Log.info(this.name,"New data loaded successfully:",this.dataRequest);

		if (this.loaded === false) {
			self.updateDom(self.config.animationSpeed);
			self.loadPricesChart();
		}
		this.loaded = true;
	},

	loadPricesChart: function() {
		var self = this;
		//check and wait if html elements arent ready
		if (document.getElementById("currentPrice") !== null){
			var currentTime = new Date();
			var pastPrices = [];
			var futurePrices = [];
			var currentPrice = null;
			for (let i=0; i<this.dataRequest.prices.length; i++){
				if (this.dataRequest.prices[i].DateTimeUTC - currentTime < -1000*60*60){
					pastPrices.push(this.dataRequest.prices[i]);
				} else if (this.dataRequest.prices[i].DateTimeUTC - currentTime < 0){
					currentPrice = this.dataRequest.prices[i];
					if (this.config.includeCurrent || this.config.includePast){
						futurePrices.push(this.dataRequest.prices[i]);
					}
				} else {
					futurePrices.push(this.dataRequest.prices[i]);
				}
			}
			let numb = Math.round((currentPrice.Price + Number.EPSILON) * 10) / 10;
			document.getElementById("currentPrice").innerHTML = numb.toFixed(1).replace(".",",");

			if (! this.config.Chart){ return; }

			if (this.config.includeCurrent || this.config.includePast){
				if (this.config.includePast){
					this.config.indexOfCurrentPrice = pastPrices.length;
					this.config.chartConfig.options.elements.bar.backgroundColor = color => {
						let colors = color.index == this.config.indexOfCurrentPrice ? "#fff" : "#999";
						return colors;
					}
				}
				else {
					this.config.chartConfig.options.elements.bar.backgroundColor = color => {
						let colors = color.index < 1 ? "#fff" : "#999";
						return colors;
					}
				}
			}
			var xValues = [];
			var yValues = [];
			if (this.config.includePast){
				for (let i=0; i<pastPrices.length; i++){
					yValues.push(pastPrices[i].Price);
					xValues.push(pastPrices[i].DateTimeUTC.getHours());
				}
			}
			for (let i=0; i<futurePrices.length; i++){
				yValues.push(futurePrices[i].Price);
				xValues.push(futurePrices[i].DateTimeUTC.getHours());
			}
			var ctx = document.getElementById("pricesChart").getContext("2d");
			if (typeof this.chart !== 'undefined'){ this.chart.destroy(); }
			this.config.chartConfig.data["labels"] = xValues;
			this.config.chartConfig.data.datasets[0]["data"] = yValues;
			this.chart = new Chart(ctx, this.config.chartConfig);

		} else {
			setTimeout(() => { self.loadPricesChart(); }, 1000);
		}
	},

});
