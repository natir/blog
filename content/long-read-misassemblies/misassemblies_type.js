(function() {
    function makeplot() {
	Plotly.d3.csv("misassemblies_type.csv", function(data) { processData(data) });
    }

    function processData(allRows) {

	var x = [];
	var hsrelocations = [];
	var hstranslocations = [];
	var hsinversions = [];
	var cerelocations = [];
	var cetranslocations = [];
	var ceinversions = [];
	var dmrelocations = [];
	var dmtranslocations = [];
	var dminversions = [];
	
	for (var i = 0; i < allRows.length; i++) {
	    row = allRows[i];

	    x.push(row["breakpoint_size"]);
	    hsrelocations.push(row["hsrelocations"]);
	    hstranslocations.push(row["hstranslocations"]);
	    hsinversions.push(row["hsinversions"]);
	    cerelocations.push(row["cerelocations"]);
	    cetranslocations.push(row["cetranslocations"]);
	    ceinversions.push(row["ceinversions"]);
	    dmrelocations.push(row["dmrelocations"]);
	    dmtranslocations.push(row["dmtranslocations"]);
	    dminversions.push(row["dminversions"]);
	}

	var data = [];
	
	data.push({
	    x: x,
	    y: hsrelocations,
	    name: "H. sapiens relocations",
	    type: 'scatter',
	    visible: true,
	});
	data.push({
	    x: x,
	    y: hstranslocations,
	    name: "H. sapiens translocations",
	    type: 'scatter',
	    visible: "legendonly",
	});
	data.push({
	    x: x,
	    y: hsinversions,
	    name: "H. sapiens inversions",
	    type: 'scatter',
	    visible: "legendonly",
	});
	
	data.push({
	    x: x,
	    y: cerelocations,
	    name: "C. elegans relocations",
	    type: 'scatter',
	    visible: true,
	});
	data.push({
	    x: x,
	    y: cetranslocations,
	    name: "C. elegans translocations",
	    type: 'scatter',
	    visible: "legendonly",
	});
	data.push({
	    x: x,
	    y: ceinversions,
	    name: "C. elegans inversions",
	    type: 'scatter',
	    visible: "legendonly",
	});

	data.push({
	    x: x,
	    y: dmrelocations,
	    name: "D. melanogaster relocations",
	    type: 'scatter',
	    visible: true,
	});
	data.push({
	    x: x,
	    y: dmtranslocations,
	    name: "D. melanogaster translocations",
	    type: 'scatter',
	    visible: "legendonly",
	});
	data.push({
	    x: x,
	    y: dminversions,
	    name: "D. melanogaster inversions",
	    type: 'scatter',
	    visible: "legendonly",
	});

	
	Plotly.newPlot("misassemblies_type", data, {title: "Number of relocation, translocation and inversion when extensive-min-size increase"})
    }

    makeplot();
})();
