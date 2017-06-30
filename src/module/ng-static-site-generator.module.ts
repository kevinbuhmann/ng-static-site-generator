import { ModuleWithProviders, NgModule } from '@angular/core';

import { ModuleOptions } from '../options';
import { LinkDirective } from './directives/link.directive';
import { MODULE_OPTIONS } from './injection-tokens';
import { BlogService } from './services/blog.service';

const declarations = [
  LinkDirective
];

@NgModule({
  providers: [
    BlogService
  ],
  declarations: [
    ...declarations
  ],
  exports: [
    ...declarations
  ]
})
export class NgStaticSiteGeneratorModule {
  static forRoot(options: ModuleOptions): ModuleWithProviders {
    return {
      ngModule: NgStaticSiteGeneratorModule,
      providers: [
        { provide: MODULE_OPTIONS, useValue: options }
      ]
    };
  }
}
