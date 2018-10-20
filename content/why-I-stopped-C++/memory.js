(function() {
    function makeplot() {
	Plotly.d3.csv("alldata.csv", function(data) { processData(data) });
    }

    function processData(allRows) {
	var gb_lang = {};

	for (var i=0; i<allRows.length; i++) {
	    row = allRows[i];

	    var key = row['lang'];
	    if (key == "gpp")
		key = "c++";
	    if (key == "gcc")
		key = "c";

	    if (! (key in gb_lang)) {
		gb_lang[key] = [];
	    }
	    gb_lang[key].push(row['mem(KB)']);
	}

	makePlotly(gb_lang);
    }

    function makePlotly(raw_data) {
	var data = [];
	var index2key = Object.keys(raw_data).sort();
	for (var index in index2key) {
	    var key = index2key[index];
	    data.push({
		y: raw_data[key],
		type: 'box',
		name: key,
		visible: ["c++", "c", "rust", "go", "java"].includes(key) ? true : "legendonly",
	    });
	}

	Plotly.newPlot("memory", data, {title: "Memory usage in Kb by language"});
    }

    makeplot();
})();
