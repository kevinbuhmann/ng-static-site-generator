#! /usr/bin/env node

import * as chalk from 'chalk';
import * as program from 'commander';
import { readFileSync } from 'fs';

import { NgStaticSiteGeneratorOptions } from './lib/options';
import { BuildTask } from './tasks/build.task';
import { Task } from './tasks/task';

const options: NgStaticSiteGeneratorOptions = JSON.parse(readFileSync('./ng-static-site-generator.json').toString());

registerCommand('build', 'Builds the static site.', () => new BuildTask(options, false));
registerCommand('watch', 'Builds the static site and rebuilds after changes.', () => new BuildTask(options, true));

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

function registerCommand<TTask extends Task>(command: string, description: string, task: (...args: any[]) => TTask) {
  program
    .command(command)
    .description(description)
    .action((...args: any[]) => task(...args).run().catch(() => { process.exit(1); }));
}
