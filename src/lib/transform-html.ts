import { parse, serialize, AST } from 'parse5';

export type NodeVisitor = (node: any) => void;

export function transformHtml(html: string, visitors: NodeVisitor[]) {
  if (html) {
    const document = parse(html) as AST.Default.Document;
    visitNode(document, visitors);
    return serialize(document);
  }
}

export function removeInnerHtmlAttributes(node: any) {
  if (node.attrs) {
    const element = node as AST.Default.Element;
    const innerHtmlAttributeIndex = element.attrs.findIndex(attr => attr.name === 'innerhtml');

    if (innerHtmlAttributeIndex > -1) {
      element.attrs.splice(innerHtmlAttributeIndex, 1);
    }
  }
}

function visitNode(node: any, visitors: NodeVisitor[]) {
  for (const visitor of visitors) {
    visitor(node);
  }

  if (node.childNodes) {
    for (const childNode of node.childNodes) {
      visitNode(childNode, visitors);
    }
  }
}
