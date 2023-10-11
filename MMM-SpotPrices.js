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
		noChart: false,
		sourceApi: "spot-hinta.fi", //other option: porssisahko.fi
		region: "FI"
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

		if (this.config.sourceApi == "spot-hinta.fi"){
			var url = "https://api.spot-hinta.fi/TodayAndDayForward?region=" + this.config.region + "&HomeAssistant=false";
		} else if (this.config.sourceApi == "porssisahko.fi"){
			var url = "https://api.porssisahko.net/v1/latest-prices.json";
		} else {
			Log.error(self.name, "Invalid source api");
			return;
		}
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
			currentPriceHeader.appendChild(document.createTextNode("Sähkön hinta nyt"));
			currentPriceElem.appendChild(currentPriceHeader);
			var currentPriceValue = document.createElement("div");
			currentPriceValue.id = "currentPrice";
                        currentPriceValue.appendChild(document.createTextNode("Ladataan..."));
			currentPriceElem.appendChild(currentPriceValue);
                        var currentPriceSup = document.createElement("div");
                        currentPriceSup.appendChild(document.createTextNode("snt/kWh"));
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
		if (this.config.sourceApi == "spot-hinta.fi"){
			for (let i=0;i<data.data.length;i++){
				this.dataRequest.prices.push({
					"DateTimeUTC": new Date(new Date(data.data[i].DateTime).toUTCString()),
					"PriceWithTax": data.data[i].PriceWithTax * 100
				});
			}
		} else if (this.config.sourceApi == "porssisahko.fi"){
			for (let i=0;i<data.prices.length;i++){
				this.dataRequest.prices.push({
					"DateTimeUTC": new Date(data.prices[i].startDate),
					"PriceWithTax": data.prices[i].price
				});
			}
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
				} else {
					futurePrices.push(this.dataRequest.prices[i]);
				}
			}
			let numb = Math.round((currentPrice.PriceWithTax + Number.EPSILON) * 10) / 10;
			document.getElementById("currentPrice").innerHTML = numb.toFixed(1).replace(".",",");

			if (this.config.noChart){ return; }

			var xValues = [];
			var yValues = [];
			for (let i=0; i<futurePrices.length; i++){
				yValues.push(futurePrices[i].PriceWithTax);
				xValues.push(futurePrices[i].DateTimeUTC.getHours());
			}
			var ctx = document.getElementById("pricesChart").getContext("2d");
			if (typeof this.chart !== 'undefined'){ this.chart.destroy(); }
			this.chart = new Chart(ctx, {
				type: "bar",
				data: {
					labels: xValues,
					datasets: [{
						data: yValues,
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
			});
		} else {
			setTimeout(() => { self.loadPricesChart(); }, 1000);
		}
	},

});
