export interface NgStaticSiteGeneratorOptions {
  appModule: string;
  appComponent: string;
  appRoutes: string;
  distPath: string;
  blogPath: string;
  stylesPath: string;
  templatePath: string;

  /* Options for client app. If mainPath is not set, the client app will not be set. polyfillsPath is optional. */
  mainPath?: string;
  polyfillsPath?: string;
}
