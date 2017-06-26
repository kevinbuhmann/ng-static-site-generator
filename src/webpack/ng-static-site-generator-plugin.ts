import * as chalk from 'chalk';
import { fork } from 'child_process';
import { createHash } from 'crypto';
import * as del from 'del';
import { join as joinPaths } from 'path';
import * as webpack from 'webpack';

import { Options } from '../options';
import { RenderedFile } from './../lib/generate-static-site';
import { safeWriteFileSync } from './../utilities/fs.utilities';
import { blogHashAssetName, generatorScriptAssetName, templateAssetName } from './asset-names';

export class NgStaticSiteGeneratorPlugin {
  private static blogHash: string;
  private static script: string;
  private static template: string;
  private static lastHash: string;
  private static targetCompiler: webpack.Compiler;

  constructor(private options: Options) {}

  apply(compiler: webpack.Compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const blogHashAsset = compilation.assets[blogHashAssetName];
      NgStaticSiteGeneratorPlugin.blogHash = blogHashAsset ? blogHashAsset.source() : NgStaticSiteGeneratorPlugin.blogHash;

      const scriptAsset = compilation.assets[generatorScriptAssetName];
      NgStaticSiteGeneratorPlugin.script = scriptAsset ? scriptAsset.source() : NgStaticSiteGeneratorPlugin.script;

      const templateAsset = compilation.assets[templateAssetName];
      NgStaticSiteGeneratorPlugin.template = templateAsset ? templateAsset.source() : NgStaticSiteGeneratorPlugin.template;

      const currentHash = this.computeHash(NgStaticSiteGeneratorPlugin.blogHash + NgStaticSiteGeneratorPlugin.script + NgStaticSiteGeneratorPlugin.template);

      if (NgStaticSiteGeneratorPlugin.targetCompiler === undefined && templateAsset !== undefined) {
        NgStaticSiteGeneratorPlugin.targetCompiler = compiler;
      }

      const shouldGenerate = NgStaticSiteGeneratorPlugin.blogHash !== undefined
        && NgStaticSiteGeneratorPlugin.script !== undefined
        && NgStaticSiteGeneratorPlugin.template !== undefined
        && NgStaticSiteGeneratorPlugin.lastHash !== currentHash
        && NgStaticSiteGeneratorPlugin.targetCompiler === compiler;

      if (shouldGenerate) {
        console.log(`\n\n${chalk.gray('ng-static-site-generator running...')}\n`);

        NgStaticSiteGeneratorPlugin.lastHash = currentHash;

        this.deleteHtmlFilesExceptTemplate()
          .then(() => this.executeGeneratorScript(compilation))
          .then(() => { callback(); })
          .catch(error => { callback(error); });
      } else {
        callback();
      }
    });
  }

  private deleteHtmlFilesExceptTemplate() {
    return del(['**/*.html', `!**/${templateAssetName}`], { cwd: this.options.distPath });
  }

  private executeGeneratorScript(compilation: any) {
    return new Promise<void>((resolve, reject) => {
      const scriptPath = joinPaths(this.options.distPath, generatorScriptAssetName);
      safeWriteFileSync(scriptPath, NgStaticSiteGeneratorPlugin.script);

      const scriptProcess = fork(scriptPath);
      scriptProcess.send({ template: NgStaticSiteGeneratorPlugin.template });

      scriptProcess.on('message', message => {
        if (message.source === 'ng-static-site-generator') {
          if (message.error) {
            reject(new Error(`ng-static-site-generator encountered an error: ${message.error}`));
          } else if (message.files) {
            this.addRenderedFiles(compilation, message.files);
          }
        }
      });

      scriptProcess.on('exit', code => {
        if (code && code > 0) {
          reject(new Error('ng-static-site-generator exited with an error.'));
        } else {
          resolve();
        }
      });
    });
  }

  private addRenderedFiles(compilation: any, files: RenderedFile[]) {
    for (const file of files.sort((fileA, fileB) => fileA.path.localeCompare(fileB.path))) {
      compilation.assets[file.path] = {
        source: () => file.contents,
        size: () => file.contents.length
      };
    }
  }

  private computeHash(value: string) {
    const sha1 = createHash('sha1');
    return sha1.update(value).digest('hex').substr(0, 20);
  }
}
