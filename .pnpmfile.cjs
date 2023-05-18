function readPackage(pkg, context) {
	// Override the manifest of foo@1.x after downloading it from the registry
	if (pkg.name === '@remix-project/remix-solidity') {
		// Replace bar@x.x.x with bar@2.0.0
		pkg.dependencies = {
			...pkg.dependencies,
			solc: '^0.8.20'
		}
		context.log('solc version updated to 0.8.20 in @remix-project/remix-solidity')
	}

	// This will change any packages using baz@x.x.x to use baz@1.2.3
	// if (pkg.dependencies.baz) {
	// 	pkg.dependencies.baz = '1.2.3';
	// }

	return pkg
}

module.exports = {
	hooks: {
		readPackage
	}
}
