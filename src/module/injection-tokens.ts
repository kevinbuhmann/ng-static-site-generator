import { InjectionToken } from '@angular/core';

import { GeneratorOptions } from './../options';

export const PRODUCTION = new InjectionToken<boolean>('PRODUCTION');
export const GENERATOR_OPTIONS = new InjectionToken<GeneratorOptions>('GENERATOR_OPTIONS');
