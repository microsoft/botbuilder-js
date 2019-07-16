/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LGTemplate } from './lgTemplate';
import { LGImport } from './lgImport';
import { ImportResolver, ImportResolverDelegate } from './importResolver';
import { LGParser } from './lgParser';

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

   public discoverLGResources(importResolver: ImportResolverDelegate) : LGResource[] {
      const resourcesFound: LGResource[] = [];
      importResolver = importResolver === undefined ? ImportResolver.fileResolver: importResolver;
      this.resolveImportResources(this, importResolver, resourcesFound);

      return resourcesFound;
   }

   private resolveImportResources(start: LGResource, importResolver: ImportResolverDelegate, resourcesFound: LGResource[]): void {
      const resourceIds: string[] = start.Imports.map((lg: LGImport) => lg.Id);
      resourcesFound.push(start);

      resourceIds.forEach((resourceId: string) => {
         try {
            const { content, id } = importResolver(start.Id, resourceId);
            const childResource: LGResource = LGParser.parse(content, id);

            if (!(resourcesFound.some((x: LGResource) => x.Id === childResource.Id))) {
                  this.resolveImportResources(childResource, importResolver, resourcesFound);
            }
         } catch (e) {
            throw new Error(`[Error]${resourceId}:${e.message}`);
         }
      });
   }
}