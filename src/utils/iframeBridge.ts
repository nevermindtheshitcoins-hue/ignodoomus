interface BaseMessage {
  source: 'dpss-console';
}

interface ReadyMessage extends BaseMessage {
  type: 'ready';
  version: string;
  height: number;
}

interface ResizeMessage extends BaseMessage {
  type: 'resize';
  height: number;
}

interface PongMessage extends BaseMessage {
  type: 'pong';
  version: string;
}

type OutgoingMessage = ReadyMessage | ResizeMessage | PongMessage;

type IncomingMessage =
  | { type: 'dpss:focus-root' }
  | { type: 'dpss:scroll-top'; behavior?: ScrollBehavior }
  | { type: 'dpss:ping' }
  | { type: 'dpss:resize-request' }
  | { type: string };

const SOURCE = 'dpss-console' as const;
const VERSION = '1.0.0';

const postToParent = (message: OutgoingMessage) => {
  if (typeof window === 'undefined' || window.parent === window) {
    return;
  }

  window.parent.postMessage(message, '*');
};

const readDocumentHeight = (): number => {
  if (typeof document === 'undefined') {
    return 0;
  }

  const { body, documentElement } = document;
  if (!body || !documentElement) {
    return 0;
  }

  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    documentElement.clientHeight,
    documentElement.scrollHeight,
    documentElement.offsetHeight,
  );
};

export const initializeIframeBridge = (rootElement: HTMLElement): (() => void) => {
  if (typeof window === 'undefined' || window.parent === window) {
    return () => undefined;
  }

  const sendReady = () => {
    postToParent({
      source: SOURCE,
      type: 'ready',
      version: VERSION,
      height: readDocumentHeight(),
    });
  };

  const sendResize = () => {
    postToParent({
      source: SOURCE,
      type: 'resize',
      height: readDocumentHeight(),
    });
  };

  const handleMessage = (event: MessageEvent<IncomingMessage>) => {
    if (!event.data || typeof event.data.type !== 'string') {
      return;
    }

    switch (event.data.type) {
      case 'dpss:focus-root':
        if (typeof rootElement.focus === 'function') {
          rootElement.focus();
        }
        break;
      case 'dpss:scroll-top':
        window.scrollTo({ top: 0, behavior: event.data.behavior ?? 'smooth' });
        break;
      case 'dpss:ping':
        postToParent({ source: SOURCE, type: 'pong', version: VERSION });
        break;
      case 'dpss:resize-request':
        sendResize();
        break;
      default:
        break;
    }
  };

  window.addEventListener('message', handleMessage);

  let disconnectObserver: () => void = () => undefined;

  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(() => {
      sendResize();
    });
    observer.observe(document.body);
    disconnectObserver = () => observer.disconnect();
  } else {
    const resizeListener = () => sendResize();
    window.addEventListener('resize', resizeListener);
    window.addEventListener('orientationchange', resizeListener);
    disconnectObserver = () => {
      window.removeEventListener('resize', resizeListener);
      window.removeEventListener('orientationchange', resizeListener);
    };
  }

  sendReady();

  return () => {
    window.removeEventListener('message', handleMessage);
    disconnectObserver();
  };
};
