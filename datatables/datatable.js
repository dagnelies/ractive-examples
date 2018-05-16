

Ractive.components['datatable'] = Ractive.extend({
	lazy: true,
	template: `<table class="table table-striped table-hover table-condensed" tabindex="0" on-keypress="@.onkeypress(@event)">
		{{#if ~/headers}}
			<thead>
				<tr>
					{{#each ~/headers}}
						<th on-click="@.sortBy(@index)">{{.}} {{>sortArrow}}</th>
					{{/each}}
				</tr>
			</thead>
		{{/if}}
		<tbody>
			{{#each indexes as i}}
				<tr class-info="@index == ~/selectedIndex" on-click="@.select(@index)">
					{{#if @.partials.content}}
						{{yield with ~/rows[i] as row}}
					{{else}}
						{{#each ~/fields as f}}
							<td>{{~/rows[i][f]}}</td>
						{{/each}}
					{{/if}}
				</tr>
			{{/each}}
		</tbody>
	</table>
	`,
	partials: {
		sortArrow: `{{#if ~/sortby == ~/fields[@index]}}&#9660;{{elseif ~/sortby == '-' + ~/fields[@index]}}&#9650;{{/if}}` // down or up symbols
	},
	mapAll: true,
	attributes: {
		required: ['rows'],
		optional: [
			'fields', 'headers',
			'selectable', 'multiselect', 'navigable', 'sortable',
			'selectedIndex', 'selected', 
			'url', 'prefix',
			'sortby', 'filter',
			'class', 'style', 'row-class'
		]
	},
	computed: {
		indexes: function() {
			var rows = this.get('rows')
			if( !rows )
				return [];
			
			var filter = this.get('filter')
			var sortby = this.get('sortby')
			
			function compare(a,b) {
				
				if (a > b) {
					return 1;
				}
				if (a < b) {
					return -1;
				}
				return 0;
			}
			
			function findAny(obj, str) {
				str = str.toLowerCase()
				for(var key in obj) {
					var value = String(obj[key]).toLowerCase()
					if( value.indexOf(str) >= 0 )
						return true;
				}
				return false;
			}
			
			if( !filter && !sortby ) {
				// just get the indexes
				result = rows.map( function(val,i) { return i; } )
			}
			else {
				// index it
				var result = rows.map( function(val,i) { return {index:i, value:val}; } )
				
				// filter it
				if( filter )
					result = result.filter( function(entry) { return findAny(entry.value, filter); } )
				// sort it
				if( sortby ) {
					var reverse = (sortby.charAt(0) === '-')
					if( !reverse ) {
						result = result.sort( function(a,b) { return compare(a.value[sortby], b.value[sortby]); } )
					}
					else {
						sortby = sortby.substr(1)
						result = result.sort( function(b,a) { return compare(a.value[sortby], b.value[sortby]); } )
					}
				}
				
				// we need indexes only
				result = result.map( function(entry){ return entry.index; } );
			}
			
			return result;
		}
	},
	onkeypress: function(event) {
		if( !this.get('navigable') )
			return;
		console.log(event);
		
		var sel = this.get('selectedIndex');
		var len = this.get('rows.length');
		
		if( event.keyCode == 38 && sel > 0 ) // up
			this.set('selectedIndex', sel-1);
		else if( event.keyCode == 40 && sel < len-1 ) // down
			this.set('selectedIndex', sel+1);
	},
	sortBy: function(index) {
		if( !this.get('sortable') )
			return;
		var field = this.get('fields.' + index);
		var current = this.get('sortby');
		
		if( current == field )
			this.set('sortby', '-' + field); // reverse sort
		else if( current == '-' + field )
			this.set('sortby', null);
		else
			this.set('sortby', field);
	},
	select: function(index) {
		if( !this.get('selectable') )
			return;
			
		this.set('selectedIndex', index);
	},
	observe: {
		selectable: function(value) {
			if( !value )
				this.set('selectedIndex', null);
		},
		selectedIndex: function(value) {
			if( value >= 0 ) {
				//this.set('rows.' + value, 'selected')
				this.updating = true;
				this.set('selected', this.get('rows.' + value));
				this.updating = false;
			}
		},
		selected: function(value) {
			if( this.updating )
				return;
			this.updating = true;
			this.set('rows.' + this.get('selectedIndex'), value);
			this.updating = false;
		},
		'rows.*': function(value, old, kp) {
			console.log(kp);
			if( this.updating )
				return;
			if( !kp.endsWith('.' + this.get('selectedIndex') ) )
				return;
			this.updating = true;
			this.set('selected', value);
			this.updating = false;
		},
		url: function(value) {
			if( !value )
				return;
			
			var self = this;
			var prefix = this.get('prefix');
			this.set('rows', []);
			this.set('loading', value);
			$.ajax({
				url: value,
				success: function(data) {
					if( !prefix )
						self.set('rows', data);
					else
						self.set('rows', data[prefix]);
					console.log(self.get('rows'));
					self.set('loading', null)
				}
			})
		}
	}
})



