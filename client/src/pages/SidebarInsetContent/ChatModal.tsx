import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
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

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: { type: 'text'; text: string }[];
};

const ChatModal = () => {
  const [text, setText] = useState<string>('');
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);

  // ✅ Hold all messages in state
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) return;

    // Add user message to conversation
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        parts: [{ type: 'text', text: message.text || '' }],
      },
    ]);

    setText('');

    // (Optional) Mock AI reply so conversation feels alive
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          parts: [{ type: 'text', text: '🤖 This is a demo assistant reply!' }],
        },
      ]);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      {/* ✅ Show conversation messages */}
      <Conversation>
        <ConversationContent>
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, i) =>
                  part.type === 'text' ? (
                    <Response key={`${message.id}-${i}`}>
                      {part.text}
                    </Response>
                  ) : null
                )}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* ✅ Input box */}
      <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
        <PromptInputBody className="relative">
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>

          <PromptInputTextarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            className="pr-10"
          />

          {/* Mic OR Send Button */}
          <div className="absolute right-2 bottom-2">
            {text.trim().length === 0 ? (
              <PromptInputButton
                onClick={() => setUseMicrophone(!useMicrophone)}
                variant={useMicrophone ? 'default' : 'ghost'}
                size="icon"
              >
                <MicIcon size={18} />
              </PromptInputButton>
            ) : (
              <PromptInputSubmit
                disabled={false}
                status="ready"
                className="p-2 bg-primary text-white"
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
