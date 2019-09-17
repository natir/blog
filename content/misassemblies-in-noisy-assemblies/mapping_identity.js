(function() {
    function makeplot() {
	Plotly.d3.csv("mapping_identity.csv", function(err, rows){

	    function unpack(rows, key) {
		return rows.map(function(row) { return row[key]; });
	    }

	    var data = [];

	    data.push({
		type: 'histogram',
		name: 'H. sapiens',
		x: unpack(rows, 'H. sapiens'),
	    });

	    data.push({
		type: 'histogram',
		name: 'C. elegans',
		x: unpack(rows, 'C. elegans'),
	    });

	    data.push({
		type: 'histogram',
		name: 'D. melanogaster',
		x: unpack(rows, 'D. melanogaster'),
	    });

	    Plotly.plot('mapping_identity', data,
			{
			    title: "Distribution of mapping identity",
			    shapes: [{
				type: 'line',
				x0: 95,
				y0: 0,
				x1: 95,
				y1: 240,
				line: {
				    width: 1
				}
			    }],
			});
	});
    }
		      
    makeplot();
})();
