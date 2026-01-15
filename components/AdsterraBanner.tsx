'use client';

import { useEffect, useRef, useState } from 'react';

type AdsterraProps = {
  height: number;
  width: number;
  data_key: string;
};

export default function AdsterraBanner({ height, width, data_key }: AdsterraProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Supaya tidak render ulang berkali-kali
    if (isLoaded) return;

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    // Kita tulis script iklan di dalam "dunia" iframe itu sendiri
    const scriptContent = `
      <html>
        <body style="margin:0;padding:0;overflow:hidden;display:flex;justify-content:center;align-items:center;">
          <script type="text/javascript">
            atOptions = {
              'key' : '${data_key}',
              'format' : 'iframe',
              'height' : ${height},
              'width' : ${width},
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.highperformanceformat.com/${data_key}/invoke.js"></script>
        </body>
      </html>
    `;

    doc.open();
    doc.write(scriptContent);
    doc.close();
    setIsLoaded(true);
  }, [data_key, height, width, isLoaded]);

  return (
    <div 
      className="flex justify-center items-center my-4 mx-auto overflow-hidden bg-transparent"
      style={{ width: width, height: height }}
    >
      <iframe
        ref={iframeRef}
        width={width}
        height={height}
        scrolling="no"
        frameBorder="0"
        style={{ border: 'none', overflow: 'hidden' }}
        title={`ad-${data_key}`}
      />
    </div>
  );
}