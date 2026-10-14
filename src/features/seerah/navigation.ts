import { router } from 'expo-router';

import type { NodeType } from './services/connections';

/** Opens the detail screen of any Seerah content node. */
export function openNode(type: NodeType | 'source', id: string): void {
  switch (type) {
    case 'episode':
      router.push({ pathname: '/seerah/episode/[id]', params: { id } });
      return;
    case 'event':
      router.push({ pathname: '/seerah/event/[id]', params: { id } });
      return;
    case 'person':
      router.push({ pathname: '/seerah/person/[id]', params: { id } });
      return;
    case 'place':
      router.push({ pathname: '/seerah/place/[id]', params: { id } });
      return;
    case 'theme':
      router.push({ pathname: '/seerah/theme/[id]', params: { id } });
      return;
    case 'source':
      router.push({ pathname: '/seerah/source/[id]', params: { id } });
      return;
  }
}

export function openConnections(type: NodeType, id: string): void {
  router.push({ pathname: '/seerah/connections/[type]/[id]', params: { type, id } });
}
