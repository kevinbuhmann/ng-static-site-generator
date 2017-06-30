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

export function makeExternalLinksTargetBlank(node: any) {
  if (node.tagName === 'a') {
    const linkElement = node as AST.Default.Element;
    const targetAttr = linkElement.attrs.find(attr => attr.name === 'target');
    const hrefAttr = linkElement.attrs.find(attr => attr.name === 'href');
    const href = hrefAttr ? hrefAttr.value : undefined;

    if (targetAttr === undefined && href && href.startsWith('http')) {
      linkElement.attrs.push({ name: 'target', value: '_blank'});
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
