// src/components/shared/SmartLinkRenderer.tsx
import { Link } from 'react-router-dom';
import parse, { domToReact, type HTMLReactParserOptions, Element, type DOMNode } from 'html-react-parser';

export const SmartLinkRenderer = ({ htmlContent }: { htmlContent: string }) => {
    const options: HTMLReactParserOptions = {
        replace: (domNode) => {
            if (domNode instanceof Element && domNode.attribs && domNode.name === 'a') {
                const href = domNode.attribs.href;
                
                // Приводим children к типу DOMNode[]
                const children = domNode.children as DOMNode[];

                if (href && href.startsWith('/')) {
                    return (
                        <Link to={href} className="text-primary underline hover:no-underline">
                            {domToReact(children, options)}
                        </Link>
                    );
                }
                
                return (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                        {domToReact(children, options)}
                    </a>
                );
            }
        },
    };

    return <>{parse(htmlContent, options)}</>;
};