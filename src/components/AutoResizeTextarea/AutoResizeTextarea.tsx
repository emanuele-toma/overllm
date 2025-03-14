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
      textarea.style.overflowY = 'hidden';
      textarea.addEventListener('input', resize);
      return () => textarea.removeEventListener('input', resize);
    }
  }, []);

  return <textarea ref={textareaRef} {...props} />;
};
