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
	}
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

SimpleGraph.prototype.bar_vertical = function( self ) {
	var barWidth = self.width / self.data.length;
	var max = self.data[0].value;
	for( var i=1; i < self.data.length; i++ ) {
		if( self.data[i].value > max ) {
			max = self.data[i].value;
		}
	}
	var scale = self.height / max;
	
		//Draw dark grid lines behind of the graph
	if( self.grid_spacing > 0 ) {
		for( var i=0; i < self.width; i += self.grid_spacing*scale ) {
			self.raphael.path("M0," + i + "L" + self.width + "," + i);
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
		//x,y,w,h
		var scaled_value = Math.round( self.data[i].value * scale );
		self.raphael.rect( i * barWidth, self.height - scaled_value, barWidth, scaled_value ).attr( attr );
		self.raphael.text( i * barWidth + barWidth/2, self.height - 10, self.data[i].value,"start" );
	}
		//Draw light grid lines in front of the graph
	if( self.grid_spacing > 0 ) {
		for( var i=0; i < self.width; i += self.grid_spacing*scale ) {
			self.raphael.path("M0," + i + "L" + self.width + "," + i).attr({"stroke-opacity":0.25});
		}
	}
}
