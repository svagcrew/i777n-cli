#!/usr/bin/env node
require('ts-node').register();
require('./index.ts');

// TODO: if env is production, use compiled js files
// TODO: add script to commit, push, tag, and publish to npm all libs