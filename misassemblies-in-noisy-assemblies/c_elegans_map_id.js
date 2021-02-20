(function() {
    function makeplot() {
	Plotly.d3.csv("mapping_identity.csv", function(err, rows){

	    function unpack(rows, key) {
		return rows.map(function(row) { return row[key]; });
	    }

	    var data = [];

	    data.push({
		type: 'histogram',
		name: 'C. elegans',
		x: unpack(rows, 'C. elegans'),
	    });

	    data.push({
		type: 'histogram',
		name: 'C. elegans + 3 * Racon',
		x: unpack(rows, 'C. elegans racon'),
	    });
	    
	    Plotly.plot('c_elegans_map_id', data,
			{
			    title: "Distribution of mapping identity",
			});
	});
    }
		      
    makeplot();
})();
