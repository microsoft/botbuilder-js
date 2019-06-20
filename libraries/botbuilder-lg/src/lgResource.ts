/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LGTemplate } from './lgTemplate';
import { LGImport } from './lgImport';

/**
 * LG Resource
 */
export class LGResource {

   public Id: string;

   public Templates: LGTemplate[];

   public Imports: LGImport[];

   constructor(templates: LGTemplate[], imports: LGImport[], id: string = '') {
      this.Templates = templates;
      this.Imports = imports;
      this.Id = id;
   }
}