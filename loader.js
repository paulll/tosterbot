var fs = require('fs'),
	path = require('path'),
	async = require('async'),
	graph = new (require('dependency-graph').DepGraph);

console.log('AI system is initializing..')

fs.readdir('./modules/', function (error, nodes) {
	if (error) { throw error; }

	async.map(nodes, function (value, callback) {
		fs.readFile(path.join('modules', value, 'module.json'), {encoding: 'UTF-8'}, callback);
	}, function (error, modules) {
		if (error) { throw error; }

		console.log('Found', modules.lengh, 'modules');
		console.log('Building dependency graph');

		var tab = {};

		try {
			modules = modules.map(JSON.parse);			
		} catch (error) {
			modules.forEach(function (m) {
				try {
					JSON.parse(m);
				} catch (e) {
					console.log('Could not parse JSON:\n', m);
					throw error;
				}
			});
		}

		modules.forEach(function (module) {
			if (!module.disabled) {
				graph.addNode(module.name);
				tab[module.name] = module;
			}
		});

		modules.forEach(function (module) {

			if (module.disabled) {return;}

			if (module.hasOwnProperty('deps')) {
				module.deps.forEach(function (dep) {
					graph.addDependency(module.name, dep);
				});
			}
			if (module.hasOwnProperty('before')) {
				module.before.forEach(function (dep) {
					graph.addDependency(dep, module.name);
				});
			}
			if (module.hasOwnProperty('deps_npm')) {
				module.deps_npm.forEach(function(dep) {
					if (dep.shared) {
						if (!require.resolve(dep.name)) {
							console.log('Shit happened: не хватает npm-модуля', dep.name);
							process.exit(1);
						}
					} else {
						// todo
					}
				});
			}
			if (module.hasOwnProperty('deps_files')) {
				module.deps_files.forEach(function(dep) {
					if (!fs.existsSync(dep)) {
						console.log('Shit happened: не хватает файла', dep);
						process.exit(1);
					}
				});
			}
		});

		console.log('Reached loading state');

		try {
			graph.overallOrder().forEach(function (module) {
				console.log('Loading:', module);
				require('./' + path.join('modules', module, tab[module].main));
			});
			console.log('Everything seems to be ready');
		} catch (error) {
			throw error;
			console.log('Shit happened:', error.message);
			process.exit(1);
		}
	});
});