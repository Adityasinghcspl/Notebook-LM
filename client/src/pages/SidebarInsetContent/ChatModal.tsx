import { MicIcon, SendHorizonalIcon, SparklesIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Response } from '@/components/ai-elements/response';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import { sendMessage } from '@/redux/features/slice/chatSlice';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/* ─── Typing indicator ─────────────────────────────────────────── */
const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-0.5">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="size-2 rounded-full bg-muted-foreground/60 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
      />
    ))}
  </div>
);

/* ─── Main component ─────────────────────────────────────────────── */
const ChatModal = () => {
  const [text, setText] = useState<string>('');
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading } = useSelector((state: RootState) => state.chat);
  const selectedCollection = useSelector(
    (state: RootState) => state.collections?.selectedCollection
  );

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    dispatch(sendMessage({ collectionName: selectedCollection || '', message: trimmed }));
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // auto-grow
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="relative flex flex-col h-full text-foreground">

      {/* ── Message area ── */}
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="flex flex-col gap-0 pt-6 pb-4 px-4">

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 mb-25 select-none">
              <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 text-primary shadow-inner">
                <SparklesIcon size={28} />
              </div>
              <p className="text-lg font-semibold text-foreground">How can I help you?</p>
              <p className="text-sm text-muted-foreground">
                {selectedCollection
                  ? 'Ask anything about your collection.'
                  : 'Select a source file to get started.'}
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={cn(
                  'group w-full flex gap-3 py-3 px-2 sm:px-6 max-w-4xl mx-auto',
                  isUser ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Assistant avatar */}
                {!isUser && (
                  <div className="flex-shrink-0 mt-0.5 flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <SparklesIcon size={14} />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={cn(
                    'relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words shadow-sm',
                    isUser
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <Response className="prose prose-sm max-w-full dark:prose-invert">
                      {message.content}
                    </Response>
                  )}
                </div>

                {/* User avatar placeholder */}
                {
                  isUser && (
                    <div className="flex-shrink-0 mt-0.5 flex items-center justify-center size-8 rounded-full bg-secondary ring-1 ring-inset ring-border text-xs font-semibold text-muted-foreground select-none">
                      You
                    </div>
                  )
                }
              </div>
            );
          })}

          {/* Loading / typing indicator */}
          {loading && (
            <div className="group w-full flex gap-3 py-3 px-2 sm:px-6 max-w-4xl mx-auto justify-start">
              <div className="flex-shrink-0 mt-0.5 flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <SparklesIcon size={14} />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}
        </ConversationContent>

        {/* Download conversation button */}
        {messages.length > 0 && (
          <ConversationDownload
            messages={messages as any}
            filename="conversation.md"
          />
        )}

        {/* Scroll-to-bottom button – sits above the input bar */}
        <ConversationScrollButton className="bottom-4" />

      </Conversation>

      {/* ── Input bar ── */}
      <div className="shrink-0 z-10 px-4 pb-4 pt-2 rounded-b-xl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-background shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-1.5 max-h-[200px] leading-relaxed"
            />

            <div className="flex items-center gap-1 pb-0.5">
              {/* Mic button */}
              <Button
                type="button"
                variant={useMicrophone ? 'default' : 'ghost'}
                size="icon"
                className="size-8 rounded-full shrink-0"
                onClick={() => setUseMicrophone((v) => !v)}
              >
                <MicIcon size={16} />
              </Button>

              {/* Send button */}
              <Button
                type="button"
                size="icon"
                onClick={handleSubmit}
                disabled={!text.trim() || loading}
                className="size-8 rounded-full shrink-0 bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                <SendHorizonalIcon size={15} />
              </Button>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-2 select-none">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div >
  )
}

export default ChatModal;
