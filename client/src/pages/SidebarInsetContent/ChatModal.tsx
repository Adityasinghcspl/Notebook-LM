import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import { MicIcon, SendHorizonalIcon } from 'lucide-react';
import { useState } from 'react';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store';
import { sendMessage } from '@/redux/features/slice/chatSlice';

const ChatModal = () => {
  const [text, setText] = useState<string>('');
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading } = useSelector((state: RootState) => state.chat);
  const selectedCollection = useSelector((state: RootState) => state.collections?.selectedCollection);
  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) return;

    // ✅ Dispatch Redux thunk (sends request & streams assistant reply)
    if (message.text) {
      dispatch(sendMessage({ collectionName: selectedCollection || '', message: message.text }));
    }
    setText('');
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* Conversation messages */}
      <Conversation>
        <ConversationContent className="flex flex-col gap-3 p-4">
          {messages.map((message, index) => (
            <Message
              from={message.role}
              key={index} // ideally use message.id
              className={`
                last:mb-2
                rounded-lg px-4 py-2 break-words
              `}
            >
              <MessageContent
                className="prose prose-sm tracking-wide leading-loose
                [&_[data-code-block-container='true']]:bg-background
                [&_[data-code-block-container='true']]:my-6"
              >
                {/* Check if the message has code blocks */}
                <Response
                  className="prose prose-sm max-w-full"
                >
                  {message.content}
                </Response>
              </MessageContent>
            </Message>
          ))}

          {/* Loader while assistant is typing */}
          {loading && (
            <Message
              from="assistant"
              key="loading"
              className="rounded-lg px-4 py-2 self-start"
            >
              <MessageContent className="text-base leading-relaxed font-sans">
                <Response>⌛ Thinking...</Response>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input box */}
      <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
        <PromptInputBody className="relative">
          {/* Textarea */}
          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            className="pr-10 text-base text-primary font-sans"
          />

          {/* Mic OR Send Button */}
          <div className="absolute right-2 bottom-2">
            {text.trim().length === 0 ? (
              <PromptInputButton
                onClick={() => setUseMicrophone(!useMicrophone)}
                variant={useMicrophone ? 'default' : 'ghost'}
                size="icon"
                className='p-2 mb-1 mr-1'
              >
                <MicIcon size={18} />
              </PromptInputButton>
            ) : (
              <PromptInputSubmit
                disabled={loading}
                className="p-2 mb-1 mr-2 bg-primary text-white rounded-md"
              >
                <SendHorizonalIcon size={18} />
              </PromptInputSubmit>
            )}
          </div>
        </PromptInputBody>
      </PromptInput>
    </div>
  );
};

export default ChatModal;
