import { InjectionToken } from '@angular/core';

import { GeneratorOptions, ModuleOptions } from './../options';

export const PRODUCTION = new InjectionToken<boolean>('PRODUCTION');
export const MODULE_OPTIONS = new InjectionToken<ModuleOptions>('MODULE_OPTIONS');
export const GENERATOR_OPTIONS = new InjectionToken<GeneratorOptions>('GENERATOR_OPTIONS');
