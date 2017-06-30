import { Directive, HostBinding, Inject, Input, OnInit } from '@angular/core';

import { ModuleOptions } from './../../options';
import { MODULE_OPTIONS } from './../injection-tokens';

const browser = typeof window !== 'undefined';

@Directive({ selector: 'a' })
export class LinkDirective implements OnInit {
  @Input() href: string;
  @HostBinding('rel') rel: string;
  @HostBinding('target') target: string;

  constructor(@Inject(MODULE_OPTIONS) private moduleOptions: ModuleOptions) { }

  ngOnInit() {
    if (this.moduleOptions.openExternalLinksInNewTab && this.href !== undefined && this.href.startsWith('http')) {
      this.rel = 'noopener noreferrer';
      this.target = '_blank';
    }

    if (browser && this.rel === undefined) {
      this.rel = ''; // prevent browser from setting `rel="undefined"`
    }

    if (browser && this.target === undefined) {
      this.target = ''; // prevent browser from setting `target="undefined"`
    }
  }
}
