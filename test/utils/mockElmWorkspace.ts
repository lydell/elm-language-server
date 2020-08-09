import * as Path from "path";
import { container } from "tsyringe";
import { URI } from "vscode-uri";
import Parser, { Tree } from "web-tree-sitter";
import { IElmWorkspace } from "../../src/elmWorkspace";
import { IForest } from "../../src/forest";
import { Imports } from "../../src/imports";

export const baseUri = Path.join(__dirname, "../sources/src/");

export class MockElmWorkspace implements IElmWorkspace {
  private imports!: Imports;
  private forest: IForest;
  private parser: Parser;

  constructor(sources: { [K: string]: string }) {
    this.forest = container.resolve("Forest");
    this.parser = container.resolve("Parser");
    this.imports = new Imports();

    for (const key in sources) {
      if (Object.prototype.hasOwnProperty.call(sources, key)) {
        this.parseAndAddToForest(key, sources[key]);
      }
    }
  }

  init(): void {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasDocument(uri: URI): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasPath(uri: URI): boolean {
    return false;
  }

  getForest(): IForest {
    return this.forest;
  }

  getImports(): Imports {
    return this.imports;
  }

  getRootPath(): URI {
    return URI.file(Path.join(__dirname, "sources"));
  }

  private parseAndAddToForest(fileName: string, source: string): void {
    const tree: Tree | undefined = this.parser.parse(source);
    this.forest.setTree(
      URI.file(baseUri + fileName).toString(),
      true,
      true,
      tree,
      true,
    );

    this.imports.updateImports(URI.file(baseUri + fileName).toString(), tree);
  }
}
