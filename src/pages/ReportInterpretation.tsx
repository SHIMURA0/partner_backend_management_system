import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Upload, message, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined, MinusOutlined, FilePdfOutlined, MenuUnfoldOutlined, MenuFoldOutlined, AppstoreOutlined } from '@ant-design/icons';
import { AIChat } from './AIChat';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// 配置 worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

export default function ReportInterpretation() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.1);
  const [showSidebar, setShowSidebar] = useState(true);
  const [containerWidth, setContainerWidth] = useState(480);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // PDF 加载成功
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  // 拖拽分割条
  function handleMouseDown(e: React.MouseEvent) {
    setDragging(true);
    const startX = e.clientX;
    const startWidth = containerWidth;
    function onMouseMove(ev: MouseEvent) {
      const newWidth = Math.max(320, Math.min(800, startWidth + ev.clientX - startX));
      setContainerWidth(newWidth);
    }
    function onMouseUp() {
      setDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  // 上传PDF
  const beforeUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      message.error('只支持PDF文件');
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    return false;
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-blue-50 to-white">
      {/* 左侧PDF预览区 */}
      <div
        ref={containerRef}
        className="h-full flex flex-col bg-white shadow-lg rounded-r-lg transition-all duration-200 relative"
        style={{ width: containerWidth, minWidth: 320, maxWidth: 800 }}
      >
        {/* 操作栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Upload beforeUpload={beforeUpload} showUploadList={false}>
              <Tooltip title="上传PDF"><Button icon={<FilePdfOutlined />}>上传PDF</Button></Tooltip>
            </Upload>
            <Tooltip title="上一页"><Button icon={<LeftOutlined />} disabled={pageNumber <= 1} onClick={() => setPageNumber(p => Math.max(1, p - 1))} /></Tooltip>
            <span className="text-sm text-gray-600 select-none">{pageNumber} / {numPages || '--'}</span>
            <Tooltip title="下一页"><Button icon={<RightOutlined />} disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} /></Tooltip>
            <Tooltip title="缩小"><Button icon={<MinusOutlined />} disabled={scale <= 0.6} onClick={() => setScale(s => Math.max(0.6, s - 0.1))} /></Tooltip>
            <Tooltip title="放大"><Button icon={<PlusOutlined />} disabled={scale >= 2} onClick={() => setScale(s => Math.min(2, s + 0.1))} /></Tooltip>
            <Tooltip title={showSidebar ? '隐藏缩略图' : '显示缩略图'}>
              <Button icon={showSidebar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />} onClick={() => setShowSidebar(s => !s)} />
            </Tooltip>
          </div>
        </div>
        {/* PDF内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 侧边栏缩略图 */}
          {showSidebar && (
            <div className="w-20 bg-gray-50 border-r flex flex-col items-center overflow-y-auto py-2">
              {pdfUrl && numPages > 0 && Array.from({ length: numPages }).map((_, idx) => (
                <div
                  key={idx}
                  className={`mb-2 rounded border cursor-pointer overflow-hidden ${pageNumber === idx + 1 ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => setPageNumber(idx + 1)}
                  style={{ boxShadow: pageNumber === idx + 1 ? '0 0 0 2px #3b82f6' : undefined }}
                >
                  <Document file={pdfUrl} loading="" onLoadSuccess={() => {}}>
                    <Page pageNumber={idx + 1} width={60} renderTextLayer={false} renderAnnotationLayer={false} />
                  </Document>
                </div>
              ))}
            </div>
          )}
          {/* 主PDF显示区 */}
          <div className="flex-1 flex items-center justify-center bg-white">
            {pdfUrl ? (
              <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} loading={<span className="text-gray-400">加载中...</span>}>
                <Page pageNumber={pageNumber} scale={scale} />
              </Document>
            ) : (
              <div className="text-gray-400 text-lg">请上传PDF文件进行预览</div>
            )}
          </div>
        </div>
      </div>
      {/* 拖拽分割条 */}
      <div
        className={`w-2 h-full cursor-col-resize bg-gradient-to-b from-gray-200 to-gray-100 hover:from-blue-200 hover:to-blue-100 transition-all duration-200 z-10 ${dragging ? 'bg-blue-300' : ''}`}
        onMouseDown={handleMouseDown}
        style={{ userSelect: 'none' }}
      />
      {/* 右侧AI助手区 */}
      <div className="flex-1 h-full bg-transparent flex flex-col">
        <AIChat />
      </div>
    </div>

  );
} 