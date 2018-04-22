Ractive.components['example'] = Ractive.extend({
	template: `
		<div style="display:flex;flex-direction:column;{{style}}">
			<nav class="tabs justified">
				<a class-active="view == 'result'" href="#result" on-click="set('view', 'result')">Result</a>
				<a class-active="view == 'template'" href="#template" on-click="set('view', 'template')">Template</a>
				<a class-active="view == 'script'" href="#script" on-click="set('view', 'script')">Script</a>
				<a class-active="view == 'headers'" href="#headers" on-click="set('view', 'headers')">Headers</a>
				<span style="flex:2"></span>
				<a style="flex:0" href="{{url}}">B</a>
				<a style="flex:0" href="https://github.com/dagnelies/ractive-examples/tree/gh-pages/{{url}}">G</a>
				<a style="flex:0" href="editor4panes.html?url={{url}}">E</a>
			</nav>
			
			<div style="border: 5px solid #92bd54;flex:1;">
				{{#if view == 'result'}}
					<iframe style="width:100%;height:100%" src="{{url}}"></iframe>
				{{elseif view == 'template'}}
					<ace value="{{template}}"></ace>
				{{elseif view == 'script'}}
					<ace value="{{script}}" mode="javascript"></ace>
				{{elseif view == 'headers'}}
					<ace value="{{headers}}"></ace>
				{{/if}}
			</div>
		</div>
	`,
	attributes: {
		required: ['url'],
		optional: ['style']
	},
	data: {
		view: 'result',
		script: '',
		template: '',
		headers: ''
	},
	observe: {
		url: function(newUrl) {
			var self = this;
			self.set({
				headers: '',
				template: '',
				script: ''
			})
			//self.updateResult();
			
			if(!newUrl)
				return;
			
			$.ajax({
				url: newUrl, // let's load itself in the example!
				dataType: 'text', // otherwise fails to parse as invalid HTML
				success: function(html) {
					console.log(html)
					function extract(pattern) {
						var matches = pattern.exec(html)
						if( !matches )
							return ''
						else
							return matches[1].replace(/^\t\t?/gm, '')
					}
					self.set({
						headers: extract(/<head>([^]+?)<\/head>/),
						template: extract(/<script +id=.template.*?>([^]+?)<\/script>/),
						script: extract(/<script>([^]+?)<\/script>/)
					})
				},
				error: function(xhr,msg) {
					console.warn(msg)
				}
			});
		}
	}
});