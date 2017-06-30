import { Injector, Type } from '@angular/core';
import { platformDynamicServer  } from '@angular/platform-server';

export async function getInjector<M>(moduleType: Type<M>): Promise<Injector> {
  const appRef = await platformDynamicServer().bootstrapModule(moduleType);
  return appRef.injector;
}
