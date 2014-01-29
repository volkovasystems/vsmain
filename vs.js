/*:
	We're creating a "god" here.
*/
var http = require( "http" );
var childprocess = require( "child_process" );
var util = require( "util" );
var readline = require( "readline" );
var os = require( "os" );

var work = function work( command, callback ){
	if( !callback ){
		callback = function callback( ){ };
	}

	if( !command || typeof command != "string" ){
		var error = new Error( "invalid command" );
		callback( error );
		return;
	}
	
	var task = childprocess.exec( command );
	var error = "";
	var output = "";
	task.stdout.on( "data",
		function( data ){
			output += data.toString( ).replace( /^\s+|\s+$/g, "" );
		} );
	task.stderr.on( "data",
		function( data ){
			error += data.toString( ).replace( /^\s+|\s+$/g, "" );
		} );
	task.on( "close",
		function( ){
			if( error ){
				error = new Error( error );
				callback( error );
			}else{
				/*
					TODO: Add validation here that 
					will be returned as second parameter.
				*/
				callback( null, true, output );
			}
		} );
};

var osType = function osType( ){
	var type = os.type( ).toLowerCase( );
	var isWindows = false;
	var isLinux = false;
	var isMac = false;
	/*
		This will be extended for other os architectures.
	*/
	if( ( /windows/ ).test( type ) ){
		type = "windows";
		isWindows = true;
	}else if( ( /linux/ ).test( type ) ){
		type = "linux";
		isLinux = true;
	}else if( ( /osx/ ).test( type ) ){
		type = "mac";
		isMac = true;
	}
	//...s

	var osTypeFactory = {
		"toString": function toString( ){
			return type;
		},
		"isWindows": function isWindows( ){
			return isWindows;
		},
		"isLinux": function isLinux( ){
			return isLinux;
		},
		"isMac": function isMac( ){
			return isMac;
		}
	};

	return osTypeFactory;
};

var searchFile = function searchFile( fileName, filePath, callback, depth ){
	if( !callback ){
		callback = function callback( ){ };
	}

	if( !fileName ){
		var error = new Error( "invalid file name" );
		callback( error );q
		return;
	}

	if( !filePath ){
		var error = new Error( "invalid file path" );
		callback( error );
		return;
	}

	if( !depth ){
		depth = 5;
	}

	fs.stat( filePath,
		function( error, fileStatistic ){
			if( error ){
				console.log( error );
				callback( error )
			}else if( fileStatistic.isDirectory( ) ){
				filePath += ( new Array( depth + 1 )).join( "../" );

				var searchCallback = function searchCallback( error, state, output ){
					if( error ){
						console.log( error );
						callback( error );
					}else if( state ){
						callback( null, output );
					}else{
						var error = new Error( "indeterminate result" );
						console.log( error );
						callback( error );
					}
				};

				if( osType( ).isWindows( ) ){
					work( "cd " + filePath + " && dir " + fileName + " /b/s", searchCallback );
				}else{
					work( "find " + filePath + " -name '" + fileName + "'", searchCallback );
				}
			}else{
				var error = new Error( "file path is not a valid directory" );
				console.log( error );
				callback( error );
			}
		} );
};

