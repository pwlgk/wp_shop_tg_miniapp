// src/pages/ContentPage.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPageBySlug } from '@/api/services/cms.api';
import { useBackButton } from '@/hooks/useBackButton';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContentBlock } from '@/types';
import { ContentRenderer } from '@/components/shared/ContentRenderer';
import { SmartLinkRenderer } from '@/components/shared/SmartLinkRenderer';
import { BrandHeader } from '@/components/shared/BrandHeader';

// Компонент для рендеринга одного блока
const BlockRenderer = ({ block }: { block: ContentBlock }) => {
    if ('content' in block) {
        if (block.content.trim().startsWith('[')) {
            return <ContentRenderer content={block.content} />;
        }
        switch (block.type) {
            case 'h1': return <h1 className="text-2xl font-bold mt-8 mb-4"><SmartLinkRenderer htmlContent={block.content} /></h1>;
            case 'h2': return <h2 className="text-xl font-semibold mt-6 mb-3"><SmartLinkRenderer htmlContent={block.content} /></h2>;
            case 'h3': return <h3 className="text-lg font-semibold mt-4 mb-2"><SmartLinkRenderer htmlContent={block.content} /></h3>;
            case 'h4': return <h4 className="font-semibold mt-5 mb-2"><SmartLinkRenderer htmlContent={block.content} /></h4>;
            case 'p': return <p className="leading-relaxed my-4"><SmartLinkRenderer htmlContent={block.content} /></p>;
        }
    }
    switch (block.type) {
        case 'ul': return <ul className="list-disc pl-5 my-4 space-y-2">{block.items.map((item, i) => <li key={i}><SmartLinkRenderer htmlContent={item} /></li>)}</ul>;
        case 'ol': return <ol className="list-decimal pl-5 my-4 space-y-2">{block.items.map((item, i) => <li key={i}><SmartLinkRenderer htmlContent={item} /></li>)}</ol>;
        case 'hr': return <hr className="my-6" />;
    }
    return null;
};

const ContentPageSkeleton = () => (
    <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
        <div className="animate-pulse">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full mt-4" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
    </>
);

export const ContentPage = () => {
    const { slug } = useParams<{ slug: string }>();
    useBackButton();

    const { data: page, isLoading, isError } = useQuery({
        queryKey: ['page', slug],
        queryFn: () => getPageBySlug(slug!),
        enabled: !!slug,
    });

    if (isLoading) return <ContentPageSkeleton />;
    if (isError || !page) {
        return (
            <>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
                <div className="p-4 text-center">Не удалось загрузить страницу.</div>
            </>
        );
    }
    
    const shouldSkipFirstBlock = page.blocks[0]?.type === 'h1' && page.blocks[0]?.content === page.title;
    const contentBlocks = shouldSkipFirstBlock ? page.blocks.slice(1) : page.blocks;

    return (
        <div>
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm"><BrandHeader /></header>
            {page.image_url ? (
                <div className="relative w-full h-48">
                    <img src={page.image_url} alt={page.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                        <h1 className="text-2xl font-bold text-white text-shadow">{page.title}</h1>
                    </div>
                </div>
            ) : (
                <div className="p-4 border-b">
                    <h1 className="text-2xl font-bold">{page.title}</h1>
                </div>
            )}

            <article className="prose prose-sm dark:prose-invert max-w-none p-4">
                {contentBlocks.map((block, index) => <BlockRenderer key={index} block={block} />)}
            </article>
        </div>
    );
};