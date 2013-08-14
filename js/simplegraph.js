/* Author: Aaron Woehler
 * Copyright: 2013
 * 
 * SimpleGraph.js is based on the Raphaeljs libary (https://github.com/DmitryBaranovskiy/raphael/)
 */
SimpleGraph = function( id, init ) {
	var self = this;
	self.status = 'ok';

		//Make sure that the init.settings value is initialized.
	if( typeof init == 'undefined' ) {
		init = { "settings": {} };
	} else if( typeof init.settings == 'undefined' ) {
		init.settings = {};
	}

	self.mode = typeof init.settings.mode == 'string' ? init.settings.mode : 'bar_horizontal';	//Options: bar-horizontal, bar-horizontal-stacked, bar-vertical, bar-vertical-stacked, line-horizontal, etc....
	self.width = $(id).width();
	self.height = $(id).height();
	self.bar_attr = typeof init.settings.bar_attr != 'object' ? { "fill":"#aba", "stroke-width":0 } : init.settings.bar_attr;
	self.raphael = new Raphael( $(id).attr("id"), self.width, self.height );
	self.grid_spacing = typeof init.settings.grid_spacing == "number" ? init.settings.grid_spacing : 0 ;
	if( typeof init.data == 'object' ) {
		self.data = init.data;
	} else {
		self.data = [];
	}

	self.render = function() {
		try{ 
			self.raphael.clear();
			if( typeof self[self.mode] != 'function' ) {
				throw( self.mode + ' is not a valid render type' );
			}
			self[self.mode]( self );
			return this;
		} catch(e) {
			self.status = e;
			self.raphael.text( self.width/2, self.height/2, e );
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

SimpleGraph.prototype.bar_horizontal = function( self ) {
	var barWidth = self.height / self.data.length;
	var max = self.data[0].value;
	for( var i=1; i < self.data.length; i++ ) {
		if( self.data[i].value > max ) {
			max = self.data[i].value;
		}
	}
	var scale = self.width / max;
	
		//Draw the dark grid lines behind the graph.	
	if( self.grid_spacing > 0 ) {
		for( var i=0; i < self.width; i += self.grid_spacing*scale ) {
			self.raphael.path("M" + i + ",0,L" + i + "," + self.height).attr();
		}
	}
		//Draw the bars.
	for( var i=0; i < self.data.length; i++ ) {
		if( typeof self.data[i].attr == 'object' ) {
			var attr = self.data[i].attr;
		} else {
			var attr = self.bar_attr;
		}
		attr.title = self.data[i].value;
		self.data[i].bar = self.raphael.rect( 0, i * barWidth, self.data[i].value * scale, barWidth );
		self.raphael.text( 5, i * barWidth + barWidth/2, self.data[i].value );
		self.data[i].bar.attr( attr );
		self.data[i].bar.click( function( a ) {
			//$(a.target) );
		});
		//.glow().id;
	}
		//Draw light grid lines in front of the graph
	if( self.grid_spacing > 0 ) {
		for( var i=0; i < self.width; i += self.grid_spacing*scale ) {
			self.raphael.path("M" + i + ",0,L" + i + "," + self.height).attr({"stroke-opacity":0.25});
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
	var max = this.data[0].value;
	for( var i=1; i < this.data.length; i++ ) {
		if( this.data[i].value > max ) {
			max = this.data[i].value;
		}
	}
	var scale = this.height / max;

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
	var path = "M0," + this.data[0].value * scale;
	for( var i=1; i < this.data.length; i++ ) {
		path += "L" + i*barWidth + "," + (this.height - this.data[i].value * scale);
	}
	this.raphael.path( path );
}
