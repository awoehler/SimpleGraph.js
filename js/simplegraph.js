/* Author: Aaron Woehler
 * Copyright: 2013
 * 
 * SimpleGraph.js is based on the Raphaeljs libary (https://github.com/DmitryBaranovskiy/raphael/)
 */
SimpleGraph = function( id, init ){
	var self = this;
	self.status = 'ok';

	//Make sure that the init.settings value is initialized.
	if (typeof init == 'undefined') {
		init = {
			"settings": {}
		};
	} else {
		if( typeof init.settings == 'undefined' ) {
			init.settings = {};
		}
	}
	self.legend = typeof init.settings.legend == 'string' ? init.settings.legend.split(',') : [];
	self.mode = typeof init.settings.mode == 'string' ? init.settings.mode : 'bar_horizontal'; //Options: bar-horizontal, bar-horizontal-stacked, bar-vertical, bar-vertical-stacked, line-horizontal, etc....
	self.width = $(id).width();
	self.height = $(id).height();
	self.bar_attr = typeof init.settings.bar_attr != 'object' ? {
		"fill": "#aba",
		"stroke-width": 0
	} : init.settings.bar_attr;
	self.raphael = new Raphael($(id).attr("id"), self.width, self.height);
	self.grid_spacing = typeof init.settings.grid_spacing == "number" ? init.settings.grid_spacing : 0;
	self.scale_mode =   typeof init.settings.scale_mode == 'string' ?   init.settings.scale_mode : "proportional";
		//Initialize the object.
	if( typeof init.data == 'object') {
		self.data = init.data;
	} else {
		self.data = [];
	}

		//Initialize the legend.
	self.legendWidth = 0;
	if( typeof self.legend == "object" ) {
		for ( var i = 0; i < self.legend.length; i++ ) {
			var tmp = self.raphael.text(0, 0, self.legend[i]).attr({ "text-anchor": "end" });
			//self.legend.push( tmp );
			if (tmp.getBBox().width > self.legendWidth) {
				self.legendWidth = tmp.getBBox().width;
			}
			tmp.remove();
			//tmp.hide();
		}
	}
	this.max = this.maxValue();
}
SimpleGraph.prototype.setCSV = function(values) {
	var v = values.split(',');
	this.data = [];
	for( var i=0; i < v.length; i++ ) {
		if(  v[i] > this.max ) {
			this.max = v[i];
		}
		this.data.push( { "value": v[i] } );
	}
	this.max = this.maxValue();
}

SimpleGraph.prototype.maxValue = function(){
	if (typeof this.data == 'object' && this.data.length > 0) {
		var max = parseFloat( this.data[0].value );
		for (var i = 1; i < this.data.length; i++) {
			if ( parseFloat( this.data[i].value )> max) {
				max = parseFloat( this.data[i].value );
			}
		}
		return max;
	}
	return 0;
}

SimpleGraph.prototype.render = function() {
	try{
		this.raphael.clear();
		if( typeof this[this.mode] != 'function' ) {
			throw( this.mode + ' is not a valid render type' );
		}
		this[this.mode]();
		return this;
	} catch(e) {
		this.status = e;
		this.raphael.text( this.width/2, this.height/2, e );
	}
}


SimpleGraph.prototype.bar_horizontal = function( ) {
	var barWidth = this.height / this.data.length;

		//Determine the maximum width of the legend items.
	var scale = (this.width - this.legendWidth) / this.max;

		//Draw the dark grid lines behind the graph.	
	if( this.grid_spacing > 0 ) {
		for( var i=this.legendWidth; i < this.width; i += ( this.grid_spacing*scale ) ) {
			this.raphael.path("M" + (i + this.legendWidth) + ","+ 0 + ",L" + (i + this.legendWidth) + "," + this.height).attr()
		}
	}
		//Draw the legend.
	left = 0;
	if( typeof this.legend != "undefined" ) {
		for (var i = 0; i < this.legend.length; i++) {
			this.raphael.text( this.legendWidth, i * barWidth + barWidth/2, this.legend[i] ).attr({"text-anchor":"end"});
		}
	}

		//Draw the bars.
	for( var i=0; i < this.data.length; i++ ) {
		if( typeof this.data[i].attr == 'object' ) {
			var attr = this.data[i].attr;
		} else {
			var attr = this.bar_attr;
		}
		attr.title = this.data[i].value;
		this.data[i].bar = this.raphael.rect( this.legendWidth, i * barWidth, (this.data[i].value * scale), barWidth ); //.translate( , 0);
		this.raphael.text( this.legendWidth + 5, i * barWidth + barWidth/2, this.data[i].value );
		this.data[i].bar.attr( attr );
		this.data[i].bar.click( function( a ) {
			//$(a.target) );
		});
	}
		//Draw light grid lines in front of the graph
	if( this.grid_spacing > 0 ) {
		for( var i=this.legendWidth; i < this.width; i += this.grid_spacing*scale ) {
			this.raphael.path("M" + (i + this.legendWidth) + ","+ 0 + ",L" + (i + this.legendWidth) + "," + this.height).attr({"stroke-opacity":0.25});
		}
	}
}

SimpleGraph.prototype.bar_vertical = function( ) {
	var barWidth = this.width / this.data.length;
	var scale = this.height / this.max;
	
		//Draw dark grid lines behind of the graph
	if( this.grid_spacing > 0 ) {
		for( var i=0; i < this.width; i += this.grid_spacing*scale ) {
			this.raphael.path("M0," + i + "L" + this.width + "," + i);
		}
	}

		//Draw the bars.
	for( var i=0; i < this.data.length; i++ ) {
		if( typeof this.data[i].attr == 'object' ) {
			var attr = this.data[i].attr;
		} else {
			var attr = this.bar_attr;
		}
		attr.title = this.data[i].value;
		//x,y,w,h
		var scaled_value = Math.round( this.data[i].value * scale );
		this.raphael.rect( i * barWidth, this.height - scaled_value, barWidth, scaled_value ).attr( attr );
		this.raphael.text( i * barWidth + barWidth/2, this.height - 10, this.data[i].value,"start" );
	}
		//Draw light grid lines in front of the graph
	if( this.grid_spacing > 0 ) {
		for( var i=0; i < this.width; i += this.grid_spacing*scale ) {
			this.raphael.path("M0," + i + "L" + this.width + "," + i).attr({"stroke-opacity":0.25});
		}
	}
}

SimpleGraph.prototype.line_horizontal = function( ) {
	var barWidth = this.width / (this.data.length-1);
	var scale = this.height / this.max;

		//Draw the dark grid lines behind the graph.
	if( this.grid_spacing > 0 ) {
		var lines = 0;
		for( var i=0; i < this.width; i += this.grid_spacing*scale ) {
			this.raphael.path("M0," + i + "L" + this.width + "," + i).attr({"stroke-opacity":0.25});
			lines++;
		}
		for( var i=0; i < lines; i++ ) {
			this.raphael.text( 10, this.height - (this.grid_spacing * i * scale), i );
		}
	}
		//Draw the bars.
	var path = "M0," + (this.height - this.data[0].value * scale );
	for( var i=1; i < this.data.length; i++ ) {
		path += "L" + i*barWidth + "," + (this.height - this.data[i].value * scale);
	}
	this.raphael.path( path );
}

SimpleGraph.prototype.xy_line = function( ) {
	var barWidth = this.width / (this.data.length-1);
	this.maxX = this.data[0].x;
	this.maxY = this.data[0].y;
	this.minX = this.data[0].x;
	this.minY = this.data[0].y;
	for( var i=1; i < this.data.length; i++ ) {
		if( this.data[i].x > this.maxX ) {
			this.maxX = this.data[i].x;
		}
		if( this.data[i].y > this.maxY ) {
			this.maxY = this.data[i].y;
		}
		if( this.data[i].x < this.minX ) {
			this.minX = this.data[i].x;
		}
		if( this.data[i].y < this.minY ) {
			this.minY = this.data[i].y;
		}
	}
	this.scaleX = this.width / (this.maxX - this.minX);
	this.scaleY = this.height / (this.maxY - this.minY);
	switch( this.scale_mode ) {
		case 'proportional':
			if( this.scaleX < this.scaleY ) {
				this.scaleY = this.scaleX;
			} else {
				this.scaleX = this.scaleY;
			}
			break;

		case 'fit':
		default:
	}

		//Draw the dark grid lines behind the graph.
	if( this.grid_spacing > 0 ) {
		var lines = 0;
		for( var i=0; i <= this.width; i += this.grid_spacing*this.scaleY ) {
			this.raphael.path("M0," + ( this.height - i ) + "L" + this.width + "," + (this.height - i ) ).attr({"stroke-opacity":0.25});
			lines++;
		}
		for( var i=0; i <= lines; i++ ) {
			this.raphael.text( 10, this.height - (this.grid_spacing * i * this.scaleY), i );
		}

		lines = 0;
		for( var i=0; i <= this.width; i += this.grid_spacing*this.scaleX ) {
			this.raphael.path("M" + i + ",0L" + i + "," + this.height ).attr({"stroke-opacity":0.25});
			lines++;
		}

		for( var i=0; i <= lines; i++ ) {
			this.raphael.text( (i * this.grid_spacing * this.scaleX), (this.height - 10), i );
		}
	}

		//Draw the line.
	var path = "M"+(this.data[0].x * this.scaleX)+"," + ( this.height -  this.data[0].y * this.scaleY );
	for( var i=1; i < this.data.length; i++ ) {
		path += "L" + (this.data[i].x * this.scaleX) + "," + (this.height -  this.data[i].y * this.scaleY);
	}
	this.raphael.path( path );
}

SimpleGraph.prototype.box_whisker = function( ) {
	var data = [];
	for( var i=0; i < this.data.length; i++ ) {
		data.push( parseFloat( this.data[i].value ) );
	}
	data.sort( function (a, b) {
		return a > b ? 1 : a < b ? -1 : 0;
	});

	var length = data.length;
	var min = data[0];
	var max = data[ data.length - 1 ];
	var middle = (data.length) / 2;
	var h1 = data.slice( 0, Math.floor( data.length/2 ) );	//Return the lower half of the array.
	if( Math.floor( middle ) == middle ) {
		//Even number of elements.
		var h2 = data.slice( middle, data.length );
		var middle_value = (data[ Math.floor( middle ) ] + data[ Math.floor( middle ) - 1 ] ) /2;
	} else {
		//Odd number of elements.
		var h2 = data.slice( Math.ceil( middle ), data.length );
		var middle_value = data[ Math.floor( middle ) ]; 
	}
		//Are the lower/upper halfs even in length or odd?
	if( h1.length % 2 == 0 ) { 	//Even
		var q1_value = ( h1[ h1.length / 2 ] + h1[ h1.length / 2 - 1 ] ) / 2;
		var q3_value = ( h2[ h2.length / 2 ] + h2[ h2.length / 2 - 1 ] ) / 2;
	} else {	//Odd
		var q1_value = h1[ Math.floor( h1.length / 2 )];
		var q3_value = h2[ Math.floor( h2.length / 2 )];
	}

	var scale = this.width / (max - min);
		//Draw the line for Q1 and Q4
	this.raphael.path( "M0," + ( this.height / 2 ) + ",L" + ( this.width ) + "," + ( this.height / 2 ) );
		//Draw the Q2
	bar_width = this.height / 4;
	this.raphael.rect( q1_value * scale - min * scale, bar_width, (middle_value - q1_value) * scale, bar_width * 2  ).attr( { "fill":"#fff" } );
		//Draw Q3
	this.raphael.rect( middle_value * scale - min * scale, bar_width, ( q3_value - middle_value ) * scale, bar_width * 2  ).attr( { "fill":"#fff" } );
}

