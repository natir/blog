(function() {
    function makeplot() {
	Plotly.d3.csv("nb_breakpoint.csv", function(data) { processData(data) });
    }

    function processData(allRows) {
	var x = [];
	var hsapiens = [];
	var celegans = [];
	var dmelanog = [];
	for (var i = 0; i < allRows.length; i++) {
	    row = allRows[i];

	    x.push(row["breakpoint_size"]);
	    hsapiens.push(row["H.sapiens"]);
	    celegans.push(row["C.elegans"]);
	    dmelanog.push(row["D.melanogaster"]);   
	}

	var data = [];
	data.push({
	    x: x,
	    y: hsapiens,
	    name: "H. sapiens",
	    type: 'scatter'
	});
	
	data.push({
	    x: x,
	    y: celegans,
	    name: "C. elegans",
	    type: 'scatter'
	});

	data.push({
	    x: x,
	    y: dmelanog,
	    name: "D. Melanogaster",
	    type: 'scatter'
	});
	
	Plotly.newPlot("nb_breakpoint", data, {title: "Number of misassembly when extensive-min-size increase"})
    }

    makeplot();
})();
