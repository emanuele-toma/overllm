import { FC, TextareaHTMLAttributes, useEffect, useRef } from 'react';

interface AutoResizeTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const AutoResizeTextarea: FC<AutoResizeTextareaProps> = (props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const resize = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      resize();
      textarea.style.overflowY = 'auto';
      textarea.style.resize = 'none';
      textarea.style.scrollbarColor = 'var(--color-neutral-700) transparent';
      textarea.style.scrollbarWidth = 'thin';
      textarea.addEventListener('input', resize);
      return () => textarea.removeEventListener('input', resize);
    }
  }, []);

  return <textarea ref={textareaRef} {...props} />;
};
