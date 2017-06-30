import { Directive, HostBinding, Inject, Input, OnInit } from '@angular/core';

import { ModuleOptions } from './../../options';
import { MODULE_OPTIONS } from './../injection-tokens';

@Directive({ selector: 'a' })
export class LinkDirective implements OnInit {
  @Input() href: string;
  @HostBinding('target') target: string;

  constructor(@Inject(MODULE_OPTIONS) private moduleOptions: ModuleOptions) { }

  ngOnInit() {
    if (this.moduleOptions.openExternalLinksInNewTab && this.target === undefined && this.href !== undefined && this.href.startsWith('http')) {
      this.target = '_blank';
    }

    if (typeof window !== 'undefined' && this.target === undefined) {
      this.target = ''; // prevent browser from setting `target="undefined"`
    }
  }
}
