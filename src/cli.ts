#! /usr/bin/env node

import * as chalk from 'chalk';
import * as program from 'commander';
import { readFileSync } from 'fs';

import { Options } from './options';
import { BuildMode, BuildTask } from './tasks/build.task';
import { Task } from './tasks/task';

const options: Options = JSON.parse(readFileSync('./ng-static-site-generator.json').toString());

registerCommand('build', 'Builds the static site.', build)
  .option('--prod', 'Production build.');

registerCommand('watch', 'Builds the static site and rebuilds after changes.', watch);

program.parse(process.argv);

if (process.argv.slice(2).length === 0) {
  program.outputHelp(((help: string) => chalk.red(help)) as any);
} else {
  const validCommands = program.commands.map((command: any) => command.name);
  const invalidCommands = program.args.filter((command: any) => typeof command === 'string' && validCommands.indexOf(command) === -1);

  if (invalidCommands.length > 0) {
    console.log(chalk.red(`[ERROR] - Invalid command: ${invalidCommands.join(', ')}`));
    program.outputHelp(((help: string) => chalk.red(help)) as any);
  }
}

function build(flags: { prod: boolean }) {
  const buildMode = flags.prod ? BuildMode.ProductionBuild : BuildMode.Build;
  return new BuildTask(buildMode, options);
}

function watch() {
  return new BuildTask(BuildMode.Watch, options);
}

function registerCommand<TTask extends Task>(command: string, description: string, task: (flags: any) => TTask) {
  return program
    .command(command)
    .description(description)
    .action((flags: any) => task(flags).run().catch(() => { process.exit(1); }));
}
