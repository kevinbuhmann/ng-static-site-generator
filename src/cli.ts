#! /usr/bin/env node

import { readFileSync } from 'fs';

import { NgStaticSiteGeneratorOptions } from './lib/options';
import { BuildTask } from './tasks/build.task';

const options: NgStaticSiteGeneratorOptions = JSON.parse(readFileSync('./ng-static-site-generator.json').toString());

new BuildTask(options).run()
  .then(() => { process.exit(0); })
  .catch(() => { process.exit(1); });
