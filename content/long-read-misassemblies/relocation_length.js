(function() {
    function makeplot() {
	Plotly.d3.csv("relocation_length.csv", function(err, rows){
	    
	    function unpack(rows, key) {
		return rows.map(function(row) { return row[key]; });
	    }

	    var data = [];
	    
	    data.push({
		type: 'box',
		name: 'H. sapiens',
		x: unpack(rows, 'H. sapiens'),
	    });

	    data.push({
		type: 'box',
		name: 'C. elegans',
		x: unpack(rows, 'C. elegans'),
	    });

	    data.push({
		type: 'box',
		name: 'D. melanogasterx',
		x: unpack(rows, 'D. melanogaster'),
	    });
	    
	    Plotly.plot('relocation_length', data, {title: "Relocation length distribution", xaxis:{ range: [-30000, 32000] } });
	});
    }

    makeplot();
})();
