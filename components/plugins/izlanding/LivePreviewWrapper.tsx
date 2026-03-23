'use client';

import { useState, useEffect } from 'react';
import { LandingBlock, LandingRenderer } from './LandingRenderer';

export default function LivePreviewWrapper({ initialBlocks }: { initialBlocks: LandingBlock[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow receiving messages from the dashboard editor
      if (event.data?.type === 'IZLANDING_UPDATE_BLOCKS') {
        setBlocks(event.data.blocks);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <LandingRenderer blocks={blocks} />;
}
